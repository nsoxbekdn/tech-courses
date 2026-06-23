import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";

// Starts the Google OAuth 2.0 authorization-code flow.
export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const url = new URL(request.url);

  if (!clientId) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", url.origin));
  }

  let next = url.searchParams.get("next") || "/dashboard";
  if (!next.startsWith("/")) next = "/dashboard"; // prevent open redirect

  const redirectUri = `${url.origin}/api/auth/google/callback`;
  const state = randomBytes(16).toString("hex");
  const secure = process.env.NODE_ENV === "production";

  const store = await cookies();
  const opts = { httpOnly: true, secure, sameSite: "lax" as const, path: "/", maxAge: 600 };
  store.set("g_state", state, opts);
  store.set("g_next", next, opts);

  const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  auth.searchParams.set("client_id", clientId);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", "openid email profile");
  auth.searchParams.set("state", state);
  auth.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(auth.toString());
}
