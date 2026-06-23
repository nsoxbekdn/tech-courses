// Domain model for the Tech Courses Academy platform.
// Content is generated from the YouTube channel (@techcourses4u): NISM
// securities-market certifications + competitive coding / DSA.

export type CourseLevel = "Certification" | "Coding";

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  initials: string;
  /** Tailwind-ish gradient stops used for the avatar placeholder. */
  avatar: [string, string];
  /** Real subscriber count from the channel. */
  students: number;
  coursesCount: number;
}

export interface Lesson {
  id: string;
  title: string;
  /** YouTube video id used by the lesson player embed. */
  youtubeId: string;
  durationMinutes: number;
  /** Real view count for this video. */
  views: number;
  /** Free preview lessons are playable before enrolment. */
  isPreview?: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  level: CourseLevel;
  /** Short watermark code shown on thumbnails (e.g. "NISM 7", "C", "DSA"). */
  code?: string;
  description: string;
  instructorId: string;
  /** Free-now, paid-ready: 0 means free. mrpInr kept for future paid mode. */
  priceInr: number;
  mrpInr: number;
  /** Total real view count across the course's lessons. */
  views: number;
  lastUpdated: string;
  language: string;
  /** Two CSS color stops for the course thumbnail gradient (unused by .thumb panel). */
  thumbnail: [string, string];
  tags: string[];
  whatYouLearn: string[];
  requirements: string[];
  modules: Module[];
  /** Instructor-provided exam details (certifications). */
  examInfo?: string;
  /** Instructor-attached mock test / practice link. */
  mockTestUrl?: string;
}

export interface Review {
  id: string;
  courseId: string;
  author: string;
  initials: string;
  rating: number;
  date: string;
  body: string;
}

// ---- Enrolment / progress (client-side mock; ready to back with a DB) ----

export interface Enrollment {
  courseId: string;
  enrolledAt: string;
  /** Lesson ids the learner has marked complete. */
  completedLessonIds: string[];
}
