"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Filter,
  Grid3X3,
  List,
  MessageSquare,
  Search,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useForumCategory } from "@/hooks/useForum";
import { CreateTopicDialog } from "./CreateTopicDialog";
import { TopicCard } from "./TopicCard";

export default function CategoryPage({ slug }: { slug: string }) {
  const router = useRouter();
  const params = useParams<{ slug: string }>();

  const { data: category, isLoading, error } = useForumCategory(slug);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "activity">(
    "activity"
  );

  const filteredTopics = category?.topics?.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTopics = filteredTopics?.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "popular":
        return b.views - a.views;
      case "activity":
      default:
        return (
          new Date(b.lastActivityAt).getTime() -
          new Date(a.lastActivityAt).getTime()
        );
    }
  });

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-destructive mb-4">
              <MessageSquare className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Failed to load category</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              {error.message ||
                "The category you're looking for doesn't exist or has been removed."}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button variant="outline" onClick={() => router.push("/forum")}>
                Browse Categories
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          className="w-fit"
          onClick={() => router.push("/forum")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : category ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div
                className="w-4 h-12 rounded-full mt-1"
                style={{ backgroundColor: category.color || "#6b7280" }}
              />
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  {category.name}
                  <Badge variant="secondary">
                    {category._count.topics} topics
                  </Badge>
                </h1>
                {category.description && (
                  <p className="text-muted-foreground text-lg mt-2">
                    {category.description}
                  </p>
                )}
              </div>
            </div>

            <CreateTopicDialog
              categoryId={category.id}
              categoryName={category.name}
              onSuccess={() => {
                // Optional: refresh or show success message
              }}
            />
          </div>
        ) : null}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="activity">Latest Activity</option>
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
              </select>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>

              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topics List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedTopics && sortedTopics.length > 0 ? (
        <div className="space-y-4">
          {sortedTopics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "No topics found" : "No topics yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Be the first to start a discussion in this category"}
            </p>
            {category && !searchQuery && (
              <CreateTopicDialog
                categoryId={category.id}
                categoryName={category.name}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {category && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">
                  {category._count.topics}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Topics
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {category.topics?.reduce(
                    (acc, topic) => acc + topic._count.posts,
                    0
                  ) || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {category.topics?.reduce(
                    (acc, topic) => acc + topic.views,
                    0
                  ) || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {
                    new Set(
                      category.topics?.map((topic) => topic.author.name) || []
                    ).size
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Users
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
