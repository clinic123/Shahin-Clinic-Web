import { GalleryFormData } from "@/lib/validations/gallery";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export interface Gallery {
  id: string;
  title: string;
  description: string;
  featuredImage: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// GET all galleries
export function useGalleries(params?: {
  sort?: string;
  search?: string;
  limit?: number;
}) {
  return useInfiniteQuery({
    queryKey: ["galleries", params],
    queryFn: async ({
      pageParam = 1,
    }): Promise<{ galleries: Gallery[]; nextPage?: number }> => {
      const queryParams = new URLSearchParams();
      if (params?.sort) queryParams.set("sort", params.sort);
      if (params?.search) queryParams.set("search", params.search);
      if (params?.limit) queryParams.set("limit", params.limit.toString());
      queryParams.set("page", pageParam.toString());

      const response = await fetch(`/api/galleries?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch galleries");
      }
      const data = await response.json();

      // Return both galleries and next page info
      return {
        galleries: data,
        nextPage:
          data.length >= (params?.limit || 10) ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// GET single gallery
export function useGallery(id: string) {
  return useQuery({
    queryKey: ["gallery", id],
    queryFn: async (): Promise<{ gallery: Gallery }> => {
      const response = await fetch(`/api/galleries/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch gallery");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

// CREATE gallery
export function useCreateGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GalleryFormData) => {
      const response = await fetch("/api/galleries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create gallery");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
    },
  });
}

// UPDATE gallery
export function useUpdateGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: GalleryFormData }) => {
      const response = await fetch(`/api/galleries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update gallery");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
      queryClient.invalidateQueries({ queryKey: ["gallery", variables.id] });
    },
  });
}

// DELETE gallery
export function useDeleteGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/galleries/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete gallery");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
    },
  });
}
