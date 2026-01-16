import TiptapRenderer from "@/components/TiptapRenderer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark, Eye, Lock, MessageSquare, Pin } from "lucide-react";
import { VoteButton } from "./vote-button";

import { ForumTopic } from "@/types";
import { ForumCommentSection } from "./Comments";

export default async function TopicDetail({ topic }: { topic: ForumTopic }) {
  const singleTopic = topic;
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const upvotes =
    singleTopic.votes?.filter((v) => v.type === "UPVOTE").length || 0;
  const downvotes =
    singleTopic.votes?.filter((v) => v.type === "DOWNVOTE").length || 0;
  const userVote = singleTopic.votes?.find(
    (v) => v.userId === singleTopic.author.id
  )?.type;

  if (!singleTopic) {
    return (
      <div>
        <h2>Topic Not Found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 container">
      {/* Topic Header */}
      <Card>
        <CardHeader>
          <div className="">
            <div className="flex pb-6 items-center space-x-2">
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-1" />
                Save
              </Button>
              <VoteButton
                itemId={singleTopic.id}
                itemType="TOPIC"
                initialUpvotes={upvotes}
                initialDownvotes={downvotes}
                initialUserVote={userVote}
              />
            </div>
            <div className="flex-1">
              <div></div>
              <div className="flex items-center space-x-2 mb-2">
                {singleTopic.isPinned && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Pin className="h-3 w-3 mr-1" />
                    Pinned
                  </Badge>
                )}
                {singleTopic.isLocked && (
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    <Lock className="h-3 w-3 mr-1" />
                    Locked
                  </Badge>
                )}
                {singleTopic.isFeatured && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    Featured
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="border-2"
                  style={{ borderColor: singleTopic.category.color || "red" }}
                >
                  {singleTopic.category.name}
                </Badge>
              </div>
              <div className="flex w-full  items-center gap-2">
                <Avatar className="h-10 w-10 border border-teal-300">
                  <AvatarImage src={singleTopic.author.image || ""} />
                  <AvatarFallback className="text-xs">
                    {singleTopic.author.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="inline-flex items-center gap-1">
                    <span className="text-xs font-semibold text-neutral-700">
                      {singleTopic.author.name}
                    </span>
                    <span className="text-xs hidden lg:block font-medium text-neutral-400">
                      {formatTime(singleTopic.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-neutral-500">
                    {singleTopic.author.role.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-5">
                <p className="text-xs  lg:hidden font-medium text-neutral-400">
                  {formatTime(singleTopic.createdAt)}
                </p>
                <CardTitle className="text-lg font-semibold text-neutral-800 max-w-3xl xl:text-xl 5 ">
                  {singleTopic.title}
                </CardTitle>
                <p className="text-xs font-medium text-neutral-400">
                  Edited at {formatTime(singleTopic.updatedAt)}
                </p>
                <div className="flex flex-wrap items-center gap-4  text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{singleTopic.views} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{singleTopic._count.posts} replies</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TiptapRenderer content={singleTopic.content} />
        </CardContent>
      </Card>

      {/* Reply Form */}
      <ForumCommentSection
        isLocked={singleTopic.isLocked}
        topic={singleTopic}
      />
    </div>
  );
}
