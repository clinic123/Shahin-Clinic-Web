import BlogsList from "@/components/blog/BlogList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs - Shaheen's Clinic | Homeopathy Articles & Insights",
  description: "Explore our blog for articles on classical homeopathy, holistic healing, patient success stories, and insights from Dr. Shaheen Mahmud and our team of practitioners.",
  keywords: "homeopathy blog, classical homeopathy articles, holistic healing blog, homeopathic medicine insights, health articles",
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    search?: string;
    page?: string;
    limit?: string;
  }>;
}

const Blogs = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  return (
    <BlogsList
      category={params.category}
      sort={params.sort}
      search={params.search}
      page={params.page}
      limit={params.limit}
      params="blogs"
    />
  );
};

export default Blogs;
