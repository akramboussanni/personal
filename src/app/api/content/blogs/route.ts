import { NextResponse } from "next/server";
import { getBlogs, saveBlogs } from "@/lib/content";
import { BlogPost } from "@/lib/types";
import { isAdminAuthorized } from "@/lib/admin";

export async function GET() {
  const blogs = await getBlogs();
  return NextResponse.json(blogs);
}

export async function PUT(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as BlogPost[];
  await saveBlogs(body);
  return NextResponse.json({ ok: true });
}
