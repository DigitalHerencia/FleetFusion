import { inflateSync } from 'node:zlib';

export type PdfInput = Uint8Array | ArrayBuffer | string;

export function toPdfBytes(input: PdfInput): Uint8Array {
  return typeof input === 'string'
    ? Buffer.from(input, 'latin1')
    : input instanceof ArrayBuffer
      ? new Uint8Array(input)
      : input;
}

export function assertPdf(input: PdfInput): Uint8Array {
  const bytes = toPdfBytes(input);
  if (
    bytes.length < 8 ||
    Buffer.from(bytes.subarray(0, 8)).toString('latin1').slice(0, 5) !== '%PDF-'
  ) {
    throw new TypeError('The input is not a valid PDF document (missing %PDF- header).');
  }
  return bytes;
}

export function escapePdfText(value: string): string {
  return [...value]
    .map((character) => {
      const code = character.codePointAt(0)!;
      const byte = code <= 0xff ? code : 0x3f;
      if (byte === 0x28 || byte === 0x29 || byte === 0x5c) return `\\${String.fromCharCode(byte)}`;
      if (byte < 0x20 || byte > 0x7e) return `\\${byte.toString(8).padStart(3, '0')}`;
      return String.fromCharCode(byte);
    })
    .join('');
}

export function createTextPdf(
  title: string,
  lines: readonly string[],
  options: {
    pageWidth?: number;
    pageHeight?: number;
    fontSize?: number;
    linesPerPage?: number;
  } = {},
): Uint8Array {
  const pageWidth = options.pageWidth ?? 612;
  const pageHeight = options.pageHeight ?? 792;
  const fontSize = options.fontSize ?? 10;
  const linesPerPage = options.linesPerPage ?? 52;
  const contentLines = [title, ...lines].flatMap((line) => {
    const charsPerLine = Math.max(20, Math.floor((pageWidth - 96) / (fontSize * 0.55)));
    if (!line) return [''];
    const wrapped: string[] = [];
    for (let index = 0; index < line.length; index += charsPerLine) {
      wrapped.push(line.slice(index, index + charsPerLine));
    }
    return wrapped;
  });
  const pageLines: string[][] = [];
  for (let index = 0; index < contentLines.length; index += linesPerPage) {
    pageLines.push(contentLines.slice(index, index + linesPerPage));
  }
  if (!pageLines.length) pageLines.push([title]);

  const objects = new Map<number, Buffer>();
  const pageIds = pageLines.map((_, index) => 4 + index * 2);
  objects.set(1, Buffer.from('<< /Type /Catalog /Pages 2 0 R >>', 'latin1'));
  objects.set(
    2,
    Buffer.from(
      `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`,
      'latin1',
    ),
  );
  objects.set(3, Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', 'latin1'));

  pageLines.forEach((page, index) => {
    const pageId = pageIds[index]!;
    const contentId = pageId + 1;
    const content = [
      'BT',
      `/F1 ${fontSize} Tf`,
      `48 ${pageHeight - 52} Td`,
      `${fontSize + 4} TL`,
      ...page.flatMap((line, lineIndex) =>
        lineIndex === 0 ? [`(${escapePdfText(line)}) Tj`] : ['T*', `(${escapePdfText(line)}) Tj`],
      ),
      'ET',
    ].join('\n');
    const contentBytes = Buffer.from(content, 'latin1');
    objects.set(
      pageId,
      Buffer.from(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`,
        'latin1',
      ),
    );
    objects.set(
      contentId,
      Buffer.concat([
        Buffer.from(`<< /Length ${contentBytes.length} >>\nstream\n`, 'latin1'),
        contentBytes,
        Buffer.from('\nendstream', 'latin1'),
      ]),
    );
  });

  const chunks: Buffer[] = [Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'latin1')];
  const offsets = [0];
  let position = chunks[0]!.length;
  for (let id = 1; id <= objects.size; id += 1) {
    const object = objects.get(id);
    if (!object) throw new Error(`PDF object ${id} was not generated.`);
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
  const xref = [
    `xref\n0 ${objects.size + 1}`,
    '0000000000 65535 f ',
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `),
    `trailer\n<< /Size ${objects.size + 1} /Root 1 0 R >>`,
    `startxref\n${xrefOffset}`,
    '%%EOF\n',
  ].join('\n');
  chunks.push(Buffer.from(xref, 'latin1'));
  return Buffer.concat(chunks);
}

function decodeLiteralString(value: string): string {
  const output: number[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index]!;
    if (character !== '\\') {
      output.push(character.charCodeAt(0));
      continue;
    }
    const escaped = value[++index];
    if (escaped === undefined) break;
    if (escaped === 'n') output.push(10);
    else if (escaped === 'r') output.push(13);
    else if (escaped === 't') output.push(9);
    else if (escaped === 'b') output.push(8);
    else if (escaped === 'f') output.push(12);
    else if (escaped === '\n') continue;
    else if (escaped === '\r') {
      if (value[index + 1] === '\n') index += 1;
    } else if (/[0-7]/.test(escaped)) {
      let octal = escaped;
      for (let count = 0; count < 2 && /[0-7]/.test(value[index + 1] ?? ''); count += 1) {
        octal += value[++index];
      }
      output.push(Number.parseInt(octal, 8));
    } else output.push(escaped.charCodeAt(0));
  }
  return Buffer.from(output).toString('latin1');
}

function decodeHexString(value: string): string {
  const normalized = value.replace(/\s/g, '');
  const padded = normalized.length % 2 ? `${normalized}0` : normalized;
  return Buffer.from(padded, 'hex').toString('latin1');
}

export function extractPdfTextStreams(input: PdfInput): string[] {
  const bytes = assertPdf(input);
  const raw = Buffer.from(bytes).toString('latin1');
  const streams: string[] = [];
  const streamPattern =
    /((?:<<[\s\S]*?>>)\s*)stream(?:\r\n|\n|\r)([\s\S]*?)(?:\r\n|\n|\r)endstream/g;
  for (const match of raw.matchAll(streamPattern)) {
    const dictionary = match[1] ?? '';
    const encoded = Buffer.from(match[2] ?? '', 'latin1');
    try {
      const content = dictionary.includes('/FlateDecode')
        ? inflateSync(encoded).toString('latin1')
        : encoded.toString('latin1');
      streams.push(content);
    } catch (error) {
      if (dictionary.includes('/FlateDecode')) {
        throw new TypeError(
          `Unable to decompress a PDF FlateDecode stream: ${error instanceof Error ? error.message : String(error)}`,
          { cause: error },
        );
      }
    }
  }
  return streams;
}

export function decodePdfTextOperators(stream: string): string[] {
  const texts: string[] = [];
  const expression =
    /\(((?:\\[\s\S]|[^\\)])*)\)\s*Tj|<([0-9a-f\s]+)>\s*Tj|\[((?:[\s\S]*?))\]\s*TJ/g;
  for (const match of stream.matchAll(expression)) {
    if (match[1] !== undefined) texts.push(decodeLiteralString(match[1]));
    else if (match[2] !== undefined) texts.push(decodeHexString(match[2]));
    else if (match[3] !== undefined) {
      for (const token of match[3].matchAll(/\(((?:\\[\s\S]|[^\\)])*)\)|<([0-9a-f\s]+)>/gi)) {
        if (token[1] !== undefined) texts.push(decodeLiteralString(token[1]));
        else if (token[2] !== undefined) texts.push(decodeHexString(token[2]));
      }
    }
  }
  return texts;
}
