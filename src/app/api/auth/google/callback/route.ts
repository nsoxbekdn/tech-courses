import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginWithOAuth } from "@/lib/auth";

// Handles the Google OAuth redirect: verifies state, exchanges the code,
// fetches the profile, then creates/links the user and starts a session.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const store = await cookies();
  const savedState = store.get("g_state")?.value;
  let next = store.get("g_next")?.value || "/dashboard";
  if (!next.startsWith("/")) next = "/dashboard";
  store.delete("g_state");
  store.delete("g_next");

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${reason}`, url.origin));

  if (!code || !state || !savedState || state !== savedState) return fail("google_failed");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail("google_not_configured");

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${url.origin}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) return fail("google_token");
    const tokens = (await tokenRes.json()) as { access_token?: string };
    if (!tokens.access_token) return fail("google_token");

    const infoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!infoRes.ok) return fail("google_profile");
    const profile = (await infoRes.json()) as {
      email?: string;
      name?: string;
      picture?: string;
      verified_email?: boolean;
    };
    if (!profile.email) return fail("google_profile");

    await loginWithOAuth({
      email: profile.email,
      name: profile.name ?? profile.email.split("@")[0],
      image: profile.picture,
    });

    return NextResponse.redirect(new URL(next, url.origin));
  } catch {
    return fail("google_failed");
  }
}
