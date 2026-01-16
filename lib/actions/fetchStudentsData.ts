"use server";

import "server-only";

import getBaseUrl from "@/lib/utils/base-url";

const BASE_URL = getBaseUrl();

export interface FetchStudentsParams {
  limit?: number;
  sort?: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  youtubeUrl?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchStudentsData(
  params: FetchStudentsParams = {}
): Promise<{ success: boolean; students: StudentRecord[] }> {
  const url = new URL("/api/students", BASE_URL);

  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.sort) url.searchParams.set("sort", params.sort);

  const response = await fetch(url.toString(), {
    cache: "force-cache",
    next: {
      tags: ["students"],
      revalidate: 60 * 10,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch students");
  }

  return response.json();
}


