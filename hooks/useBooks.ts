// hooks/useBooks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  rokomariLinkForDirectBuy?: string;
  amazonLink?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BooksResponse {
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

interface BookResponse {
  success: boolean;
  data: Book;
}

// GET all books with filters
// In your existing useBooks.ts, add this to the useBooks hook
export const useBooks = (filters?: {
  search?: string;
  page?: number;
  limit?: number;
  author?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isActive?: boolean | undefined; // Add this for admin
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
  if (filters?.inStock !== undefined)
    queryParams.append("inStock", filters.inStock.toString());
  if (filters?.sortBy) queryParams.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) queryParams.append("sortOrder", filters.sortOrder);
  // Add isActive for admin
  if (filters?.isActive !== undefined)
    queryParams.append("isActive", filters.isActive.toString());

  const queryString = queryParams.toString();
  const endpoint =
    filters?.isActive === undefined ? "/api/admin/books" : "/api/books";

  return useQuery({
    queryKey: ["books", ...Object.values(filters || {})],
    queryFn: async (): Promise<BooksResponse> => {
      const response = await fetch(`${endpoint}?${queryString}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch books");
      }
      return response.json();
    },
  });
};

// GET single book by ID
export const useBook = (id: string) => {
  return useQuery({
    queryKey: ["book", id],
    queryFn: async (): Promise<BookResponse> => {
      const response = await fetch(`/api/books/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch book");
      }
      return response.json();
    },
    enabled: !!id,
  });
};

// CREATE book
export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      bookData: Omit<Book, "id" | "createdAt" | "updatedAt">
    ) => {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create book");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
};

// UPDATE book
export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...bookData }: Partial<Book> & { id: string }) => {
      const response = await fetch(`/api/books/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update book");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["book", variables.id] });
    },
  });
};

// DELETE book
export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/books/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete book");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
};

// SEARCH books

export const useSearchBooks = (query: string, limit?: number) => {
  return useQuery({
    queryKey: ["books", "search", query, limit],
    queryFn: async (): Promise<{
      success: boolean;
      data: Book[];
      meta?: any;
    }> => {
      if (!query) return { success: true, data: [] };

      const params = new URLSearchParams({ q: query });
      if (limit) params.append("limit", limit.toString());

      const response = await fetch(`/api/books/search?${params}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to search books");
      }
      return response.json();
    },
    enabled: !!query,
  });
};
