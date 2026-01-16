import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password - Shaheen's Clinic",
  description: "Reset your password for your Shaheen's Clinic account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


