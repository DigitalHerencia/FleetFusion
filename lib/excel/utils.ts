import { deflateRawSync, inflateRawSync } from 'node:zlib';

export type WorkbookCell = string | number | boolean | Date | null | undefined;
export type WorkbookRow = readonly WorkbookCell[] | Readonly<Record<string, WorkbookCell>>;

export interface WorkbookSheet {
  name: string;
  rows: readonly WorkbookRow[];
}

export interface NormalizedWorkbookSheet {
  name: string;
  rows: WorkbookCell[][];
}

export function columnIndexToLetters(index: number): string {
  if (!Number.isInteger(index) || index < 0)
    throw new RangeError('Column index must be a non-negative integer.');
  let number = index + 1;
  let letters = '';
  while (number > 0) {
    const remainder = (number - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    number = Math.floor((number - 1) / 26);
  }
  return letters;
}

export function columnLettersToIndex(letters: string): number {
  if (!/^[A-Z]+$/i.test(letters)) throw new TypeError('Column letters must contain only A-Z.');
  return (
    [...letters.toUpperCase()].reduce(
      (index, letter) => index * 26 + letter.charCodeAt(0) - 64,
      0,
    ) - 1
  );
}

export function escapeXml(value: string): string {
  const validXml = [...value]
    .filter((character) => {
      const code = character.codePointAt(0)!;
      return (
        code === 0x09 ||
        code === 0x0a ||
        code === 0x0d ||
        (code >= 0x20 && code <= 0xd7ff) ||
        (code >= 0xe000 && code <= 0xfffd) ||
        (code >= 0x10000 && code <= 0x10ffff)
      );
    })
    .join('');
  return validXml
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function unescapeXml(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#([0-9]+);/g, (_, decimal: string) =>
      String.fromCodePoint(Number.parseInt(decimal, 10)),
    )
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&amp;', '&');
}

export function normalizeSheets(
  input: readonly WorkbookSheet[] | Readonly<Record<string, readonly WorkbookRow[]>>,
): NormalizedWorkbookSheet[] {
  const sheets = Array.isArray(input)
    ? [...input]
    : Object.entries(input).map(([name, rows]) => ({ name, rows }));
  if (sheets.length === 0) throw new TypeError('A workbook must contain at least one sheet.');
  const seen = new Set<string>();
  return sheets.map(({ name, rows }) => {
    const safeName = name.trim();
    if (!safeName || safeName.length > 31 || /[\\/?*[\]:]/.test(safeName)) {
      throw new TypeError(
        `Invalid worksheet name "${name}". Names must be 1-31 characters and cannot contain \\ / ? * [ ] :`,
      );
    }
    if (seen.has(safeName.toLowerCase()))
      throw new TypeError(`Duplicate worksheet name "${safeName}".`);
    seen.add(safeName.toLowerCase());
    return { name: safeName, rows: normalizeRows(rows) };
  });
}

export function normalizeRows(rows: readonly WorkbookRow[]): WorkbookCell[][] {
  const recordRows = rows.filter((row) => !Array.isArray(row));
  const headers = [
    ...new Set(recordRows.flatMap((row) => Object.keys(row as Record<string, WorkbookCell>))),
  ];
  const normalized = rows.map((row) => {
    if (Array.isArray(row)) return row.map(normalizeCell);
    const record = row as Readonly<Record<string, WorkbookCell>>;
    return headers.map((header) => normalizeCell(record[header]));
  });
  return recordRows.length && !rows.some(Array.isArray)
    ? [[...headers], ...normalized]
    : normalized;
}

function normalizeCell(value: WorkbookCell): WorkbookCell {
  if (value === undefined || value === null) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime()))
      throw new TypeError('Invalid Date values cannot be written to a workbook.');
    return value;
  }
  if (typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  throw new TypeError(`Unsupported workbook cell value: ${String(value)}.`);
}

export function parseDelimitedText(text: string, delimiter = ','): string[][] {
  if (delimiter.length !== 1 || delimiter === '\r' || delimiter === '\n' || delimiter === '"') {
    throw new TypeError('The delimiter must be one non-quote character.');
  }
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]!;
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"' && field.length === 0) quoted = true;
    else if (character === delimiter) {
      row.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field);
      if (row.some((cell) => cell !== '') || rows.length > 0) rows.push(row);
      row = [];
      field = '';
    } else field += character;
  }
  if (quoted) throw new SyntaxError('The delimited text contains an unclosed quoted field.');
  row.push(field);
  if (row.some((cell) => cell !== '') || rows.length > 0) rows.push(row);
  return rows;
}

export function serializeDelimitedText(
  rows: readonly (readonly unknown[])[],
  delimiter = ',',
): string {
  if (delimiter.length !== 1 || delimiter === '\r' || delimiter === '\n' || delimiter === '"') {
    throw new TypeError('The delimiter must be one non-quote character.');
  }
  return rows
    .map((row) =>
      row
        .map((value) => {
          const text =
            value instanceof Date ? value.toISOString() : value == null ? '' : String(value);
          return text.includes(delimiter) || /["\r\n]/.test(text)
            ? `"${text.replaceAll('"', '""')}"`
            : text;
        })
        .join(delimiter),
    )
    .join('\r\n');
}

interface ZipEntry {
  name: string;
  data: Uint8Array;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function createZip(entries: readonly ZipEntry[]): Uint8Array {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const plain = Buffer.from(entry.data);
    const compressed = deflateRawSync(plain);
    const checksum = crc32(plain);
    const local = Buffer.alloc(30 + name.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(plain.length, 22);
    local.writeUInt16LE(name.length, 26);
    name.copy(local, 30);
    locals.push(local, compressed);

    const central = Buffer.alloc(46 + name.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(plain.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    name.copy(central, 46);
    centrals.push(central);
    offset += local.length + compressed.length;
  }
  const centralDirectory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralDirectory, end]);
}

export function readZip(input: Uint8Array): Map<string, Uint8Array> {
  const data = Buffer.from(input);
  let endOffset = -1;
  const minOffset = Math.max(0, data.length - 65_557);
  for (let index = data.length - 22; index >= minOffset; index -= 1) {
    if (data.readUInt32LE(index) === 0x06054b50) {
      endOffset = index;
      break;
    }
  }
  if (endOffset < 0) throw new TypeError('The workbook is not a valid ZIP-based XLSX file.');
  const count = data.readUInt16LE(endOffset + 10);
  let offset = data.readUInt32LE(endOffset + 16);
  const files = new Map<string, Uint8Array>();
  for (let index = 0; index < count; index += 1) {
    if (data.readUInt32LE(offset) !== 0x02014b50)
      throw new TypeError('The XLSX central directory is invalid.');
    const method = data.readUInt16LE(offset + 10);
    const compressedSize = data.readUInt32LE(offset + 20);
    const nameLength = data.readUInt16LE(offset + 28);
    const extraLength = data.readUInt16LE(offset + 30);
    const commentLength = data.readUInt16LE(offset + 32);
    const localOffset = data.readUInt32LE(offset + 42);
    const name = data.toString('utf8', offset + 46, offset + 46 + nameLength);
    if (data.readUInt32LE(localOffset) !== 0x04034b50)
      throw new TypeError(`XLSX entry "${name}" is invalid.`);
    const localNameLength = data.readUInt16LE(localOffset + 26);
    const localExtraLength = data.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = data.subarray(start, start + compressedSize);
    let contents: Buffer;
    if (method === 0) contents = Buffer.from(compressed);
    else if (method === 8) contents = inflateRawSync(compressed);
    else throw new TypeError(`XLSX compression method ${method} is not supported.`);
    files.set(name, contents);
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return files;
}
