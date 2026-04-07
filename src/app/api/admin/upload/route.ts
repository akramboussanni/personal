import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin";

function extensionFromName(name: string): string {
  const ext = path.extname(name || "").toLowerCase();
  if (!ext) return ".bin";
  return ext.replace(/[^.a-z0-9]/g, "") || ".bin";
}

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

  const maxBytes = 8 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "Image too large (max 8MB)" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = extensionFromName(file.name);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
  const fullPath = path.join(uploadsDir, fileName);

  await fs.writeFile(fullPath, bytes);

  return NextResponse.json({
    ok: true,
    url: `/uploads/${fileName}`,
  });
}
