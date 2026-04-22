import { promises as fs } from "node:fs";
import path from "node:path";

const baseContentDir = process.env.CONTENT_DIR ? path.resolve(process.env.CONTENT_DIR) : path.join(process.cwd(), "content-data");
const filesDir = path.join(baseContentDir, "files");

export type HostedFile = {
  name: string;
  size: number;
  updatedAt: string;
};

const SAFE_NAME_RE = /^[a-z0-9][a-z0-9._-]{0,199}$/i;

export function normalizeHostedFileName(input: string): string {
  const value = input.trim().toLowerCase();

  if (!value || value.includes("/") || value.includes("\\") || value.includes("..")) {
    throw new Error("Invalid file name");
  }

  const normalized = value
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-");

  if (!SAFE_NAME_RE.test(normalized)) {
    throw new Error("Invalid file name");
  }

  return normalized;
}

export function fileNameFromUpload(originalName: string, customName: string): string {
  const source = (customName || "").trim() || (originalName || "").trim();
  if (!source) {
    throw new Error("Missing file name");
  }
  return normalizeHostedFileName(source);
}

export async function ensureHostedFilesDir(): Promise<void> {
  await fs.mkdir(filesDir, { recursive: true });
}

export function getHostedFilePath(fileName: string): string {
  const normalized = normalizeHostedFileName(fileName);
  return path.join(filesDir, normalized);
}

export async function hostedFileExists(fileName: string): Promise<boolean> {
  try {
    await fs.access(getHostedFilePath(fileName));
    return true;
  } catch {
    return false;
  }
}

export async function listHostedFiles(): Promise<HostedFile[]> {
  await ensureHostedFilesDir();
  const entries = await fs.readdir(filesDir, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map(async (entry) => {
        const stats = await fs.stat(path.join(filesDir, entry.name));
        return {
          name: entry.name,
          size: stats.size,
          updatedAt: stats.mtime.toISOString(),
        } satisfies HostedFile;
      })
  );

  return files.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function readHostedFile(fileName: string): Promise<Buffer> {
  return fs.readFile(getHostedFilePath(fileName));
}

export async function writeHostedFile(fileName: string, bytes: Uint8Array): Promise<void> {
  await ensureHostedFilesDir();
  await fs.writeFile(getHostedFilePath(fileName), bytes);
}

export async function deleteHostedFile(fileName: string): Promise<void> {
  await fs.unlink(getHostedFilePath(fileName));
}

export function contentTypeForFile(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".txt":
      return "text/plain; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".mov":
      return "video/quicktime";
    case ".m4v":
      return "video/x-m4v";
    case ".avi":
      return "video/x-msvideo";
    case ".mkv":
      return "video/x-matroska";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}
