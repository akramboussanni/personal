import { del, get, head, list, put } from "@vercel/blob";

export const BLOB_STORAGE_ENABLED = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const CONTENT_PREFIX = "portfolio/content/";
const FILE_PREFIX = "portfolio/files/";

function blobPath(prefix: string, name: string) {
  return `${prefix}${name}`;
}

export async function readBlobText(name: string): Promise<string | undefined> {
  try {
    const result = await get(blobPath(CONTENT_PREFIX, name), { access: "public" });
    if (!result || result.statusCode !== 200) return undefined;
    return new TextDecoder().decode(await new Response(result.stream).arrayBuffer());
  } catch {
    return undefined;
  }
}

export async function writeBlobText(name: string, value: string): Promise<void> {
  await put(blobPath(CONTENT_PREFIX, name), value, {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json; charset=utf-8",
  });
}

export async function readBlobFile(name: string) {
  return get(blobPath(FILE_PREFIX, name), { access: "public" });
}

export async function blobFileExists(name: string): Promise<boolean> {
  try {
    await head(blobPath(FILE_PREFIX, name));
    return true;
  } catch {
    return false;
  }
}

export async function listBlobFiles() {
  const result = await list({ prefix: FILE_PREFIX });
  return result.blobs.map((blob) => ({
    name: blob.pathname.slice(FILE_PREFIX.length),
    size: blob.size,
    updatedAt: blob.uploadedAt.toISOString(),
  }));
}

export async function writeBlobFile(name: string, bytes: Uint8Array, contentType: string) {
  await put(blobPath(FILE_PREFIX, name), Buffer.from(bytes), {
    access: "public",
    addRandomSuffix: false,
    contentType,
  });
}

export async function deleteBlobFile(name: string) {
  await del(blobPath(FILE_PREFIX, name));
}
