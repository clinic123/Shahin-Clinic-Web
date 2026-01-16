import TopicsList from "@/components/forum/TopicsList";
import ForumCategories from "../../components/forum/ForumCategories";
import ForumStats from "../../components/forum/ForumStats";
import PopularTopics from "../../components/forum/PopularTopics";
import QuickActions from "../../components/forum/QuickActions";
export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ sort: string; search: string; category: string }>;
}) {
  const sort = (await searchParams).sort;
  const search = (await searchParams).search;
  const category = (await searchParams).category;
  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          <QuickActions />
          <TopicsList category={category} sort={sort} search={search} />
          <ForumCategories />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <ForumStats />
          <PopularTopics />
        </div>
      </div>
    </div>
  );
}
