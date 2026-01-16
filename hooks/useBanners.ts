// lib/hooks/useBanners.ts
import { BannerFormData } from "@/lib/validations/banner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Banner {
  id: string;
  heading: string[];
  description: string;
  image: string;
  button: string;
  buttonLink?: string | null;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// GET all banners
export function useBanners(params?: { published?: boolean }) {
  return useQuery({
    queryKey: ["banners", params],
    queryFn: async (): Promise<Banner[]> => {
      const queryParams = new URLSearchParams();
      if (params?.published !== undefined) {
        queryParams.set("published", params.published.toString());
      }

      const response = await fetch(`/api/banners?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch banners");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
  });
}

// GET single banner
export function useBanner(id: string) {
  return useQuery({
    queryKey: ["banner", id],
    queryFn: async (): Promise<Banner> => {
      const response = await fetch(`/api/banners/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch banner");
      }
      const data = await response.json();
      return data.banner;
    },
    enabled: !!id,
  });
}

// CREATE banner
export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BannerFormData) => {
      const response = await fetch("/api/banners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create banner");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}

// UPDATE banner
export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BannerFormData }) => {
      const response = await fetch(`/api/banners/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update banner");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      queryClient.invalidateQueries({ queryKey: ["banner", variables.id] });
    },
  });
}

// DELETE banner
export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/banners/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete banner");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}

// Reorder banners
export function useReorderBanners() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reorderedBanners: { id: string; order: number }[]) => {
      const response = await fetch("/api/banners/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ banners: reorderedBanners }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reorder banners");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}
