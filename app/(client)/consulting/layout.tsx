import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consulting Services - Shaheen's Clinic | One-on-One Consultation",
  description: "Book one-on-one consulting services with Shaheen's Clinic. Choose between in-clinic or online consultations for personalized homeopathic treatment and expert medical advice.",
  keywords: "homeopathy consultation, online consultation, in-clinic consultation, medical consultation, Dr. Shaheen Mahmud consultation, homeopathic treatment",
};

export default function ConsultingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


