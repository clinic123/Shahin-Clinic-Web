"use server";

import "server-only";

import getBaseUrl from "@/lib/utils/base-url";

const BASE_URL = getBaseUrl();

export interface FetchCoursesParams {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CourseRecord {
  id: string;
  title: string;
  description: string;
  shortDescription: string | null;
  image: string;
  price: number;
  videoUrl?: string | null;
  category?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CoursesResponse {
  courses: CourseRecord[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function fetchCoursesData(
  params: FetchCoursesParams = {}
): Promise<CoursesResponse> {
  const url = new URL("/api/courses", BASE_URL);

  if (params.search) url.searchParams.set("search", params.search);
  if (params.category) url.searchParams.set("category", params.category);
  if (params.sort) url.searchParams.set("sort", params.sort);
  if (params.page) url.searchParams.set("page", params.page.toString());
  if (params.limit) url.searchParams.set("limit", params.limit.toString());

  const response = await fetch(url.toString(), {
    cache: "force-cache",
    next: {
      tags: ["courses"],
      revalidate: 60 * 10,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }

  return response.json();
}

