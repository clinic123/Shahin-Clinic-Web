import TopicsList from "@/components/forum/TopicsList";
import { Metadata } from "next";
import { Suspense } from "react";
export const metadata: Metadata = {
  title: "Forum Topics",
  description: "Forum Topics Description",
};
const TopicsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ sort: string; search: string; category: string }>;
}) => {
  const sort = (await searchParams).sort;
  const search = (await searchParams).search;
  const category = (await searchParams).category;
  return (
    <Suspense>
      <div className="container">
        <TopicsList category={category} sort={sort} search={search} />
      </div>
    </Suspense>
  );
};

export default TopicsPage;
