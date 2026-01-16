"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useForumCategories } from "@/hooks/useForum";
import { ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function ForumCategories() {
  const { data: categories, isLoading, error } = useForumCategories();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Loading categories...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 animate-pulse"
              >
                <div className="w-3 h-12 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 bg-gray-200 rounded w-1/4"></Skeleton>
                  <Skeleton className="h-3 bg-gray-200 rounded w-3/4"></Skeleton>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Failed to load categories</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forum Categories</CardTitle>
        <CardDescription>
          Choose a category to browse discussions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories?.map((category) => (
          <div
            key={category.id}
            className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div
              className="w-3 h-12 rounded-full shrink-0"
              style={{ backgroundColor: category.color || "red" }}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <Link
                  href={`/forum/categories/${category.slug}`}
                  className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors"
                >
                  {category.name}
                </Link>
                <Badge variant="secondary">
                  {category._count.topics} topics
                </Badge>
              </div>
              {category.description && (
                <p className="text-gray-600 mb-3">{category.description}</p>
              )}
              {/* Latest Topic */}
              {category.topics.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <MessageSquare className="h-4 w-4" />
                  <Link
                    href={`/forum/topics/${category.topics[0].slug}`}
                    className="hover:text-green-600 transition-colors truncate"
                  >
                    {category.topics[0].title}
                  </Link>
                  <Badge variant="outline" className="text-xs">
                    {category.topics[0]._count.posts} replies
                  </Badge>
                </div>
              )}
            </div>

            <Link
              href={`/forum/categories/${category.slug}`}
              className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors shrink-0"
            >
              <span className="text-sm font-medium">View</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}

        {(!categories || categories.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No categories available yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
