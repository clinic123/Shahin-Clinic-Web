import TopicCard from "@/components/forum/TopicCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Search from "@/components/ui/search";
import { Skeleton } from "@/components/ui/skeleton";
import { ForumTopic } from "@/types";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import SortFilter from "../ui/filter";

interface fetchTopicType {
  topics: ForumTopic[];
  pagination: {
    total: number;
    page: number;
    totalPage: number;
  };
}

const fetchData = async ({
  category,
  sort,
  search,
}: {
  category?: string;
  sort?: string;
  search?: string;
}) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/forum/topics?${
      category ? `category=${category}` : ""
    }${search ? `&search=${search}` : ""}&sort=${sort || "newest"}
   
    `
  );
  //  ${params === "homepage" ? "&limit=3" : ""}

  const data: fetchTopicType = await res.json();
  return data;
};

function TopicsListFallback() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Topics</CardTitle>
        <CardDescription>Loading topics...</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-start space-x-4 p-4 border rounded-lg animate-pulse"
          >
            <Skeleton className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 bg-gray-200 rounded w-3/4"></Skeleton>
              <Skeleton className="h-3 bg-gray-200 rounded w-1/2"></Skeleton>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const TopicsList = async ({
  sort = "newest",
  search,
  category,
  params = "forum",
}: {
  sort?: string;
  search?: string;
  category?: string;
  params?: "topic" | "forum";
}) => {
  const { topics, pagination } = await fetchData({ category, sort, search });

  return (
    <div className="py-5">
      <div className="flex items-center gap-4">
        <Search />
        <SortFilter
          items={[
            {
              value: "popular",
              label: "Popular",
            },
            {
              value: "votes",
              label: "Votes",
            },
          ]}
        />
      </div>
      <Suspense
        key={search + pagination.page.toString()}
        fallback={<TopicsListFallback />}
      >
        <div className="space-y-4 pt-10">
          {topics.map((topic: ForumTopic) => (
            <TopicCard key={topic.slug} data={topic} />
          ))}
          {topics.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No topics found</p>

              <Button asChild className="mt-4">
                <Link href="/forum/topics/new">Start New Topic</Link>
              </Button>
            </div>
          )}
        </div>
      </Suspense>
    </div>
  );
};

export default TopicsList;
