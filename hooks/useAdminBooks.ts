import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Book } from "./useBooks";

interface AdminBooksResponse {
  success: boolean;
  data: Book[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: any;
}

// GET all books for admin (including inactive)
export const useAdminBooks = (filters?: {
  search?: string;
  page?: number;
  limit?: number;
  author?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  const queryParams = new URLSearchParams();

  if (filters?.search) queryParams.append("search", filters.search);
  if (filters?.page) queryParams.append("page", filters.page.toString());
  if (filters?.limit) queryParams.append("limit", filters.limit.toString());
  if (filters?.author) queryParams.append("author", filters.author);
  if (filters?.minPrice)
    queryParams.append("minPrice", filters.minPrice.toString());
  if (filters?.maxPrice)
    queryParams.append("maxPrice", filters.maxPrice.toString());
  if (filters?.inStock) queryParams.append("inStock", filters.inStock);
  if (filters?.isActive) queryParams.append("isActive", filters.isActive);
  if (filters?.sortBy) queryParams.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

  const queryString = queryParams.toString();

  return useQuery({
    queryKey: ["admin-books", ...Object.values(filters || {})],
    queryFn: async (): Promise<AdminBooksResponse> => {
      const response = await fetch(`/api/admin/books?${queryString}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch books");
      }
      return response.json();
    },
  });
};

// Bulk update books
export const useBulkUpdateBooks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: Array<{ id: string; isActive?: boolean; stock?: number }>
    ) => {
      const response = await fetch("/api/books/bulk", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update books");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
};
