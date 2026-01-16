import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Webinars & Workshops - Shaheen's Clinic | Homeopathy Training",
  description: "Join our webinars and workshops on classical homeopathy. Learn from expert practitioners, access past recordings, and enhance your homeopathic knowledge and clinical skills.",
  keywords: "homeopathy workshops, webinars, homeopathy training, medical education, clinical workshops, homeopathic seminars",
};

export default function WorkshopsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


