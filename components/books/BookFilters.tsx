"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];

interface BookFiltersProps {
  initialSearch: string;
  initialSort: string;
}

export default function BookFilters({
  initialSearch,
  initialSort,
}: BookFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort || "newest");

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setSort(initialSort || "newest");
  }, [initialSort]);

  const applyFilters = useCallback(
    (nextSearch: string, nextSort: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (nextSearch) {
        params.set("search", nextSearch);
      } else {
        params.delete("search");
      }

      if (nextSort && nextSort !== "newest") {
        params.set("sort", nextSort);
      } else {
        params.delete("sort");
      }

      // Reset to page 1 when filters change
      params.delete("page");

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  useEffect(() => {
    const delay = setTimeout(() => {
      applyFilters(search.trim(), sort);
    }, 400);

    return () => clearTimeout(delay);
  }, [search, sort, applyFilters]);

  const handleReset = () => {
    setSearch("");
    setSort("newest");
  };

  return (
    <div className="rounded-3xl border bg-white/80 backdrop-blur px-6 py-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div>
          <p className="text-sm font-medium text-primary">Search & Filter</p>
          <p className="text-xs text-muted-foreground">
            Results update automatically while you type
          </p>
        </div>
        {(search || sort !== "newest") && (
          <button
            type="button"
            onClick={handleReset}
            className="text-sm font-medium text-primary hover:underline"
          >
            Reset filters
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="relative">
            <input
              id="book-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, author, keyword…"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
          </div>
        </div>

        <div>
          <div className="relative">
            <select
              id="book-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
                             className="w-full appearance-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
              ▼
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

