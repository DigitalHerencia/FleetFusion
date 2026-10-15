export interface FileLike {
  name?: string;
  type?: string;
  size?: number;
  arrayBuffer?: () => Promise<ArrayBuffer>;
  stream?: () => ReadableStream<Uint8Array>;
  readonly [key: string]: unknown;
}

export interface FileValidationOptions {
  maxSizeBytes?: number;
  minSizeBytes?: number;
  allowedMimeTypes?: readonly string[];
  allowedExtensions?: readonly string[];
  fileName?: string;
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  name: string;
  mimeType: string;
  size: number;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;

export function validateFile(
  file: unknown,
  options: FileValidationOptions = {},
): FileValidationResult {
  const candidate = file as Partial<FileLike> | null;
  const name = options.fileName ?? (typeof candidate?.name === 'string' ? candidate.name : '');
  const mimeType = typeof candidate?.type === 'string' ? candidate.type.toLowerCase() : '';
  const size = typeof candidate?.size === 'number' ? candidate.size : Number.NaN;
  const errors: string[] = [];

  if (!candidate || typeof candidate !== 'object') {
    errors.push('A file must be provided.');
  } else {
    if (!name.trim()) errors.push('A file name is required.');
    if (!Number.isFinite(size) || size < 0) errors.push('The file size is invalid.');
    else if (size === 0) errors.push('The file is empty.');
    else if (size < (options.minSizeBytes ?? 1))
      errors.push('The file is smaller than the minimum allowed size.');
    else if (size > (options.maxSizeBytes ?? DEFAULT_MAX_SIZE)) {
      errors.push(
        `The file exceeds the maximum size of ${options.maxSizeBytes ?? DEFAULT_MAX_SIZE} bytes.`,
      );
    }

    if (options.allowedMimeTypes?.length) {
      const allowed = options.allowedMimeTypes.map((type) => type.toLowerCase());
      if (
        !mimeType ||
        !allowed.some((type) =>
          type.endsWith('/*') ? mimeType.startsWith(type.slice(0, -1)) : mimeType === type,
        )
      ) {
        errors.push(`The file type "${mimeType || 'unknown'}" is not allowed.`);
      }
    }

    if (options.allowedExtensions?.length) {
      const extension = name.includes('.') ? `.${name.split('.').pop()!.toLowerCase()}` : '';
      const allowed = options.allowedExtensions.map((value) =>
        value.startsWith('.') ? value.toLowerCase() : `.${value.toLowerCase()}`,
      );
      if (!allowed.includes(extension))
        errors.push(`The file extension "${extension || 'none'}" is not allowed.`);
    }
  }

  return { valid: errors.length === 0, errors, name, mimeType, size };
}

export function assertValidFile(
  file: unknown,
  options: FileValidationOptions = {},
): asserts file is FileLike {
  const result = validateFile(file, options);
  if (!result.valid) throw new TypeError(result.errors.join(' '));
}
