"use client";
import TiptapRenderer from "@/components/TiptapRenderer";
import type React from "react";

import RichTextEditor from "@/components/ui/rich-text-editor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { formatDateTime } from "@/lib/utils";
import type { ForumTopic } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LockIcon } from "lucide-react";
import { useState } from "react";
import { VoteButton } from "./vote-button";

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    image: string | null;
    role: string;
  };
  replies: Comment[];
  topicId?: string | null;
  parentId?: string | null;
  parentAuthor?: {
    name: string;
    id: string;
    role: string;
  };
  createdAt: Date;
  votes?: Array<{
    id: string;
    type: "UPVOTE" | "DOWNVOTE";
    userId: string;
  }>;
}

interface CommentSectionProps {
  isLocked?: boolean;
  topic: ForumTopic;
}

// API functions
const fetchComments = async (topicId: string): Promise<Comment[]> => {
  const response = await fetch(`/api/forum/comments?topicId=${topicId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }
  return response.json();
};

const createComment = async (commentData: {
  content: string;
  topicId: string;
  parentId?: string;
}) => {
  const response = await fetch(
    `/api/forum/comments?topicId=${commentData.topicId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commentData),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error creating comment");
  }

  return response.json();
};

export function ForumCommentSection({ topic, isLocked }: CommentSectionProps) {
  const [showCommentEditor, setShowCommentEditor] = useState(false);
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const {
    data: comments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["topic-comments", topic.id],
    queryFn: () => fetchComments(topic.id),
    enabled: !!topic.id,
  });

  const createCommentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topic-comments", topic.id] });
      setContent("");
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.session) return;

    createCommentMutation.mutate({
      content,
      topicId: topic.id,
    });
  };

  if (isLoading) {
    return (
      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-6">Comments</h3>
        <div className="text-center py-4">Loading comments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-6">Comments</h3>
        <div className="text-center py-4 text-red-500">
          Error loading comments: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-44 lg:mb-0">
      <div className="inline-flex items-center mb-6 gap-2">
        <h3 className="text-xl font-semibold">
          <span>{comments.length}</span>{" "}
          {comments.length > 1 ? "comments" : "comment"}
        </h3>
        {isLocked && (
          <Badge variant={"destructive"}>
            Locked <LockIcon />
          </Badge>
        )}
      </div>
      {session?.session ? (
        isLocked ? (
          <Card>
            <CardContent className="p-6 text-center">
              <LockIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <h4 className="font-medium text-gray-900">Topic Locked</h4>
              <p className="text-gray-500">
                This topic has been locked and no further replies can be posted.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {!showCommentEditor && (
              <Button
                type="button"
                className="flex"
                onClick={() => setShowCommentEditor((prev) => !prev)}
              >
                Post a Comment
              </Button>
            )}
            {showCommentEditor && (
              <form onSubmit={handleSubmit} className="mb-8">
                <RichTextEditor
                  value={content}
                  onChange={(val: string) => setContent(val)}
                  placeholder="Enter your comment..."
                />
                <div className="flex items-center mt-5 justify-between">
                  <Button
                    type="submit"
                    disabled={createCommentMutation.isPending}
                  >
                    {createCommentMutation.isPending
                      ? "Posting..."
                      : "Post Comment"}
                  </Button>
                  <Button
                    variant={"destructive"}
                    type="button"
                    onClick={() => setShowCommentEditor((prev) => !prev)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </>
        )
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <h4 className="font-medium text-gray-900 mb-2">
              Join the Discussion
            </h4>
            <p className="text-gray-500 mb-4">
              Sign in to post replies and participate in the community.
            </p>
            <Button>Sign In to Reply</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6 pt-5">
        {comments.map((comment) => (
          <CommentItem
            topic={topic}
            key={comment.id}
            comment={comment}
            topicId={topic.id}
            session={session}
          />
        ))}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  topicId: string;
  depth?: number;
  parentAuthorName?: string;
  isLastChild?: boolean;
  topic: ForumTopic;
  session?: any;
}

function CommentItem({ comment, depth = 0, topic, session }: CommentItemProps) {
  const upvotes = comment.votes?.filter((v) => v.type === "UPVOTE").length || 0;
  const downvotes =
    comment.votes?.filter((v) => v.type === "DOWNVOTE").length || 0;
  const userVote = session?.session
    ? comment.votes?.find((v) => v.userId === session.user.id)?.type
    : null;

  return (
    <div className={`relative ${depth > 0 ? "pl-0" : ""}`}>
      <div className="flex gap-3 items-start group">
        <div className="flex-1 min-w-0">
          <div className={`py-3`}>
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10 border border-teal-300">
                <AvatarImage src={comment.author.image || ""} />
                <AvatarFallback className="text-xs">
                  {comment.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="inline-flex items-center gap-1">
                  <span className="text-xs font-semibold text-neutral-700">
                    {comment.author.name}
                  </span>
                  <span className="text-xs hidden lg:block font-medium text-neutral-400">
                    {formatDateTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-xs font-semibold text-neutral-500">
                  {comment.author.role.toUpperCase()}
                </p>
              </div>
            </div>
            <p className="text-xs  lg:hidden pt-4 pb-2 font-medium text-neutral-400">
              {formatDateTime(comment.createdAt)}
            </p>
            {/* Comment text */}
            <TiptapRenderer content={comment.content} />

            <div className="mt-3 flex items-center gap-2">
              <VoteButton
                itemId={comment.id}
                itemType="POST"
                initialUpvotes={upvotes}
                initialDownvotes={downvotes}
                initialUserVote={userVote}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
