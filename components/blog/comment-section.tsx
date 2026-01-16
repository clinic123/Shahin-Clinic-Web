"use client";

import { useSession } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "../ui/button";

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    image: string | null;
  };
  replies: Comment[];

  parentId?: string | null;
  parentAuthor?: {
    // Add parent author info
    name: string;
    id: string;
  };
}

interface CommentSectionProps {
  postId: string;
  postSlug?: string;
}

// API functions
const fetchComments = async (postId: string): Promise<Comment[]> => {
  const response = await fetch(`/api/comments?postId=${postId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }
  return response.json();
};

const createComment = async (commentData: {
  content: string;
  postId: string;
  parentId?: string;
}) => {
  const response = await fetch("/api/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error creating comment");
  }

  return response.json();
};

export function CommentSection({ postId, postSlug }: CommentSectionProps) {
  const { data } = useSession();
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  // Fetch comments with TanStack Query
  const {
    data: comments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
    enabled: !!postId,
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      // Invalidate and refetch comments after successful creation
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setContent("");
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.session) return;

    createCommentMutation.mutate({
      content,
      postId,
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
      <h3 className="text-2xl font-bold mb-6">Comments</h3>
      {data?.session ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <button
            type="submit"
            disabled={createCommentMutation.isPending}
            className="mt-2 bg-primary text-primary-foreground px-4 py-2 rounded-md disabled:opacity-50"
          >
            {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <div>
          <p className="pb-4">Please log in to comment.</p>
          <Link
            className={buttonVariants()}
            href={`/login?redirect=/blogs/${postSlug}`}
          >
            Login
          </Link>
        </div>
      )}
      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={postId} />
        ))}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  depth?: number;
  parentAuthorName?: string; // Add parent author name prop
}

function CommentItem({
  comment,
  postId,
  depth = 0,
  parentAuthorName,
}: CommentItemProps) {
  const { data } = useSession();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const queryClient = useQueryClient();

  // Reply mutation
  const createReplyMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      // Invalidate and refetch comments after successful reply
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setReplyContent("");
      setIsReplying(false);
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  // Maximum depth to prevent infinite nesting
  const maxDepth = 3;
  const canReply = depth < maxDepth;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.session) return;

    createReplyMutation.mutate({
      content: replyContent,
      postId,
      parentId: comment.id,
    });
  };

  const replies = comment.replies || [];
  const hasReplies = replies.length > 0;

  return (
    <div className={`flex gap-3 ${depth > 0 ? "ml-4" : ""}`}>
      {/* User Avatar */}
      <div className="flex-shrink-0">
        {comment.author.image ? (
          <img
            src={comment.author.image}
            alt={comment.author.name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">
              {comment.author.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm">{comment.author.name}</h4>
          </div>
          <p className="text-gray-800 text-sm">
            {parentAuthorName && (
              <span className="text-primary font-medium">
                @{parentAuthorName}{" "}
              </span>
            )}
            {comment.content}
          </p>
        </div>

        {/* Reply Actions */}
        <div className="flex items-center gap-4 mt-2 px-1">
          {canReply && data?.session && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs text-gray-600 hover:text-primary font-medium"
            >
              Reply
            </button>
          )}

          {hasReplies && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-xs text-gray-600 hover:text-primary font-medium"
            >
              {showReplies
                ? "Hide replies"
                : `Show ${replies.length} ${
                    replies.length === 1 ? "reply" : "replies"
                  }`}
            </button>
          )}
        </div>

        {/* Reply Form */}
        {isReplying && data?.session && (
          <form onSubmit={handleReply} className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <button
              type="submit"
              disabled={createReplyMutation.isPending}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm disabled:opacity-50"
            >
              {createReplyMutation.isPending ? "..." : "Reply"}
            </button>
            <button
              type="button"
              onClick={() => setIsReplying(false)}
              className="px-3 py-2 text-gray-600 text-sm hover:text-gray-800"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Nested Replies */}
        {hasReplies && showReplies && (
          <div className="mt-4 space-y-4 border-l-2 border-gray-100 pl-4">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                depth={depth + 1}
                parentAuthorName={comment.author.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
