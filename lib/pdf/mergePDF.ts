import { assertPdf, type PdfInput } from './utils';

interface PdfObject {
  id: number;
  generation: number;
  body: string;
}

interface ParsedPdf {
  objects: Map<string, PdfObject>;
  copiedObjects: Map<string, number>;
  pageIds: string[];
}

function objectKey(id: number, generation: number): string {
  return `${id}:${generation}`;
}

function parseDocument(input: PdfInput): ParsedPdf {
  const bytes = assertPdf(input);
  const source = Buffer.from(bytes).toString('latin1');
  if (/\/Encrypt\b/.test(source)) throw new TypeError('Encrypted PDF documents cannot be merged.');
  if (/\/Type\s*\/(?:XRef|ObjStm)\b/.test(source)) {
    throw new TypeError(
      'PDF merge does not support cross-reference streams or compressed object streams.',
    );
  }

  const objects = new Map<string, PdfObject>();
  for (const match of source.matchAll(
    /(?:^|[\r\n])\s*(\d+)\s+(\d+)\s+obj\b([\s\S]*?)\bendobj\b/g,
  )) {
    const id = Number(match[1]);
    const generation = Number(match[2]);
    objects.set(objectKey(id, generation), { id, generation, body: match[3]!.trim() });
  }
  if (!objects.size) throw new TypeError('The PDF contains no readable indirect objects.');

  const trailers = [...source.matchAll(/trailer\s*<<(.*?)>>/gs)];
  const rootReference = trailers.at(-1)?.[1]?.match(/\/Root\s+(\d+)\s+(\d+)\s+R/);
  if (!rootReference)
    throw new TypeError('PDF merge requires a classic trailer with a /Root reference.');
  const catalog = objects.get(objectKey(Number(rootReference[1]), Number(rootReference[2])));
  const pagesReference = catalog?.body.match(/\/Pages\s+(\d+)\s+(\d+)\s+R/);
  if (!pagesReference)
    throw new TypeError('The PDF catalog does not reference a readable page tree.');

  const pageIds: string[] = [];
  const visited = new Set<string>();
  const visitPageNode = (id: number, generation: number): void => {
    const key = objectKey(id, generation);
    if (visited.has(key)) throw new TypeError('The PDF page tree contains a cycle.');
    visited.add(key);
    const pageNode = objects.get(key);
    if (!pageNode) throw new TypeError(`The PDF page tree references missing object ${key}.`);
    if (/\/Type\s*\/Page\b/.test(pageNode.body)) {
      pageIds.push(key);
      return;
    }
    if (!/\/Type\s*\/Pages\b/.test(pageNode.body)) {
      throw new TypeError(`PDF object ${key} is not a page or page-tree node.`);
    }
    const kids = pageNode.body.match(/\/Kids\s*\[([\s\S]*?)\]/)?.[1];
    if (!kids) throw new TypeError(`PDF page-tree node ${key} has no readable /Kids array.`);
    const references = [...kids.matchAll(/(\d+)\s+(\d+)\s+R/g)];
    if (!references.length) throw new TypeError(`PDF page-tree node ${key} contains no pages.`);
    for (const reference of references) visitPageNode(Number(reference[1]), Number(reference[2]));
  };
  visitPageNode(Number(pagesReference[1]), Number(pagesReference[2]));

  const excluded = new Set([objectKey(Number(rootReference[1]), Number(rootReference[2]))]);
  for (const [key, object] of objects) {
    if (/\/Type\s*\/Pages\b/.test(object.body)) excluded.add(key);
  }
  return {
    objects,
    pageIds,
    copiedObjects: new Map(
      [...objects.keys()].filter((key) => !excluded.has(key)).map((key) => [key, 0]),
    ),
  };
}

function rewriteBody(body: string, mapping: Map<string, number>, pageObject: boolean): string {
  const streamOffset = body.search(/\bstream(?:\r\n|\n|\r)/);
  const dictionary = streamOffset >= 0 ? body.slice(0, streamOffset) : body;
  const stream = streamOffset >= 0 ? body.slice(streamOffset) : '';
  let rewritten = dictionary.replace(
    /(\d+)\s+(\d+)\s+R/g,
    (reference, id: string, generation: string) => {
      const nextId = mapping.get(objectKey(Number(id), Number(generation)));
      return nextId === undefined ? reference : `${nextId} 0 R`;
    },
  );
  if (pageObject) {
    if (/\/Parent\s+\d+\s+\d+\s+R/.test(rewritten)) {
      rewritten = rewritten.replace(/\/Parent\s+\d+\s+\d+\s+R/, '/Parent 2 0 R');
    } else {
      rewritten = rewritten.replace(/>>\s*$/, '/Parent 2 0 R >>');
    }
  }
  return rewritten + stream;
}

export function mergePDF(inputs: readonly PdfInput[]): Uint8Array {
  if (inputs.length === 0) throw new TypeError('At least one PDF document is required.');
  if (inputs.length === 1) return Uint8Array.from(assertPdf(inputs[0]!));

  const documents = inputs.map(parseDocument);
  let nextId = 3;
  for (const document of documents) {
    for (const key of document.copiedObjects.keys()) document.copiedObjects.set(key, nextId++);
  }
  const allPageIds = documents.flatMap((document) =>
    document.pageIds.map((key) => document.copiedObjects.get(key)!),
  );
  if (allPageIds.some((id) => !Number.isInteger(id))) {
    throw new TypeError('A PDF page references an unsupported page-tree object.');
  }
  const mergedObjects = new Map<number, Buffer>();
  mergedObjects.set(1, Buffer.from('<< /Type /Catalog /Pages 2 0 R >>', 'latin1'));
  mergedObjects.set(
    2,
    Buffer.from(
      `<< /Type /Pages /Kids [${allPageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${allPageIds.length} >>`,
      'latin1',
    ),
  );
  for (const document of documents) {
    for (const [key, id] of document.copiedObjects) {
      const object = document.objects.get(key)!;
      const body = rewriteBody(object.body, document.copiedObjects, document.pageIds.includes(key));
      mergedObjects.set(id, Buffer.from(body, 'latin1'));
    }
  }

  const chunks: Buffer[] = [Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'latin1')];
  const offsets = [0];
  let position = chunks[0]!.length;
  for (let id = 1; id <= mergedObjects.size; id += 1) {
    const object = mergedObjects.get(id);
    if (!object) throw new Error(`Merged PDF object ${id} is missing.`);
    offsets[id] = position;
    const chunk = Buffer.concat([
      Buffer.from(`${id} 0 obj\n`, 'latin1'),
      object,
      Buffer.from('\nendobj\n', 'latin1'),
    ]);
    chunks.push(chunk);
    position += chunk.length;
  }
  const xrefOffset = position;
  chunks.push(
    Buffer.from(
      [
        `xref\n0 ${mergedObjects.size + 1}`,
        '0000000000 65535 f ',
        ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `),
        `trailer\n<< /Size ${mergedObjects.size + 1} /Root 1 0 R >>`,
        `startxref\n${xrefOffset}`,
        '%%EOF\n',
      ].join('\n'),
      'latin1',
    ),
  );
  return Buffer.concat(chunks);
}
