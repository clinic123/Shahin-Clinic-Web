// hooks/useProducts.ts
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import type { Post } from "@/prisma/generated/prisma";
export interface FetchBlogsParams {
  category?: string;
  sort?: string;
  search?: string;
  params: "homepage" | "blogs";
}

// Enhanced fetch function with better error handling
export const fetchBlogs = async ({
  category,
  sort = "newest",
  search,
  params,
}: FetchBlogsParams): Promise<Post[]> => {
  const queryParams = new URLSearchParams();

  // Add parameters only if they exist
  if (category) queryParams.append("category", category);
  if (search) queryParams.append("search", search);
  queryParams.append("sort", sort);

  // Add limit for homepage
  if (params === "homepage") {
    queryParams.append("limit", "8");
  }

  const url = `${
    process.env.NEXT_PUBLIC_BASE_URL
  }/api/posts/?${queryParams.toString()}`;

  const res = await fetch(url, {
    // Add caching strategy if needed
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });

  if (!res.ok) {
    // Try to get error message from response
    let errorMessage = `Failed to fetch products: ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Ignore if no JSON error response
    }
    throw new Error(errorMessage);
  }

  return res.json();
};

// Hook with TypeScript generics for better type safety
export function useBlogs(
  params: FetchBlogsParams,
  options?: Omit<UseQueryOptions<Post[], Error>, "queryKey" | "queryFn">
) {
  return useQuery<Post[], Error>({
    queryKey: ["blogs", params],
    queryFn: () => fetchBlogs(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// Specialized hooks for common use cases
export function useHomepageBlogs() {
  return useBlogs({
    params: "homepage",
    sort: "newest",
  });
}

export function useCategoryBlogs(category: string, sort?: string) {
  return useBlogs({
    category,
    sort: sort || "newest",
    params: "blogs",
  });
}

export function useSearchBlogs(search: string, sort?: string) {
  return useBlogs({
    search,
    sort: sort || "newest",
    params: "blogs",
  });
}
