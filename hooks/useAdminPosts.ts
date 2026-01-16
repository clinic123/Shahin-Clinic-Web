// hooks/useAdminPosts.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface AdminPost {
  id: string;
  title: string;
  content: {
    html: string;
    text: string;
    version: string;
    createdAt: string;
  };
  excerpt?: string;
  published: boolean;
  publishedAt: string | null;
  featured: boolean;
  featuredImage?: string;
  author: { name: string };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPostsResponse {
  posts: AdminPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Fetch all posts for admin (including drafts)
export function useAdminPosts(page: number = 1, limit: number = 10) {
  return useQuery<AdminPostsResponse>({
    queryKey: ["admin-posts", page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/admin/blogs?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      return response.json();
    },
  });
}

export function useAdminDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      const response = await fetch(`/api/blogs/${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete post";

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `HTTP error! status: ${response.status}`;
        }

        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
}
