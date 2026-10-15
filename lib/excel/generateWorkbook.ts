import {
  columnIndexToLetters,
  createZip,
  escapeXml,
  type NormalizedWorkbookSheet,
  normalizeSheets,
  serializeDelimitedText,
  type WorkbookCell,
  type WorkbookRow,
  type WorkbookSheet,
} from './utils';

export interface GenerateWorkbookOptions {
  format?: 'xlsx' | 'csv';
  delimiter?: string;
}

function cellXml(value: WorkbookCell, reference: string): string {
  if (value === null || value === undefined) return `<c r="${reference}"/>`;
  if (typeof value === 'number') return `<c r="${reference}"><v>${value}</v></c>`;
  if (typeof value === 'boolean') return `<c r="${reference}" t="b"><v>${value ? 1 : 0}</v></c>`;
  const text = value instanceof Date ? value.toISOString() : value;
  return `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(text)}</t></is></c>`;
}

function makeXlsx(sheets: NormalizedWorkbookSheet[]): Uint8Array {
  const sheetXml = sheets.map(({ rows }, sheetIndex) => {
    const rowXml = rows
      .map((row, rowIndex) => {
        const cells = row
          .map((value, columnIndex) =>
            cellXml(value, `${columnIndexToLetters(columnIndex)}${rowIndex + 1}`),
          )
          .join('');
        return `<row r="${rowIndex + 1}">${cells}</row>`;
      })
      .join('');
    return {
      name: `xl/worksheets/sheet${sheetIndex + 1}.xml`,
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowXml}</sheetData></worksheet>`,
        'utf8',
      ),
    };
  });

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map(({ name }, index) => `<sheet name="${escapeXml(name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join('')}</sheets></workbook>`;
  const relationships = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join('')}</Relationships>`;
  const rootRelationships =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`;
  return createZip([
    { name: '[Content_Types].xml', data: Buffer.from(contentTypes) },
    { name: '_rels/.rels', data: Buffer.from(rootRelationships) },
    { name: 'xl/workbook.xml', data: Buffer.from(workbook) },
    { name: 'xl/_rels/workbook.xml.rels', data: Buffer.from(relationships) },
    ...sheetXml,
  ]);
}

export function generateWorkbook(
  input: readonly WorkbookSheet[] | Readonly<Record<string, readonly WorkbookRow[]>>,
  options: GenerateWorkbookOptions = {},
): Uint8Array {
  const sheets = normalizeSheets(input);
  if (options.format === 'csv') {
    if (sheets.length !== 1) throw new TypeError('CSV exports can contain only one worksheet.');
    return Buffer.from(serializeDelimitedText(sheets[0]!.rows, options.delimiter ?? ','), 'utf8');
  }
  return makeXlsx(sheets);
}

export const XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
