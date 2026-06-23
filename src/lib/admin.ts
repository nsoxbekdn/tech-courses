import "server-only";
import { prisma } from "./prisma";
import { getCurrentUser, type SessionUser } from "./auth";

// The ADMIN_EMAILS env list is the always-on "owner" bootstrap.
export function isBootstrapAdmin(email: string): boolean {
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}

// True if the email is a bootstrap admin OR in the DB admin allowlist.
export async function isAdmin(email: string): Promise<boolean> {
  if (isBootstrapAdmin(email)) return true;
  const row = await prisma.admin.findUnique({ where: { email: email.trim().toLowerCase() } });
  return Boolean(row);
}

// Returns the current user if they're an admin, else null.
export async function getAdminUser(): Promise<SessionUser | null> {
  const user = await getCurrentUser();
  if (!user || !(await isAdmin(user.email))) return null;
  return user;
}

export interface AdminEntry {
  email: string;
  removable: boolean; // bootstrap (env) admins can't be removed from the UI
}

export async function getAdmins(): Promise<AdminEntry[]> {
  const envList = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const dbRows = await prisma.admin.findMany({ orderBy: { createdAt: "asc" } });

  const entries: AdminEntry[] = envList.map((email) => ({ email, removable: false }));
  for (const r of dbRows) {
    if (!envList.includes(r.email)) entries.push({ email: r.email, removable: true });
  }
  return entries;
}
