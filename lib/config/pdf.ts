import { resolve } from 'node:path';

export type PdfStorageProvider = 'filesystem' | 's3';

function resolvePdfStorageProvider(value: string | undefined): PdfStorageProvider {
  const provider = value?.trim().toLowerCase() || 'filesystem';
  if (provider !== 'filesystem' && provider !== 's3') {
    throw new TypeError(`Unsupported PDF storage provider: ${provider}`);
  }
  return provider;
}

export const PDF_STORAGE_PROVIDER = resolvePdfStorageProvider(process.env['STORAGE_PROVIDER']);
export const PDF_STORAGE_DIRECTORY = resolve(
  process.env['PDF_STORAGE_DIRECTORY']?.trim() || resolve(process.cwd(), 'storage', 'pdfs'),
);

export const S3_PDF_CONFIG = Object.freeze({
  bucket: process.env['S3_BUCKET']?.trim() || undefined,
  region: process.env['S3_REGION']?.trim() || undefined,
  publicUrl: process.env['S3_PUBLIC_URL']?.trim().replace(/\/+$/, '') || undefined,
});

export function assertPdfStorageConfigured(): void {
  if (
    PDF_STORAGE_PROVIDER === 's3' &&
    (!S3_PDF_CONFIG.bucket ||
      !S3_PDF_CONFIG.region ||
      !S3_PDF_CONFIG.publicUrl ||
      !process.env['AWS_ACCESS_KEY_ID'] ||
      !process.env['AWS_SECRET_ACCESS_KEY'])
  ) {
    throw new Error(
      'S3 PDF storage requires S3_BUCKET, S3_REGION, S3_PUBLIC_URL, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.',
    );
  }
}
