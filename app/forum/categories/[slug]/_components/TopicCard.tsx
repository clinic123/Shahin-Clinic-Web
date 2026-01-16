"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { ForumTopic } from "@/types";
import {
  Calendar,
  Eye,
  Lock,
  MessageSquare,
  Pin,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

interface TopicCardProps {
  topic: ForumTopic;
}

export function TopicCard({ topic }: TopicCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getVoteCount = () => {
    return topic.upvotes - topic.downvotes;
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-green-600"
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-sm text-gray-900">
              {getVoteCount()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400"
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Topic Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {topic.isPinned && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Pin className="h-3 w-3 mr-1" />
                  Pinned
                </Badge>
              )}
              {topic.isLocked && (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  <Lock className="h-3 w-3 mr-1" />
                  Locked
                </Badge>
              )}
              {topic.isFeatured && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  Featured
                </Badge>
              )}
            </div>

            <CardTitle className="text-lg mb-2">
              <a
                href={`/forum/topics/${topic.slug}`}
                className="hover:text-blue-600 transition-colors"
              >
                {topic.title}
              </a>
            </CardTitle>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={topic.author.image || ""} />
                  <AvatarFallback className="text-xs">
                    {topic.author.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span>{topic.author.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(topic.createdAt)}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{topic._count.posts} replies</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{topic.views} views</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Last activity: {formatDate(topic.lastActivityAt)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
