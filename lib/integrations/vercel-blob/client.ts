import "server-only";

export function getBlobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token)
    throw new Error(
      "Vercel Blob is not configured. Add BLOB_READ_WRITE_TOKEN to .env.local.",
    );
  return token;
}
