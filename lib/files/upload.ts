import { assertValidFile, type FileLike, type FileValidationOptions } from './file-validation';
import { uploadStoredFile } from './storage-adapter';

export interface StoreFileOptions extends FileValidationOptions {
  keyPrefix?: string;
  fileName?: string;
  contentType?: string;
}

type UploadableFile = FileLike & {
  filename?: string;
  contentType?: string;
  bytes?: Uint8Array | ArrayBuffer;
  data?: Uint8Array | ArrayBuffer;
};

function safeFileName(name: string): string {
  const baseName = name.replaceAll('\\', '/').split('/').pop() ?? '';
  const normalized = baseName
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  if (!normalized || normalized === '.' || normalized === '..') {
    throw new TypeError('The file name does not contain a safe file name.');
  }
  return normalized.slice(0, 180);
}

async function readFileBytes(file: UploadableFile): Promise<Uint8Array> {
  const contents = file.bytes ?? file.data;
  if (contents instanceof Uint8Array) return contents;
  if (contents instanceof ArrayBuffer) return new Uint8Array(contents);
  if (typeof file.arrayBuffer === 'function') return new Uint8Array(await file.arrayBuffer());
  throw new TypeError('The upload must include file bytes or an arrayBuffer() implementation.');
}

export async function storeFile(file: unknown, options: StoreFileOptions = {}) {
  if (!file || typeof file !== 'object') throw new TypeError('A file upload object is required.');
  const candidate = file as UploadableFile;
  const fileName = safeFileName(options.fileName ?? candidate.name ?? candidate.filename ?? '');
  const contentType =
    options.contentType ?? candidate.type ?? candidate.contentType ?? 'application/octet-stream';
  const size =
    candidate.size ??
    (candidate.bytes instanceof Uint8Array
      ? candidate.bytes.byteLength
      : candidate.data instanceof Uint8Array
        ? candidate.data.byteLength
        : candidate.bytes instanceof ArrayBuffer
          ? candidate.bytes.byteLength
          : candidate.data instanceof ArrayBuffer
            ? candidate.data.byteLength
            : Number.NaN);

  assertValidFile({ ...candidate, name: fileName, type: contentType, size }, options);
  const data = await readFileBytes(candidate);
  if (data.byteLength !== size)
    throw new TypeError('The declared file size does not match the uploaded content.');

  const keyPrefix = (options.keyPrefix ?? '').replace(/^\/+|\/+$/g, '');
  const key = [keyPrefix, globalThis.crypto.randomUUID(), fileName].filter(Boolean).join('/');
  const stored = await uploadStoredFile({ key, fileName, contentType, size, data });
  return { ...stored, fileName };
}
