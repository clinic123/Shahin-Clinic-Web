import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password - Shaheen's Clinic",
  description: "Set a new password for your Shaheen's Clinic account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


