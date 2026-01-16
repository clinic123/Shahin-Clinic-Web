"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteCategory } from "@/hooks/useForum";
import { useSession } from "@/lib/auth-client";
import type { ForumCategoryWithTopics } from "@/types";
import { Calendar, Eye, MessageSquare, MoreVertical } from "lucide-react";

interface CategoryCardProps {
  category: ForumCategoryWithTopics;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const { data: session } = useSession();
  const deleteCategory = useDeleteCategory();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDelete = async () => {
    if (
      confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      try {
        await deleteCategory.mutateAsync(category.id);
      } catch (error) {
        console.error("Failed to delete category:", error);
      }
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-3 h-8 rounded-full"
              style={{ backgroundColor: category.color || "cyan" }}
            />
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                {category.name}
                <Badge variant="secondary" className="text-xs">
                  {category._count.topics} topics
                </Badge>
              </CardTitle>
              {category.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleDelete}
                  disabled={deleteCategory.isPending}
                >
                  Delete Category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {category.topics.length > 0 ? (
          <div className="space-y-3">
            {category.topics.map((topic) => (
              <div
                key={topic.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={topic.author.image || ""} />
                    <AvatarFallback className="text-xs">
                      {topic.author.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {topic.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                      <span>by {topic.author.name}</span>
                    </div>
                    <div className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(topic.lastActivityAt as any)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 ml-4">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    <span>{topic._count.posts}</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/forum/topics/${topic.slug}`}>
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No topics yet</p>
            <p className="text-sm mt-1">Be the first to start a discussion</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full" asChild>
            <a href={`/forum/categories/${category.slug}`}>View All Topics</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
