"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { getAdminUser, isBootstrapAdmin } from "./admin";
import { runSync } from "./sync";

export interface CoursePatch {
  published?: boolean;
  track?: string;
  order?: number;
  code?: string | null;
  titleOverride?: string | null;
  descOverride?: string | null;
  examInfo?: string | null;
  mockTestUrl?: string | null;
}

export async function updateCourseAction(id: string, patch: CoursePatch) {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Not authorized" };
  await prisma.course.update({ where: { id }, data: patch });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function syncNowAction() {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Not authorized" };
  try {
    const result = await runSync();
    revalidatePath("/", "layout");
    return { ok: true, result };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Sync failed" };
  }
}

export async function addAdminAction(email: string) {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Not authorized" };
  email = email.trim().toLowerCase();
  if (!email.includes("@")) return { ok: false, error: "Enter a valid email address." };
  if (isBootstrapAdmin(email)) return { ok: false, error: "That email is already an owner admin." };
  await prisma.admin.upsert({
    where: { email },
    create: { email, addedBy: admin.email },
    update: {},
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function removeAdminAction(email: string) {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Not authorized" };
  email = email.trim().toLowerCase();
  if (isBootstrapAdmin(email)) return { ok: false, error: "Owner admins can't be removed here." };
  await prisma.admin.deleteMany({ where: { email } });
  revalidatePath("/", "layout");
  return { ok: true };
}
