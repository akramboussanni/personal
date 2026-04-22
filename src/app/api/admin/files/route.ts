import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin";
import {
  deleteHostedFile,
  fileNameFromUpload,
  hostedFileExists,
  listHostedFiles,
  writeHostedFile,
} from "@/lib/file-hosting";

const MAX_FILE_BYTES = Number(process.env.FILE_HOSTING_MAX_MB || "1024") * 1024 * 1024;

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const files = await listHostedFiles();
  return NextResponse.json({ files });
}

export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const requestedName = String(form.get("name") || "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${Math.floor(MAX_FILE_BYTES / (1024 * 1024))}MB)` },
      { status: 400 }
    );
  }

  let fileName: string;
  try {
    fileName = fileNameFromUpload(file.name, requestedName);
  } catch {
    return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
  }

  if (await hostedFileExists(fileName)) {
    return NextResponse.json({ error: "A file with that name already exists" }, { status: 409 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  await writeHostedFile(fileName, bytes);

  return NextResponse.json({
    ok: true,
    name: fileName,
    url: `/file/${encodeURIComponent(fileName)}`,
  });
}

export async function DELETE(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const name = url.searchParams.get("name") || "";
  if (!name) {
    return NextResponse.json({ error: "Missing file name" }, { status: 400 });
  }

  try {
    if (!(await hostedFileExists(name))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await deleteHostedFile(name);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
  }
}
