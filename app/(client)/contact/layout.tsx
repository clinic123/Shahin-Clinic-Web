import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Shaheen's Clinic | Get in Touch",
  description: "Contact Shaheen's Clinic for appointments, inquiries, or consultations. Reach us via phone, email, or visit our clinic in Tangail, Bangladesh. We're here to help with your homeopathic treatment needs.",
  keywords: "contact Shaheen's Clinic, homeopathy consultation, book appointment, Dr. Shaheen Mahmud contact, clinic address Bangladesh",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


