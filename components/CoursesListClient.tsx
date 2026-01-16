"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import CategoryFilter from "@/components/category-filter";
import { CourseCard } from "@/components/course-card";
import { buttonVariants } from "@/components/ui/button";
import type {
  CourseRecord,
  CoursesResponse,
  FetchCoursesParams,
} from "@/lib/actions/fetchCoursesData";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];

interface CoursesListClientProps {
  params?: "home" | "course" | "similar";
  redirectAuth: string;
  initialData: CoursesResponse;
  initialFilters: FetchCoursesParams;
}

const PAGE_SIZE_DEFAULT = 12;

export default function CoursesListClient({
  params = "course",
  redirectAuth,
  initialData,
  initialFilters,
}: CoursesListClientProps) {
  const showFilters = params === "course";
  const limit =
    initialFilters.limit ??
    (params === "home" || params === "similar" ? 4 : PAGE_SIZE_DEFAULT);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState(
    initialFilters.sort ?? "newest"
  );
  const [currentPage, setCurrentPage] = useState(initialFilters.page ?? 1);
  const [data, setData] = useState<CoursesResponse>(initialData);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    data.courses.forEach((course) => {
      if (course.category) unique.add(course.category);
    });
    return ["all", ...Array.from(unique)];
  }, [data.courses]);

  useEffect(() => {
    if (!showFilters) return;
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedSort, showFilters]);

  useEffect(() => {
    if (!showFilters) return;
    const controller = new AbortController();
    const fetchCourses = async () => {
      try {
        setIsFetching(true);
        setError(null);

        const url = new URL("/api/courses", window.location.origin);
        url.searchParams.set("page", currentPage.toString());
        url.searchParams.set("limit", limit.toString());
        url.searchParams.set("sort", selectedSort);
        if (selectedCategory !== "all") {
          url.searchParams.set("category", selectedCategory);
        }
        if (searchTerm.trim()) {
          url.searchParams.set("search", searchTerm.trim());
        }

        const response = await fetch(url.toString(), {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const json = (await response.json()) as CoursesResponse;
        setData(json);
      } catch (err) {
        if ((err as any)?.name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "Failed to fetch courses"
        );
      } finally {
        setIsFetching(false);
      }
    };

    fetchCourses();

    return () => controller.abort();
  }, [
    currentPage,
    limit,
    searchTerm,
    selectedCategory,
    selectedSort,
    showFilters,
  ]);

  if (params !== "course") {
    const title =
      params === "similar" ? "Explore More Courses" : "Browse Our Courses";
    const description =
      params === "similar"
        ? "Discover more content that complements your current selection."
        : "Discover the perfect course to advance your skills and career.";
    const coursesToShow =
      params === "home" ? data.courses.slice(0, limit) : data.courses;

    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`mb-12 ${
              params === "similar" ? "text-left" : "text-center"
            }`}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {coursesToShow.map((course) => (
              <CourseCard
                key={course.id}
                course={course as any}
                redirectAuth={redirectAuth}
              />
            ))}
          </div>

          {params === "home" && (
            <div className="text-center mt-10">
              <Link href="/courses" className={buttonVariants()}>
                View all courses
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  const pagination = data.pagination;

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Browse Our Courses
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the perfect course to advance your skills and career
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Search Courses
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <CategoryFilter
              selectedCategory={selectedCategory}
              handleCategoryChange={(category) => {
                setSelectedCategory(category);
                setCurrentPage(1);
              }}
              categories={categories}
            />

            <div>
              <label
                htmlFor="sort"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Sort By
              </label>
              <select
                id="sort"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span>Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Category: {selectedCategory}
                </span>
              )}
              {selectedSort !== "newest" && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Sort:{" "}
                  {
                    SORT_OPTIONS.find((opt) => opt.value === selectedSort)
                      ?.label
                  }
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedSort("newest");
                setCurrentPage(1);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-600">
            {error}
          </div>
        )}

        {isFetching && (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        )}

        {data.courses.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course as CourseRecord}
                redirectAuth={redirectAuth}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrevPage || isFetching}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(pagination.totalPages, prev + 1)
                )
              }
              disabled={!pagination.hasNextPage || isFetching}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
