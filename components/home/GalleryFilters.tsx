"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "../ui/button";

interface GalleryFiltersProps {
  currentSearch: string;
  currentSort: string;
  currentLimit: number;
}

export function GalleryFilters({
  currentSearch,
  currentSort,
  currentLimit,
}: GalleryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch);
  const [sort, setSort] = useState(currentSort);
  const [limit, setLimit] = useState(currentLimit.toString());

  // Update URL when filters change
  const updateFilters = useCallback(
    (newSearch?: string, newSort?: string, newLimit?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (newSearch !== undefined) {
        if (newSearch.trim()) {
          params.set("search", newSearch.trim());
        } else {
          params.delete("search");
        }
      }
      
      if (newSort !== undefined) {
        if (newSort !== "newest") {
          params.set("sort", newSort);
        } else {
          params.delete("sort");
        }
      }
      
      if (newLimit !== undefined) {
        if (newLimit !== "12") {
          params.set("limit", newLimit);
        } else {
          params.delete("limit");
        }
      }
      
      // Reset to page 1 when filters change
      params.delete("page");
      
      router.push(`/gallery?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(search, undefined, undefined);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    updateFilters(undefined, value, undefined);
  };

  const handleLimitChange = (value: string) => {
    setLimit(value);
    updateFilters(undefined, undefined, value);
  };

  // Sync local state with URL params
  useEffect(() => {
    setSearch(currentSearch);
    setSort(currentSort);
    setLimit(currentLimit.toString());
  }, [currentSearch, currentSort, currentLimit]);

  return (
    <div className="space-y-4 mb-8">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search galleries by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
      </form>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Sort Dropdown */}
        <div className="flex-1">
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Limit Dropdown */}
        <div className="w-full sm:w-48">
          <Select value={limit} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8">8 per page</SelectItem>
              <SelectItem value="12">12 per page</SelectItem>
              <SelectItem value="16">16 per page</SelectItem>
              <SelectItem value="24">24 per page</SelectItem>
              <SelectItem value="32">32 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {(search || sort !== "newest" || limit !== "12") && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearch("");
              setSort("newest");
              setLimit("12");
              router.push("/gallery");
            }}
            className="w-full sm:w-auto"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}

