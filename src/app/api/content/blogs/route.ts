import { NextResponse } from "next/server";
import { getBlogs, saveBlogs } from "@/lib/content";
import { BlogPost } from "@/lib/types";
import { isAdminAuthorized } from "@/lib/admin";

export async function GET() {
  try {
    const blogs = await getBlogs();
    return NextResponse.json(blogs);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load blogs" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as BlogPost[];
    await saveBlogs(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save blogs" }, { status: 500 });
  }
}
