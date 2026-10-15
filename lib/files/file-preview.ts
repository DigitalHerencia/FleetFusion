import type { FileLike } from './file-validation';

export type FilePreviewKind = 'image' | 'pdf' | 'text' | 'unsupported';

export interface FilePreview {
  name: string;
  mimeType: string;
  size: number;
  kind: FilePreviewKind;
  url?: string;
  revoke(): void;
}

export function getFilePreviewKind(mimeType: string): FilePreviewKind {
  const normalized = mimeType.toLowerCase().split(';', 1)[0]!.trim();
  if (normalized.startsWith('image/')) return 'image';
  if (normalized === 'application/pdf') return 'pdf';
  if (normalized.startsWith('text/')) return 'text';
  return 'unsupported';
}

export function createFilePreview(file: unknown): FilePreview {
  if (!file || typeof file !== 'object')
    throw new TypeError('A file is required to create a preview.');
  const candidate = file as FileLike;
  const name = candidate.name ?? '';
  const mimeType = candidate.type ?? '';
  const size = candidate.size ?? 0;
  const kind = getFilePreviewKind(mimeType);
  const canCreateUrl =
    typeof Blob !== 'undefined' &&
    file instanceof Blob &&
    typeof URL !== 'undefined' &&
    typeof URL.createObjectURL === 'function';
  const url = canCreateUrl && kind !== 'unsupported' ? URL.createObjectURL(file) : undefined;
  let revoked = false;

  return {
    name,
    mimeType,
    size,
    kind,
    ...(url ? { url } : {}),
    revoke() {
      if (!revoked && url && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(url);
        revoked = true;
      }
    },
  };
}
