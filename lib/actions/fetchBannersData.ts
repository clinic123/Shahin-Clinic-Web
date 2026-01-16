"use server";

import "server-only";

import getBaseUrl from "@/lib/utils/base-url";

const BASE_URL = getBaseUrl();

export interface FetchBannersParams {
  published?: boolean;
}

export interface BannerRecord {
  id: string;
  heading: string[];
  description: string;
  image: string;
  button: string;
  buttonLink?: string | null;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export async function fetchBannersData(
  params: FetchBannersParams = {}
): Promise<BannerRecord[]> {
  const url = new URL("/api/banners", BASE_URL);

  if (params.published !== undefined) {
    url.searchParams.set("published", String(params.published));
  }

  const response = await fetch(url.toString(), {
    cache: "force-cache",
    next: {
      tags: ["banners"],
      revalidate: 60 * 10, // 10 minutes
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch banners");
  }

  return response.json();
}

