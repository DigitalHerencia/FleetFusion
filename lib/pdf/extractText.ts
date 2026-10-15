import { assertPdf, decodePdfTextOperators, extractPdfTextStreams, type PdfInput } from './utils';

export interface ExtractTextOptions {
  separator?: string;
}

export function extractText(input: PdfInput, options: ExtractTextOptions = {}): string {
  const bytes = assertPdf(input);
  const raw = Buffer.from(bytes).toString('latin1');
  if (/\/Encrypt\b/.test(raw))
    throw new TypeError('Text extraction from encrypted PDFs is not supported.');
  const text = extractPdfTextStreams(bytes)
    .flatMap(decodePdfTextOperators)
    .map((line) =>
      [...line]
        .filter((character) => {
          const code = character.charCodeAt(0);
          return !(code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d);
        })
        .join(''),
    )
    .filter((line) => line.length > 0);
  return text.join(options.separator ?? '\n');
}
