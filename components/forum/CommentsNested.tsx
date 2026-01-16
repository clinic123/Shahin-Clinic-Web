"use client";
import TiptapRenderer from "@/components/TiptapRenderer";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LockIcon } from "lucide-react";
import { useState } from "react";

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    image: string | null;
  };
  replies: Comment[];
  topicId?: string | null;
  parentId?: string | null;
  parentAuthor?: {
    name: string;
    id: string;
  };
}

interface CommentSectionProps {
  topicId: string;
  isLocked?: boolean;
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

export function ForumCommentSection({
  topicId,
  isLocked,
}: CommentSectionProps) {
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const {
    data: comments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["topic-comments", topicId],
    queryFn: () => fetchComments(topicId),
    enabled: !!topicId,
  });

  const createCommentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topic-comments", topicId] });
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
      topicId,
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
    <div className="mt-12">
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
          <form onSubmit={handleSubmit} className="mb-8">
            <RichTextEditor
              value={content}
              onChange={(val: string) => setContent(val)}
              placeholder="Enter your reply..."
            />
            <button
              type="submit"
              disabled={createCommentMutation.isPending}
              className="mt-2 bg-primary text-primary-foreground px-4 py-2 rounded-md disabled:opacity-50"
            >
              {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
            </button>
          </form>
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
          <CommentItem key={comment.id} comment={comment} topicId={topicId} />
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
}

// SVG Threading Component
function ThreadLine({
  depth,
  isLastChild,
}: {
  depth: number;
  isLastChild?: boolean;
}) {
  if (depth === 0) return null;

  return (
    <div
      className={`
        absolute top-0 bottom-0 left-4 w-6
        ${depth === 1 ? "left-4" : ""}
        ${depth === 2 ? "left-8" : ""}
        ${depth === 3 ? "left-12" : ""}
      `}
    >
      {/* Horizontal connector line */}
      <svg
        className="absolute top-5 -left-4 text-gray-200"
        width="16"
        height="20"
        viewBox="0 0 16 20"
      >
        {/* Curved line for visual appeal */}
        <path
          d="M16 0 C8 0, 8 10, 0 10"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        {isLastChild && (
          <path
            d="M0 10 L0 20"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        )}
      </svg>

      {/* Vertical thread line */}
      {!isLastChild && (
        <div
          className="absolute top-5 bottom-0 left-0 w-0.5 bg-gray-200"
          style={{ left: "-4px" }}
        />
      )}
    </div>
  );
}

function CommentItem({
  comment,
  topicId,
  depth = 0,
  parentAuthorName,
  isLastChild = true,
}: CommentItemProps) {
  const { data } = useSession();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const queryClient = useQueryClient();

  const createReplyMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topic-comments", topicId] });
      setReplyContent("");
      setIsReplying(false);
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const maxDepth = 3;
  const canReply = depth < maxDepth;
  const replies = comment.replies || [];
  const hasReplies = replies.length > 0;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.session) return;

    createReplyMutation.mutate({
      content: replyContent,
      topicId,
      parentId: comment.id,
    });
  };

  return (
    <div className={`relative ${depth > 0 ? "pl-0 xl:pl-12" : ""}`}>
      {/* Thread lines for visual hierarchy */}
      <ThreadLine depth={depth} isLastChild={isLastChild} />

      <div className="flex gap-3 items-start group">
        {/* User Avatar with enhanced styling */}
        <div className="flex-shrink-0">
          <Avatar className="border-2 border-white shadow-sm group-hover:border-primary transition-colors">
            <AvatarImage
              src={comment.author.image || "/avatar.jpg"}
              alt={comment.author.name}
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-gray-700">
              {comment.author.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div
            className={`
            rounded-lg px-4 py-3 transition-all duration-200
            ${
              depth === 0
                ? "bg-white border border-gray-200 shadow-sm hover:shadow-md"
                : "bg-gray-50 hover:bg-gray-100"
            }
          `}
          >
            {/* Author info with improved typography */}
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-sm text-gray-900">
                {comment.author.name}
              </h4>
              {depth > 0 && (
                <>
                  <svg
                    className="w-3 h-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <span className="text-xs text-primary font-medium">
                    @{parentAuthorName}
                  </span>
                </>
              )}
            </div>

            {/* Comment text */}
            <TiptapRenderer content={comment.content} />
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex items-center gap-4 mt-3 px-1">
            {canReply && data?.session && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-primary font-medium transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
                Reply
              </button>
            )}

            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-primary font-medium transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showReplies ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                {showReplies
                  ? "Hide replies"
                  : `${replies.length} ${
                      replies.length === 1 ? "reply" : "replies"
                    }`}
              </button>
            )}
          </div>

          {/* Enhanced Reply Form */}
          {isReplying && data?.session && (
            <form
              onSubmit={handleReply}
              className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Replying to ${comment.author.name}...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={createReplyMutation.isPending}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
                  >
                    {createReplyMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Reply"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsReplying(false)}
                    className="px-3 py-2 text-gray-600 text-sm hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Nested Replies with improved styling */}
          {hasReplies && showReplies && (
            <div className="mt-4 space-y-4">
              {replies.map((reply, index) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  topicId={topicId}
                  depth={depth + 1}
                  parentAuthorName={comment.author.name}
                  isLastChild={index === replies.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
