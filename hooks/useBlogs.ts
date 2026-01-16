import { Post } from "@/prisma/generated/prisma";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  published?: boolean;
  categoryIds?: string[];
  tagNames?: string[];
  shortDescription?: string;
}

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: CreatePostData) => {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create post");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch posts queries after successful creation
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

interface PostsResponse {
  posts: Post[];
}

interface UseBlogsParams {
  sort?: "asc" | "desc" | "oldest" | "newest";
  category?: string;
  search?: string;
  limit?: number;
  enabled?: boolean;
}

export const useBlogs = ({
  sort,
  category,
  search,
  limit,
  enabled = true,
}: UseBlogsParams = {}) => {
  return useQuery<PostsResponse, Error>({
    queryKey: ["blogs", { sort, category, search, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (sort) params.append("sort", sort);
      if (category) params.append("category", category);
      if (search) params.append("search", search);
      if (limit) params.append("limit", limit.toString());

      const response = await fetch(`/api/posts?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      return response.json();
    },
    enabled,
    // Optional: Add staleTime and cacheTime for better performance
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUSersBlogs = ({
  sort,
  category,
  search,
  limit,
  enabled = true,
}: UseBlogsParams = {}) => {
  return useQuery<PostsResponse, Error>({
    queryKey: ["blogs", { sort, category, search, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (sort) params.append("sort", sort);
      if (category) params.append("category", category);
      if (search) params.append("search", search);
      if (limit) params.append("limit", limit.toString());

      const response = await fetch(
        `/api/blogs/user-blogs?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      return response.json();
    },

    enabled,

    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
