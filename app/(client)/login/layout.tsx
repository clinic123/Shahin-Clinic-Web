import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Shaheen's Clinic | Sign In to Your Account",
  description: "Sign in to your Shaheen's Clinic account to access courses, appointments, and personalized services.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


