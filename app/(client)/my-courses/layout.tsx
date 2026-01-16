import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Courses - Shaheen's Clinic",
  description: "Access your enrolled courses and track your learning progress at Shaheen's Clinic.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MyCoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


