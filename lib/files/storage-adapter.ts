export interface StoredFile {
  key: string;
  url: string;
  contentType: string;
  size: number;
}

export interface FileStorageInput {
  key: string;
  fileName: string;
  contentType: string;
  size: number;
  data: Uint8Array;
}

export interface FileStorageAdapter {
  upload(input: FileStorageInput): Promise<StoredFile>;
  delete?(key: string): Promise<void>;
}

let configuredAdapter: FileStorageAdapter | undefined;

export function configureFileStorage(adapter: FileStorageAdapter): () => void {
  const previousAdapter = configuredAdapter;
  configuredAdapter = adapter;
  return () => {
    if (configuredAdapter === adapter) configuredAdapter = previousAdapter;
  };
}

export function getFileStorageAdapter(): FileStorageAdapter {
  if (!configuredAdapter) {
    throw new Error(
      'File storage is not configured. Register a FileStorageAdapter backed by your storage provider before uploading files.',
    );
  }
  return configuredAdapter;
}

export async function uploadStoredFile(input: FileStorageInput): Promise<StoredFile> {
  return getFileStorageAdapter().upload(input);
}

export async function deleteStoredFile(key: string): Promise<void> {
  if (!key.trim()) throw new TypeError('A storage key is required.');
  const adapter = getFileStorageAdapter();
  if (!adapter.delete)
    throw new Error('The configured file storage adapter does not support deletion.');
  await adapter.delete(key);
}
