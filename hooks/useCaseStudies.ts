import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  published: boolean;
  publishedAt?: Date | null;
  featured: boolean;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
  authorId: string;
  author?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  shortDescription: string;
  patientName?: string | null;
  patientAge?: number | null;
  condition?: string | null;
  treatmentDuration?: string | null;
  outcome?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateCaseStudyData {
  title: string;
  content: string;
  excerpt?: string;
  published?: boolean;
  shortDescription?: string;
  featuredImage: string;
  featuredImageAlt?: string;
  patientName?: string;
  patientAge?: number;
  condition?: string;
  treatmentDuration?: string;
  outcome?: string;
}

interface UpdateCaseStudyData extends Partial<CreateCaseStudyData> {
  slug: string;
}

interface UseCaseStudiesParams {
  sort?:
    | "title_asc"
    | "title_desc"
    | "published_at_asc"
    | "published_at_desc"
    | "oldest"
    | "newest";
  search?: string;
  limit?: number;
  published?: boolean;
  enabled?: boolean;
}

export const useCaseStudies = ({
  sort,
  search,
  limit,
  published,
  enabled = true,
}: UseCaseStudiesParams = {}) => {
  return useQuery<CaseStudy[], Error>({
    queryKey: ["case-studies", { sort, search, limit, published }],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (sort) params.append("sort", sort);
      if (search) params.append("search", search);
      if (limit) params.append("limit", limit.toString());
      if (published !== undefined)
        params.append("published", published.toString());

      const response = await fetch(`/api/case-studies?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch case studies");
      }

      return response.json();
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCaseStudy = (slug: string, enabled: boolean = true) => {
  return useQuery<{ caseStudy: CaseStudy }, Error>({
    queryKey: ["case-study", slug],
    queryFn: async () => {
      const response = await fetch(`/api/case-studies/${slug}`);

      if (!response.ok) {
        throw new Error("Failed to fetch case study");
      }

      return response.json();
    },
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateCaseStudy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCaseStudyData) => {
      const response = await fetch("/api/case-studies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create case study");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["case-studies"],
        refetchType: "active",
      });
    },
  });
};

export const useUpdateCaseStudy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCaseStudyData) => {
      const { slug, ...updateData } = data;
      const response = await fetch(`/api/case-studies/${slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update case study");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["case-studies"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["case-study", variables.slug],
        refetchType: "active",
      });
    },
  });
};

export const useDeleteCaseStudy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      const response = await fetch(`/api/case-studies/${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete case study");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["case-studies"],
        refetchType: "active",
      });
    },
  });
};
