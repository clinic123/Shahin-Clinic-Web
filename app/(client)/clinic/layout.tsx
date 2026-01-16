import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Clinic - Shaheen's Clinic | Tangail, Bangladesh",
  description: "Learn about Shaheen's Clinic in Tangail, Bangladesh. Discover our services, philosophy, community engagement, and visit information. Leading homeopathic healthcare center founded by Dr. Shaheen Mahmud.",
  keywords: "Shaheen's Clinic, homeopathy clinic Tangail, clinic services, Dr. Shaheen Mahmud clinic, homeopathic treatment center Bangladesh",
};

export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


