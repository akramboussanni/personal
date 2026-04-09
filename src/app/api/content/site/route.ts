import { NextResponse } from "next/server";
import { getSiteConfig, saveSiteConfig } from "@/lib/content";
import { SiteConfig } from "@/lib/types";
import { isAdminAuthorized } from "@/lib/admin";

export async function GET() {
  try {
    const site = await getSiteConfig();
    return NextResponse.json(site);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load site config" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as SiteConfig;
    await saveSiteConfig(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save site config" }, { status: 500 });
  }
}
