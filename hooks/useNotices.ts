import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Notice {
  id: string;
  title: string;
  summary?: string;
  content: string;
  category: string;
  isPublished: boolean;
  isPinned: boolean;
  createdAt: string;
  publishedAt?: string;
  expiresAt?: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

interface NoticesResponse {
  notices: Notice[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface CreateNoticeData {
  title: string;
  content: string;
  summary?: string;
  category: string;
  isPublished: boolean;
  isPinned: boolean;
  expiresAt?: Date | null;
}

interface UpdateNoticeData extends Partial<CreateNoticeData> {
  id: string;
}

// Fetch notices with filters
export const useNotices = (filters?: {
  page?: number;
  limit?: number;
  category?: string;
  publishedOnly?: boolean;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["notices", filters],
    queryFn: async (): Promise<NoticesResponse> => {
      const params = new URLSearchParams();

      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.category && filters.category !== "all") {
        params.append("category", filters.category);
      }
      if (filters?.publishedOnly) {
        params.append("publishedOnly", "true");
      }
      if (filters?.search) {
        params.append("search", filters.search);
      }

      const response = await fetch(`/api/notices?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch notices");
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Fetch single notice
export const useNotice = (id: string) => {
  return useQuery({
    queryKey: ["notices", id],
    queryFn: async (): Promise<{ notice: Notice }> => {
      const response = await fetch(`/api/notices/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch notice");
      }

      return response.json();
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Create notice mutation
export const useCreateNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateNoticeData): Promise<{ notice: Notice }> => {
      const response = await fetch("/api/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create notice");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      toast.success("Notice created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Update notice mutation
export const useUpdateNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateNoticeData): Promise<{ notice: Notice }> => {
      const response = await fetch(`/api/notices/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update notice");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Update the specific notice in cache
      queryClient.setQueryData(["notices", variables.id], data);

      // Invalidate the notices list
      queryClient.invalidateQueries({ queryKey: ["notices"] });

      toast.success("Notice updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Delete notice mutation
export const useDeleteNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ message: string }> => {
      const response = await fetch(`/api/notices/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete notice");
      }

      return response.json();
    },
    onSuccess: (_, id) => {
      // Remove the notice from cache
      queryClient.removeQueries({ queryKey: ["notices", id] });

      // Invalidate the notices list
      queryClient.invalidateQueries({ queryKey: ["notices"] });

      toast.success("Notice deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Toggle notice publish status
export const useToggleNoticePublish = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isPublished,
    }: {
      id: string;
      isPublished: boolean;
    }): Promise<{ notice: Notice }> => {
      const response = await fetch(`/api/notices/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublished }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update notice");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(["notices", variables.id], data);
      queryClient.invalidateQueries({ queryKey: ["notices"] });

      toast.success(
        `Notice ${
          variables.isPublished ? "published" : "unpublished"
        } successfully`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Toggle notice pin status
export const useToggleNoticePin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isPinned,
    }: {
      id: string;
      isPinned: boolean;
    }): Promise<{ notice: Notice }> => {
      const response = await fetch(`/api/notices/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPinned }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update notice");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["notices", variables.id], data);
      queryClient.invalidateQueries({ queryKey: ["notices"] });

      toast.success(
        `Notice ${variables.isPinned ? "pinned" : "unpinned"} successfully`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
