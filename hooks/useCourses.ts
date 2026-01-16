import {
  CourseFilters,
  CoursesResponse,
  deleteCourse,
  fetchCourseById,
  fetchCourses,
  updateCourse,
  UpdateCourseData,
} from "@/services/courseService";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

// Hook for fetching courses with filters
export const useCourses = (
  filters: CourseFilters = {},
  options?: Omit<
    UseQueryOptions<CoursesResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: () => fetchCourses(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData, // This is the correct replacement
    ...options,
  });
};

// Hook for fetching a single course
export const useCourse = (
  id: string,
  options?: Omit<
    UseQueryOptions<any, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchCourseById(id),
    enabled: !!id, // Only fetch if ID exists
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Hook for featured courses (homepage)
export const useFeaturedCourses = () => {
  return useCourses({ limit: 3, sort: "newest" });
};

// Hook for searching courses
export const useCourseSearch = (searchTerm: string, enabled = true) => {
  return useCourses(
    {
      search: searchTerm,
      sort: "relevance",
      limit: 20,
    },
    {
      enabled: enabled && searchTerm.length > 0,
      staleTime: 2 * 60 * 1000,
    }
  );
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseData }) =>
      updateCourse(id, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch courses list
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      // Update the specific course cache
      queryClient.setQueryData(["course", variables.id], data.course);
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch courses list
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      // Remove the specific course from cache
      queryClient.removeQueries({ queryKey: ["course", id] });
    },
  });
};
