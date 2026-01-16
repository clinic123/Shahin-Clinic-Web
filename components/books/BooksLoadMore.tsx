"use client";

import { useState } from "react";

import BookCard from "@/components/books/BookCard";
import type { BookRecord } from "@/lib/actions/fetchBooksData";

interface BooksLoadMoreProps {
  initialBooks: BookRecord[];
  pageSize: number;
  totalCount: number;
  search?: string;
  sortBy: "createdAt" | "price";
  sortOrder: "asc" | "desc";
}

export default function BooksLoadMore({
  initialBooks,
  pageSize,
  totalCount,
  search,
  sortBy,
  sortOrder,
}: BooksLoadMoreProps) {
  const [books, setBooks] = useState(initialBooks);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialBooks.length < totalCount);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = (nextPage: number) => {
    const params = new URLSearchParams({
      limit: pageSize.toString(),
      page: nextPage.toString(),
      sortBy,
      sortOrder,
    });
    if (search) {
      params.set("search", search);
    }
    return params.toString();
  };

  const handleLoadMore = async () => {
    if (!hasMore || isLoading) return;
    try {
      setIsLoading(true);
      setError(null);
      const nextPage = page + 1;
      const response = await fetch(`/api/books?${buildQuery(nextPage)}`);
      if (!response.ok) {
        throw new Error("Failed to load more books");
      }
      const data = await response.json();
      const newBooks: BookRecord[] = data.data ?? [];
      const total = data.pagination?.totalCount ?? totalCount;

      setBooks((prev) => {
        const updated = [...prev, ...newBooks];
        setHasMore(updated.length < total);
        return updated;
      });
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
      {error && (
        <p className="mt-4 text-center text-sm text-red-600">{error}</p>
      )}
      {hasMore && (
        <div className="text-center mt-10">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-full border border-primary px-6 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}

