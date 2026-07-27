import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin";
import { fileNameFromUpload, writeHostedFile } from "@/lib/file-hosting";

export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  const maxBytes = 4 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "Image too large (max 4MB)" }, { status: 400 });
  }

  const extension = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : ".bin";
  const fileName = fileNameFromUpload(`${Date.now()}-${crypto.randomUUID()}${extension}`, "");
  await writeHostedFile(fileName, new Uint8Array(await file.arrayBuffer()));

  return NextResponse.json({
    ok: true,
    url: `/file/${encodeURIComponent(fileName)}`,
  });
}
