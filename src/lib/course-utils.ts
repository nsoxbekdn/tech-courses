// Pure, client-safe helpers (no DB import). Operate on the UI Course shape.
import type { Course, Instructor } from "./types";

export const INSTRUCTOR_ID = "ins-techcourses";

export const INSTRUCTOR: Instructor = {
  id: INSTRUCTOR_ID,
  name: "Tech Courses",
  title: "NISM Certifications & Competitive Coding",
  bio: "The Tech Courses team teaches India's NISM securities-market certifications and competitive programming — structured, chapter-by-chapter, and free.",
  initials: "TC",
  avatar: ["#1f2937", "#0f172a"],
  students: 0,
  coursesCount: 0,
};

export function getInstructor(id: string): Instructor | undefined {
  return id === INSTRUCTOR_ID ? INSTRUCTOR : undefined;
}

export function courseStats(course: Course) {
  const lessons = course.modules.flatMap((m) => m.lessons);
  const totalMinutes = lessons.reduce((s, l) => s + l.durationMinutes, 0);
  return {
    lessonCount: lessons.length,
    moduleCount: course.modules.length,
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
  };
}

export const LEVELS: { key: Course["level"]; label: string; blurb: string }[] = [
  {
    key: "Certification",
    label: "Certifications",
    blurb: "NISM securities-market exam prep, chapter by chapter",
  },
  {
    key: "Coding",
    label: "Coding & DSA",
    blurb: "From the C language to LeetCode and interview patterns",
  },
];
