import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile - Shaheen's Clinic",
  description: "Manage your profile and account settings at Shaheen's Clinic.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


