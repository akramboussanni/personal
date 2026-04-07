import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createAdminSession, isAdminConfigured, validateAdminCredentials } from "@/lib/admin";

type Body = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const username = (body.username || "").trim();
  const password = body.password || "";

  if (!isAdminConfigured()) {
    return NextResponse.json({ ok: true, message: "Admin auth not configured." });
  }

  if (!validateAdminCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const session = createAdminSession(username);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
