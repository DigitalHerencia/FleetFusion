import { createTextPdf } from './utils';

export interface ReportData {
  title: string;
  subtitle?: string;
  generatedAt?: Date | string;
  metadata?: Readonly<Record<string, unknown>>;
  columns?: readonly string[];
  rows?: readonly (readonly unknown[] | Readonly<Record<string, unknown>>)[];
}

export interface GenerateReportOptions {
  pageWidth?: number;
  pageHeight?: number;
  fontSize?: number;
  linesPerPage?: number;
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '—' : value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function makeRows(report: ReportData): string[] {
  const dataRows = report.rows ?? [];
  const recordRows = dataRows.filter((row) => !Array.isArray(row)) as Readonly<
    Record<string, unknown>
  >[];
  const columns = report.columns ?? [...new Set(recordRows.flatMap((row) => Object.keys(row)))];
  const normalizedRows = dataRows.map((row) =>
    Array.isArray(row)
      ? row
      : columns.map((column) => (row as Readonly<Record<string, unknown>>)[column]),
  );
  const columnWidths = columns.map((column, index) =>
    Math.min(
      32,
      Math.max(column.length, ...normalizedRows.map((row) => displayValue(row[index]).length), 3),
    ),
  );
  const separator = columnWidths.map((width) => '-'.repeat(width)).join('-+-');
  const tableLine = (values: readonly unknown[]) =>
    columnWidths
      .map((width, index) =>
        displayValue(values[index]).replaceAll(/\s+/g, ' ').slice(0, width).padEnd(width),
      )
      .join(' | ');

  const lines: string[] = [];
  if (report.subtitle) lines.push(report.subtitle, '');
  const timestamp = report.generatedAt ?? new Date();
  lines.push(`Generated: ${displayValue(timestamp)}`);
  for (const [key, value] of Object.entries(report.metadata ?? {})) {
    lines.push(`${key}: ${displayValue(value)}`);
  }
  if (columns.length) {
    lines.push('', tableLine(columns), separator);
    lines.push(...normalizedRows.map(tableLine));
  } else if (normalizedRows.length) {
    lines.push(...normalizedRows.map((row) => row.map(displayValue).join(' | ')));
  }
  return lines;
}

export function generateReport(
  report: ReportData,
  options: GenerateReportOptions = {},
): Uint8Array {
  if (!report || typeof report !== 'object' || !report.title?.trim()) {
    throw new TypeError('A report with a non-empty title is required.');
  }
  return createTextPdf(report.title.trim(), makeRows(report), options);
}
