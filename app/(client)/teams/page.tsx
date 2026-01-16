import Team from "@/components/home/TeamSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Doctors - Shaheen's Clinic | Expert Homeopathic Practitioners",
  description: "Meet our team of expert homeopathic doctors and practitioners at Shaheen's Clinic. Learn about our experienced medical professionals dedicated to providing personalized holistic care.",
  keywords: "homeopathic doctors, medical practitioners, Shaheen's Clinic doctors, homeopathy specialists, medical team",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sort?: string;
    limit?: string;
  }>;
}

const TeamPage = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  return (
    <Team
      params="doctors"
      page={params.page}
      search={params.search}
      sort={params.sort}
      limit={params.limit}
    />
  );
};

export default TeamPage;
