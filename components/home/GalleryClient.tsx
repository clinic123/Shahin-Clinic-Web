"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { GalleryRecord } from "@/lib/actions/fetchGalleriesData";

import { Spinner } from "../ui/spinner";

interface GalleryClientProps {
  initialGalleries: GalleryRecord[];
  initialLimit: number;
}

export default function GalleryClient({
  initialGalleries,
  initialLimit,
}: GalleryClientProps) {
  const [galleries, setGalleries] = useState(initialGalleries);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          void loadMore();
        }
      },
      { threshold: 0.5 }
    );

    const node = loadMoreRef.current;
    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [hasMore, isFetchingMore]);

  useEffect(() => {
    void fetchGalleries();
  }, [debouncedSearch, sort]);

  const fetchGalleries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await requestGalleries(1);
      setGalleries(data);
      setPage(1);
      setHasMore(data.length === initialLimit);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load galleries."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore) return;
    try {
      setIsFetchingMore(true);
      const nextPage = page + 1;
      const data = await requestGalleries(nextPage);
      setGalleries((prev) => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(data.length === initialLimit);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load more galleries."
      );
      setHasMore(false);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const requestGalleries = async (pageParam: number) => {
    const params = new URLSearchParams({
      page: pageParam.toString(),
      limit: initialLimit.toString(),
      sort,
    });
    if (debouncedSearch) params.set("search", debouncedSearch);

    const response = await fetch(`/api/galleries?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to fetch galleries");
    }
    return (await response.json()) as GalleryRecord[];
  };

  const displayGalleries = galleries;

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!displayGalleries.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No galleries available.</p>
      </div>
    );
  }

  return (
    <div className="container py-16">
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search galleries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label htmlFor="sort" className="text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner className="w-9 h-9 text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayGalleries.map((gallery) => (
            <div
              key={gallery.id}
              className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => setSelectedImage(gallery.featuredImage)}
            >
              <div className="aspect-w-4 aspect-h-3 bg-gray-200">
                <Image
                  src={gallery.featuredImage}
                  alt={gallery.title}
                  width={320}
                  height={212}
                  className="w-full h-86 object-cover brightness-75 transition-all duration-300"
                />
              </div>

              <div className="absolute inset-0 bg-opacity-40 transition-all duration-300 flex items-end">
                <div className="p-3 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-semibold text-lg truncate">
                    {gallery.title}
                  </h3>
                  <p className="text-sm opacity-100 transition-opacity duration-300 truncate">
                    {gallery.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
            <Image
              src={selectedImage}
              alt="Selected image"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {isFetchingMore && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      <div ref={loadMoreRef} className="h-4" />
    </div>
  );
}
