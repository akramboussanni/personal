import { NextResponse } from "next/server";
import { isAdminAuthorized, isAdminConfigured } from "@/lib/admin";

export async function GET(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ authenticated: true, configured: false });
  }

  return NextResponse.json({
    authenticated: isAdminAuthorized(request),
    configured: true,
  });
}
