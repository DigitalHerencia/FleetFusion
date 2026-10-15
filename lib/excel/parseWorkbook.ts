import {
  columnLettersToIndex,
  parseDelimitedText,
  readZip,
  unescapeXml,
  type WorkbookCell,
  type WorkbookSheet,
} from './utils';

export interface ParseWorkbookOptions {
  delimiter?: string;
  sheetName?: string;
}

function requiredEntry(files: Map<string, Uint8Array>, name: string): string {
  const entry = files.get(name);
  if (!entry) throw new TypeError(`The XLSX workbook is missing "${name}".`);
  return Buffer.from(entry).toString('utf8');
}

function xmlAttribute(tag: string, attribute: string): string | undefined {
  const escaped = attribute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`\\b${escaped}="([^"]*)"`, 'i').exec(tag);
  return match?.[1] ? unescapeXml(match[1]) : undefined;
}

function readSharedStrings(files: Map<string, Uint8Array>): string[] {
  const data = files.get('xl/sharedStrings.xml');
  if (!data) return [];
  return [
    ...Buffer.from(data)
      .toString('utf8')
      .matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g),
  ].map(([, content]) =>
    [...content!.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)]
      .map(([, text]) => unescapeXml(text!))
      .join(''),
  );
}

function readCellValue(tag: string, content: string, sharedStrings: string[]): WorkbookCell {
  const type = xmlAttribute(tag, 't');
  if (type === 'inlineStr') {
    return [...content.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)]
      .map(([, text]) => unescapeXml(text!))
      .join('');
  }
  const value = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(content)?.[1];
  if (value === undefined) return null;
  const decoded = unescapeXml(value);
  if (type === 's') {
    const index = Number.parseInt(decoded, 10);
    if (!Number.isInteger(index) || sharedStrings[index] === undefined) {
      throw new TypeError(`The workbook references missing shared string ${decoded}.`);
    }
    return sharedStrings[index]!;
  }
  if (type === 'b') return decoded === '1';
  if (type === 'str' || type === 'e') return decoded;
  const number = Number(decoded);
  return Number.isFinite(number) ? number : decoded;
}

function readWorksheet(xml: string, name: string, sharedStrings: string[]): WorkbookSheet {
  const rows: WorkbookCell[][] = [];
  for (const [, rowContent] of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const row: WorkbookCell[] = [];
    let sequentialColumn = 0;
    for (const [, cellTag, cellContent] of rowContent!.matchAll(
      /(<c\b[^>]*)(?:\/>|>([\s\S]*?)<\/c>)/g,
    )) {
      const reference = xmlAttribute(cellTag!, 'r');
      const columnLetters = reference ? /^[A-Z]+/i.exec(reference)?.[0] : undefined;
      const columnIndex = columnLetters ? columnLettersToIndex(columnLetters) : sequentialColumn;
      row[columnIndex] = readCellValue(cellTag!, cellContent ?? '', sharedStrings);
      sequentialColumn = columnIndex + 1;
    }
    rows.push(row.map((value) => value ?? null));
  }
  return { name, rows };
}

function parseXlsx(input: Uint8Array): WorkbookSheet[] {
  const files = readZip(input);
  const workbookXml = requiredEntry(files, 'xl/workbook.xml');
  const relationshipsXml = requiredEntry(files, 'xl/_rels/workbook.xml.rels');
  const relationshipTargets = new Map<string, string>();
  for (const [tag] of relationshipsXml.matchAll(/<Relationship\b[^>]*\/?>/g)) {
    const id = xmlAttribute(tag!, 'Id');
    const target = xmlAttribute(tag!, 'Target');
    if (id && target) relationshipTargets.set(id, target);
  }
  const sharedStrings = readSharedStrings(files);
  const sheets: WorkbookSheet[] = [];
  for (const [tag] of workbookXml.matchAll(/<sheet\b[^>]*\/?>/g)) {
    const name = xmlAttribute(tag!, 'name');
    const relationshipId = xmlAttribute(tag!, 'r:id');
    const target = relationshipId ? relationshipTargets.get(relationshipId) : undefined;
    if (!name || !target)
      throw new TypeError('The XLSX workbook contains an invalid worksheet relationship.');
    const path = target.startsWith('/') ? target.slice(1) : `xl/${target.replace(/^\/+/, '')}`;
    const normalizedPath = path
      .split('/')
      .reduce<string[]>((parts, segment) => {
        if (segment === '..') parts.pop();
        else if (segment !== '.') parts.push(segment);
        return parts;
      }, [])
      .join('/');
    sheets.push(readWorksheet(requiredEntry(files, normalizedPath), name, sharedStrings));
  }
  if (!sheets.length) throw new TypeError('The XLSX workbook has no worksheets.');
  return sheets;
}

function normalizeInput(input: Uint8Array | ArrayBuffer | string): Uint8Array {
  return typeof input === 'string'
    ? Buffer.from(input, 'utf8')
    : input instanceof ArrayBuffer
      ? new Uint8Array(input)
      : input;
}

export function parseWorkbook(
  input: Uint8Array | ArrayBuffer | string,
  options: ParseWorkbookOptions = {},
): WorkbookSheet[] {
  const bytes = normalizeInput(input);
  const isXlsx =
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07);
  let sheets = isXlsx
    ? parseXlsx(bytes)
    : [
        {
          name: options.sheetName ?? 'Sheet1',
          rows: parseDelimitedText(
            Buffer.from(bytes)
              .toString('utf8')
              .replace(/^\uFEFF/, ''),
            options.delimiter ?? ',',
          ),
        },
      ];
  if (options.sheetName) {
    sheets = sheets.filter((sheet) => sheet.name === options.sheetName);
    if (!sheets.length) throw new RangeError(`Worksheet "${options.sheetName}" was not found.`);
  }
  return sheets;
}
