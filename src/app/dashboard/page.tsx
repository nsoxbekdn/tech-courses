import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCourses } from "@/lib/catalog";
import { DashboardClient } from "./dashboard-client";

export const metadata = { title: "My learning" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  const courses = await getCourses();
  return <DashboardClient courses={courses} />;
}
