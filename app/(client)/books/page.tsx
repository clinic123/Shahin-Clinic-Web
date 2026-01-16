import BookSection from "@/components/home/BookSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Books - Shaheen's Clinic | Homeopathy Books & Publications",
  description: "Browse our collection of homeopathic books and publications. Explore educational resources on classical homeopathy, holistic healing, and medical knowledge from Shaheen's Clinic.",
  keywords: "homeopathy books, medical books, homeopathic publications, health books, medical literature",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function BookPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <BookSection params="book" searchParams={params} />;
}
