import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Appointment - Shaheen's Clinic | Schedule Consultation",
  description: "Book an appointment with Dr. Shaheen Mahmud at Shaheen's Clinic. Schedule your homeopathic consultation online for personalized holistic treatment.",
  keywords: "book appointment, homeopathy consultation, schedule appointment, Dr. Shaheen Mahmud appointment, clinic booking",
};

export default function AppointmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


