"use server";

import "server-only";

import getBaseUrl from "@/lib/utils/base-url";

const BASE_URL = getBaseUrl();

export interface FetchBooksParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "price";
  sortOrder?: "asc" | "desc";
}

export interface BookRecord {
  id: string;
  title: string;
  author: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  rokomariLinkForDirectBuy?: string | null;
  amazonLink?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BooksResponse {
  success: boolean;
  data: BookRecord[];
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function fetchBooksData(
  params: FetchBooksParams = {}
): Promise<BooksResponse> {
  const url = new URL("/api/books", BASE_URL);

  if (params.search) url.searchParams.set("search", params.search);
  if (params.page) url.searchParams.set("page", params.page.toString());
  if (params.limit) url.searchParams.set("limit", params.limit.toString());
  if (params.sortBy) url.searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) url.searchParams.set("sortOrder", params.sortOrder);

  const response = await fetch(url.toString(), {
    cache: "force-cache",
    next: {
      tags: ["books"],
      revalidate: 60 * 60, // 60 minutes
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch books");
  }

  return response.json();
}

export async function fetchBookById(bookId: string): Promise<BookRecord> {
  const url = new URL(`/api/books/${bookId}`, BASE_URL);

  const response = await fetch(url.toString(), {
    cache: "force-cache",
    next: {
      tags: [`book-${bookId}`, "books"],
      revalidate: 60 * 30,
    },
  });

  if (response.status === 404) {
    throw new Error("NOT_FOUND");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch book");
  }

  const data = (await response.json()) as {
    success: boolean;
    data: BookRecord;
  };
  return data.data;
}
