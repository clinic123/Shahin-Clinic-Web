"use server";

import "server-only";

import getBaseUrl from "@/lib/utils/base-url";

const BASE_URL = getBaseUrl();

export interface FetchGalleriesParams {
  search?: string;
  sort?: string;
  limit?: number;
  page?: number;
}

export interface GalleryRecord {
  id: string;
  title: string;
  description: string;
  featuredImage: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export async function fetchGalleriesData(
  params: FetchGalleriesParams = {}
): Promise<GalleryRecord[]> {
  const url = new URL("/api/galleries", BASE_URL);

  if (params.search) url.searchParams.set("search", params.search);
  if (params.sort) url.searchParams.set("sort", params.sort);
  if (params.limit) url.searchParams.set("limit", params.limit.toString());
  if (params.page) url.searchParams.set("page", params.page.toString());

  const response = await fetch(url.toString(), {
    cache: "force-cache",
    next: {
      tags: ["galleries"],
      revalidate: 60 * 10,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch galleries");
  }

  return response.json();
}

