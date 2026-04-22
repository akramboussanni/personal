import { NextResponse } from "next/server";
import { contentTypeForFile, hostedFileExists, readHostedFile } from "@/lib/file-hosting";

type Params = {
  name: string;
};

export async function GET(_request: Request, context: { params: Promise<Params> }) {
  const params = await context.params;
  const name = decodeURIComponent(params.name || "");

  try {
    const exists = await hostedFileExists(name);
    if (!exists) {
      return new NextResponse("File not found", { status: 404 });
    }

    const body = await readHostedFile(name);
    const bytes = Uint8Array.from(body);
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentTypeForFile(name),
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return new NextResponse("File not found", { status: 404 });
  }
}
