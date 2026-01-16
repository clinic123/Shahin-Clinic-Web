import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCategories() {
  const queryClient = useQueryClient();

  // Fetch all categories
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  // Create category
  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create category");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return { categoriesQuery, createCategoryMutation };
}
