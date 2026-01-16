import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - Shaheen's Clinic | Our Mission & Vision",
  description: "Learn about Shaheen's Clinic - Founded by Dr. Shaheen Mahmud, we provide world-class classical homeopathic treatment, holistic healing, and medical education. Discover our mission, vision, and success stories.",
  keywords: "about Shaheen's Clinic, Dr. Shaheen Mahmud, homeopathy mission, holistic healing, classical homeopathy, medical education",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


