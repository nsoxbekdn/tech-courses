import { runSync } from "@/lib/sync";
import { getAdminUser } from "@/lib/admin";

// Authorized if called by the nightly cron (Bearer CRON_SECRET) or a logged-in admin.
async function authorized(request: Request): Promise<boolean> {
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`) return true;
  return Boolean(await getAdminUser());
}

export async function GET(request: Request) {
  if (!(await authorized(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runSync();
    return Response.json({ ok: true, ...result });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "sync failed" },
      { status: 500 },
    );
  }
}

export const POST = GET;
