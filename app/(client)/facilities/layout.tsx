import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facilities - Shaheen's Clinic | Course Bundles & Resources",
  description: "Explore our facilities including course bundles, books, research resources, and learning materials at Shaheen's Clinic. Enhance your homeopathy education and professional development.",
  keywords: "facilities, course bundles, homeopathy resources, medical education, learning materials, professional development",
};

export default function FacilitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


