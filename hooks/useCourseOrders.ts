import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Fetch course orders with filters
const fetchCourseOrders = async (filters: any) => {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value.toString());
  });

  const response = await fetch(`/api/admin/course-orders?${queryParams}`);
  if (!response.ok) throw new Error("Failed to fetch course orders");
  return response.json();
};

// Update course order
const updateCourseOrder = async (data: { id: string; updates: any }) => {
  const response = await fetch(`/api/admin/course-orders/${data.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data.updates),
  });
  if (!response.ok) throw new Error("Failed to update course order");
  return response.json();
};

// Bulk update course orders
const bulkUpdateCourseOrders = async (data: {
  orderIds: string[];
  status: string;
}) => {
  const response = await fetch("/api/admin/course-orders", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update course orders");
  return response.json();
};

// Delete course order
const deleteCourseOrder = async (id: string) => {
  const response = await fetch(`/api/admin/course-orders/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete course order");
  return response.json();
};

// Hook for fetching course orders
export const useCourseOrders = (filters: any) => {
  return useQuery({
    queryKey: ["course-orders", filters],
    queryFn: () => fetchCourseOrders(filters),
  });
};

// Hook for updating a course order
export const useUpdateCourseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCourseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-orders"] });
    },
  });
};

// Hook for bulk updating course orders
export const useBulkUpdateCourseOrders = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkUpdateCourseOrders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-orders"] });
    },
  });
};

// Hook for deleting a course order
export const useDeleteCourseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCourseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-orders"] });
    },
  });
};
