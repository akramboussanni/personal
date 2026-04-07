import { NextResponse } from "next/server";
import { getSiteConfig, saveSiteConfig } from "@/lib/content";
import { SiteConfig } from "@/lib/types";
import { isAdminAuthorized } from "@/lib/admin";

export async function GET() {
  const site = await getSiteConfig();
  return NextResponse.json(site);
}

export async function PUT(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as SiteConfig;
  await saveSiteConfig(body);
  return NextResponse.json({ ok: true });
}
