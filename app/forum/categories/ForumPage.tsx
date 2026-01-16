"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Grid3X3, List, Search } from "lucide-react";
import { useState } from "react";

import { CategoryCard } from "@/components/forum/CategoryCard";
import { CreateCategoryDialog } from "@/components/forum/CreateCaregory";
import { Skeleton } from "@/components/ui/skeleton";
import { useForumCategories } from "@/hooks/useForum";

export default function ForumPage() {
  const { data: categories, isLoading, error } = useForumCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredCategories = categories?.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-destructive mb-4">
            <Search className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Failed to load categories</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            {error.message ||
              "An error occurred while loading the forum categories."}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
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

      {/* Categories Grid */}
      {isLoading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              : "space-y-6"
          }
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCategories && filteredCategories.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "space-y-6"
          }
        >
          {filteredCategories.map((category) => (
            <CategoryCard key={category.id} category={category as any} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "No categories found" : "No categories yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Be the first to create a category"}
            </p>
            {!searchQuery && <CreateCategoryDialog />}
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {categories && categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Forum Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{categories.length}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {categories.reduce((acc, cat) => acc + cat._count.topics, 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Topics
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {categories.reduce(
                    (acc, cat: any) =>
                      acc +
                      cat.topics.reduce(
                        (postAcc: any, topic: any) =>
                          postAcc + topic._count.posts,
                        0
                      ),
                    0
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Total Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {
                    new Set(
                      categories.flatMap((cat: any) =>
                        cat.topics.map((topic: any) => topic.author.name)
                      )
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
    </>
  );
}
