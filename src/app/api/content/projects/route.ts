import { NextResponse } from "next/server";
import { getProjects, saveProjects } from "@/lib/content";
import { Project } from "@/lib/types";
import { isAdminAuthorized } from "@/lib/admin";

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load projects" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Project[];
    await saveProjects(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save projects" }, { status: 500 });
  }
}
