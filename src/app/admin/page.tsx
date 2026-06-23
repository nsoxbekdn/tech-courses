import { redirect } from "next/navigation";
import { getAdminUser, getAdmins } from "@/lib/admin";
import { getAdminCourses, getChannelStats } from "@/lib/catalog";
import { CourseStudio } from "./course-studio";

export const metadata = { title: "Course Studio" };

export default async function AdminPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/login?next=/admin");

  const [courses, stats, admins] = await Promise.all([
    getAdminCourses(),
    getChannelStats(),
    getAdmins(),
  ]);
  return <CourseStudio courses={courses} stats={stats} admins={admins} currentEmail={admin.email} />;
}
