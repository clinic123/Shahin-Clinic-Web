import { CourseType } from "@/types";

export interface CoursesResponse {
  courses: CourseType[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CourseFilters {
  category?: string;
  sort?: string;
  search?: string;
  limit?: number;
  page?: number;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  price?: number;
  videoUrl?: string;
  category?: string;
  isActive?: boolean;
}

// Fetch courses with filters
export const fetchCourses = async (
  filters: CourseFilters = {}
): Promise<CoursesResponse> => {
  const { category, sort, search, limit, page = 1 } = filters;

  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (search) params.append("search", search);
  if (sort) params.append("sort", sort || "newest");
  if (limit) params.append("limit", limit.toString());
  params.append("page", page.toString());

  const res = await fetch(`/api/courses?${params.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch courses");
  }

  return res.json();
};

// Fetch single course by ID
export const fetchCourseById = async (id: string): Promise<any> => {
  const res = await fetch(`/api/courses/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch course");
  }

  return res.json();
};

// Update course
export const updateCourse = async (
  id: string,
  data: UpdateCourseData
): Promise<any> => {
  const res = await fetch(`/api/courses/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update course");
  }

  return res.json();
};

// Delete course
export const deleteCourse = async (id: string): Promise<void> => {
  const res = await fetch(`/api/courses/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete course");
  }
};
