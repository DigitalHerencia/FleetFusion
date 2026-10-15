import "server-only";
import { get } from "@vercel/blob";
import { getBlobToken } from "./client";
export async function readPrivateBlob(
  pathname: string,
  maxBytes = 10 * 1024 * 1024,
) {
  const result = await get(pathname, {
    access: "private",
    token: getBlobToken(),
  });
  if (!result || result.statusCode !== 200) throw new Error("File not found.");
  if (result.blob.size > maxBytes) {
    await result.stream.cancel();
    throw new Error("File exceeds the download limit.");
  }
  const reader = result.stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new Error("File exceeds the download limit.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks).toString("base64");
}
