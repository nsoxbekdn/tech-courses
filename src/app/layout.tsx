import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { themeScript } from "@/components/theme-toggle";
import { getCurrentUser, getUserEnrollments } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Tech Courses Academy · Free NISM Certification & Coding courses",
    template: "%s · Tech Courses",
  },
  description:
    "Free, structured video courses for India's NISM securities-market certifications and competitive coding — from the Tech Courses channel. Learn at your own pace with progress tracking.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const sessionUser = await getCurrentUser();
  const initialUser = sessionUser
    ? { name: sessionUser.name, email: sessionUser.email }
    : null;
  const initialEnrollments = sessionUser ? await getUserEnrollments(sessionUser.id) : [];
  const initialIsAdmin = sessionUser ? await isAdmin(sessionUser.email) : false;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <StoreProvider
          initialUser={initialUser}
          initialEnrollments={initialEnrollments}
          initialIsAdmin={initialIsAdmin}
        >
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </StoreProvider>
      </body>
    </html>
  );
}
