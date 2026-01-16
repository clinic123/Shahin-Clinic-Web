"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForumTopics } from "@/hooks/useForum";
import { MessageSquare, ThumbsUp } from "lucide-react";
import Link from "next/link";

export default function PopularTopics() {
  const { data, isLoading, error } = useForumTopics({
    sort: "popular",
    limit: 5,
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Popular Topics</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Popular Topics</CardTitle>
          <CardDescription>Failed to load topics</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const topics = data?.topics || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ThumbsUp className="h-5 w-5 text-green-600" />
          <span>Popular Topics</span>
        </CardTitle>
        <CardDescription>Most discussed topics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topics.map((topic) => (
          <div key={topic.id} className="group">
            <div className="flex items-start space-x-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  {topic.isPinned && (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 border-green-200 text-xs"
                    >
                      Pinned
                    </Badge>
                  )}
                  {topic.isFeatured && (
                    <Badge
                      variant="default"
                      className="bg-blue-100 text-blue-800 border-blue-200 text-xs"
                    >
                      Featured
                    </Badge>
                  )}
                </div>

                <Link
                  href={`/forum/topics/${topic.slug}`}
                  className="font-medium text-gray-900 hover:text-green-600 transition-colors line-clamp-2 group-hover:underline text-sm"
                >
                  {topic.title}
                </Link>

                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: topic.category.color }}
                    />
                    <Link
                      href={`/forum/categories/${topic.category.slug}`}
                      className="hover:text-green-600 transition-colors"
                    >
                      {topic.category.name}
                    </Link>
                  </div>

                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{topic._count.posts}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{topic.upvotes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {topics.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No popular topics yet.
          </div>
        )}

        <div className="pt-2 border-t border-gray-200">
          <Link
            href="/forum/topics?sort=popular"
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            View all popular topics →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
