import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Research - Shaheen's Clinic | Homeopathy Research & Publications",
  description:
    "Access research papers, published articles, case studies, and educational resources on classical homeopathy from Shaheen's Clinic. Stay updated with latest homeopathic research.",
  keywords:
    "homeopathy research, research papers, published articles, case studies, homeopathic publications, medical research",
};

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
