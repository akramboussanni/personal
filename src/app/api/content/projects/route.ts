import { NextResponse } from "next/server";
import { getProjects, saveProjects } from "@/lib/content";
import { Project } from "@/lib/types";
import { isAdminAuthorized } from "@/lib/admin";

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json(projects);
}

export async function PUT(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Project[];
  await saveProjects(body);
  return NextResponse.json({ ok: true });
}
