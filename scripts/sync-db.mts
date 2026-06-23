// Manual catalog sync into Postgres. Run: npm run sync:db
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

const { runSync } = await import("../src/lib/sync");
const { prisma } = await import("../src/lib/prisma");

const result = await runSync();
console.log(`\nSynced ${result.channel}: ${result.courses} courses, ${result.lessons} lessons.`);
await prisma.$disconnect();
