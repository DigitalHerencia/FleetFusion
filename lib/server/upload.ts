import { deleteStoredFile } from '@/lib/files/storage-adapter';
import { storeFile, type StoreFileOptions } from '@/lib/files/upload';
import type { OrgContext } from '@/lib/server/auth';

export const MAX_ORGANIZATION_UPLOAD_SIZE_BYTES = 500 * 1024 * 1024;

export const DEFAULT_UPLOAD_MIME_TYPES = Object.freeze([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/csv',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

export interface OrganizationUploadOptions extends Omit<
  StoreFileOptions,
  'keyPrefix' | 'maxSizeBytes'
> {
  maxSizeBytes?: number;
  allowedMimeTypes?: readonly string[];
  relatedEntity?: string;
  relatedEntityId?: string;
}

export function organizationUploadPrefix(organizationId: string): string {
  const id = organizationId.trim();
  const hasControlCharacter = [...id].some((character) => character.charCodeAt(0) < 32);
  if (!id || id.length > 128 || /[\\/:]/.test(id) || hasControlCharacter) {
    throw new TypeError('A valid organization ID is required for file uploads.');
  }
  return `organizations/${encodeURIComponent(id)}`;
}

export async function uploadOrganizationFile(
  file: unknown,
  context: Pick<OrgContext, 'orgId' | 'userId'>,
  options: OrganizationUploadOptions = {},
) {
  if (!context.userId.trim())
    throw new TypeError('An authenticated user is required for file uploads.');
  const maxSizeBytes = options.maxSizeBytes ?? MAX_ORGANIZATION_UPLOAD_SIZE_BYTES;
  if (
    !Number.isInteger(maxSizeBytes) ||
    maxSizeBytes < 1 ||
    maxSizeBytes > MAX_ORGANIZATION_UPLOAD_SIZE_BYTES
  ) {
    throw new RangeError(
      `Upload size must be between 1 byte and ${MAX_ORGANIZATION_UPLOAD_SIZE_BYTES} bytes.`,
    );
  }

  const stored = await storeFile(file, {
    ...options,
    keyPrefix: organizationUploadPrefix(context.orgId),
    maxSizeBytes,
    allowedMimeTypes: options.allowedMimeTypes ?? DEFAULT_UPLOAD_MIME_TYPES,
  });
  return {
    ...stored,
    organizationId: context.orgId,
    uploadedById: context.userId,
    ...(options.relatedEntity ? { relatedEntity: options.relatedEntity } : {}),
    ...(options.relatedEntityId ? { relatedEntityId: options.relatedEntityId } : {}),
  };
}

export async function deleteOrganizationFile(
  storageKey: string,
  context: Pick<OrgContext, 'orgId'>,
): Promise<void> {
  const prefix = `${organizationUploadPrefix(context.orgId)}/`;
  if (!storageKey.startsWith(prefix) || storageKey.includes('..')) {
    throw new TypeError('The storage key is outside the current organization.');
  }
  await deleteStoredFile(storageKey);
}
