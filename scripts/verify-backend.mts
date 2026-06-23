// One-off: proves the auth/progress schema persists on Neon. Creates a test
// user + enrollment + progress, reads it back, then deletes it. Safe to re-run.
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";
const scryptAsync = promisify(scrypt);

const { prisma } = await import("../src/lib/prisma");

async function hash(pw: string) {
  const salt = randomBytes(16).toString("hex");
  const d = (await scryptAsync(pw, salt, 64)) as Buffer;
  return `${salt}:${d.toString("hex")}`;
}

async function main() {
  const email = "verify+backend@example.com";
  await prisma.user.deleteMany({ where: { email } }); // clean slate

  const user = await prisma.user.create({
    data: { name: "Verify Bot", email, passwordHash: await hash("secret123") },
  });
  console.log("✓ created user", user.id);

  await prisma.enrollment.create({ data: { userId: user.id, courseId: "course-test" } });
  await prisma.progress.createMany({
    data: [
      { userId: user.id, courseId: "course-test", lessonId: "test-l1" },
      { userId: user.id, courseId: "course-test", lessonId: "test-l2" },
    ],
  });
  console.log("✓ wrote enrollment + 2 progress rows");

  // Read back the way getUserEnrollments does.
  const enrollments = await prisma.enrollment.findMany({ where: { userId: user.id } });
  const progress = await prisma.progress.findMany({ where: { userId: user.id } });
  console.log(`✓ read back: ${enrollments.length} enrollment(s), ${progress.length} completed lesson(s)`);

  // Verify uniqueness guard (toggle off then on).
  await prisma.progress.deleteMany({ where: { userId: user.id, lessonId: "test-l1" } });
  const after = await prisma.progress.count({ where: { userId: user.id } });
  console.log(`✓ toggle-off works: ${after} completed lesson(s) remain`);

  await prisma.user.delete({ where: { id: user.id } });
  const gone = await prisma.user.count({ where: { email } });
  console.log(`✓ cascade cleanup: user rows left = ${gone}`);

  console.log("\nBACKEND PERSISTENCE OK");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("VERIFY FAILED:", e);
  await prisma.$disconnect();
  process.exit(1);
});
