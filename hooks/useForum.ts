import { useSession } from "@/lib/auth-client";
import type {
  CreateCategoryData,
  ForumCategoryDetails,
  ForumCategoryWithRelations,
  ForumTopic,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  order: number;
  isActive: boolean;
  topics: ForumTopic[];
  _count: {
    topics: number;
  };
}

export interface ForumPost {
  id: string;
  content: string;
  isAnswer: boolean;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
    role: string;
  };
  topicId: string;
  parentId?: string;
  depth: number;
  _count: {
    replies: number;
    votes: number;
  };
  votes?: Array<{
    userId: string;
    type: "UPVOTE" | "DOWNVOTE";
  }>;
  replies?: ForumPost[];
}

export function useForumPosts(topicId: string) {
  return useQuery({
    queryKey: ["forum-topics", topicId],
    queryFn: async (): Promise<ForumTopic[]> => {
      const response = await fetch(`/api/forum/topics?=${topicId}`);
      if (!response.ok) throw new Error("Failed to fetch topics");
      return response.json();
    },
    enabled: !!topicId,
  });
}

export function useForumCategories() {
  return useQuery({
    queryKey: ["forum-categories"],
    queryFn: async (): Promise<ForumCategoryWithRelations[]> => {
      const response = await fetch("/api/forum/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });
}
export function useForumTopics(
  options: {
    category?: string;
    sort?: string;
    search?: string;
    limit?: number;
    page?: number;
  } = {}
) {
  const { category, sort, search, limit, page } = options;

  return useQuery({
    queryKey: ["forum-topics", { category, sort, search, limit, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (sort) params.append("sort", sort);
      if (search) params.append("search", search);
      if (limit) params.append("limit", limit.toString());
      if (page) params.append("page", page.toString());

      const response = await fetch(`/api/forum/topics?${params}`);
      if (!response.ok) throw new Error("Failed to fetch topics");
      return response.json();
    },
  });
}

export function useForumTopic(slug: string) {
  return useQuery({
    queryKey: ["forum-topic", slug],
    queryFn: async (): Promise<ForumTopic> => {
      const response = await fetch(`/api/forum/topics/${slug}`);
      if (!response.ok) throw new Error("Failed to fetch topic");
      return response.json();
    },
    enabled: !!slug,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: {
      content: string;
      topicId: string;
      parentId?: string;
    }) => {
      const response = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create post");
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["forum-posts", variables.topicId],
      });
      queryClient.invalidateQueries({
        queryKey: ["forum-topic", variables.topicId],
      });

      // Invalidate replies if it's a nested reply
      if (variables.parentId) {
        queryClient.invalidateQueries({
          queryKey: ["forum-post-replies", variables.parentId],
        });
      }

      // Emit socket event for real-time notification
      if (typeof window !== "undefined" && (window as any).socket) {
        (window as any).socket.emit("new-reply", {
          topicId: variables.topicId,
          post: data,
          author: session?.user,
          parentId: variables.parentId,
        });
      }
    },
  });
}
export function useVote() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: {
      type: "UPVOTE" | "DOWNVOTE";
      topicId?: string;
      postId?: string;
      slug?: string; // Add slug for topic votes
    }) => {
      const response = await fetch("/api/forum/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to vote");
      return response.json();
    },
    onMutate: async (variables) => {
      const userId = session?.user?.id;
      if (!userId) return;

      // For topic votes, we use slug to update the cache
      if (variables.topicId && variables.slug) {
        await queryClient.cancelQueries({
          queryKey: ["forum-topic", variables.slug],
        });
        const previousTopic = queryClient.getQueryData<ForumTopic>([
          "forum-topic",
          variables.slug,
        ]);
        if (previousTopic) {
          // ... optimistic update logic (same as before)
          const optimisticTopic = { ...previousTopic };
          queryClient.setQueryData(
            ["forum-topic", variables.slug],
            optimisticTopic
          );
        }
        return { previousTopic };
      }

      // For post votes, we don't have a slug, so we invalidate the post replies
      // We can't do optimistic update for posts because we don't have the post in the cache by id?
      // We don't have a hook for post by id, so we just invalidate.
      // We'll leave post votes without optimistic update for now.
    },
    onError: (err, variables, context) => {
      if (variables.topicId && variables.slug) {
        queryClient.setQueryData(
          ["forum-topic", variables.slug],
          context?.previousTopic
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Invalidate the topic by slug if we have it
      if (variables.topicId && variables.slug) {
        queryClient.invalidateQueries({
          queryKey: ["forum-topic", variables.slug],
        });
      }
      // Also invalidate the topics list
      queryClient.invalidateQueries({ queryKey: ["forum-topics"] });
      // For post votes, invalidate the post replies
      if (variables.postId) {
        queryClient.invalidateQueries({ queryKey: ["forum-post-replies"] });
      }
    },
  });
}
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/forum/posts?postId=${postId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete post");
      return response.json();
    },
    onSuccess: (data, postId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["forum-topics"] });
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      queryClient.invalidateQueries({ queryKey: ["forum-post-replies"] });
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topicId: string) => {
      const response = await fetch(`/api/forum/topics/${topicId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete topic");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-topics"] });
      queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
    },
  });
}

export function usePostReplies(parentId?: string | null) {
  return useQuery({
    queryKey: ["forum-post-replies", parentId],
    queryFn: async (): Promise<ForumPost[]> => {
      if (!parentId) return []; // prevent API call completely
      const response = await fetch(`/api/forum/posts?parentId=${parentId}`);
      if (!response.ok) throw new Error("Failed to fetch replies");
      return response.json();
    },
    enabled: !!parentId,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      const response = await fetch("/api/forum/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create category");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await fetch(`/api/forum/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete category");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
    },
  });
}

export function useForumCategory(slug: string) {
  return useQuery({
    queryKey: ["forum-category", slug],
    queryFn: async (): Promise<ForumCategoryDetails> => {
      const response = await fetch(`/api/forum/categories/${slug}`);
      if (!response.ok) throw new Error("Failed to fetch category");
      return response.json();
    },
    enabled: !!slug,
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      categoryId: string;
    }) => {
      const response = await fetch("/api/forum/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create topic");
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["forum-category", variables.categoryId],
      });
      queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
    },
  });
}
