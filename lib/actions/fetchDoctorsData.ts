"use server";

import "server-only";

import getBaseUrl from "@/lib/utils/base-url";

const BASE_URL = getBaseUrl();

export interface FetchDoctorsParams {
  limit?: number;
  status?: "ACTIVE" | "INACTIVE";
  department?: string;
  sort?: string;
}

export interface DoctorRecord {
  id: string;
  name: string;
  specialization: string;
  department: string;
  email: string;
  phone: string;
  bio?: string | null;
  experience: number;
  education: string;
  consultationFee: number;
  availableDays: string[];
  status: "ACTIVE" | "INACTIVE";
  userId: string;
  createdAt: string;
  updatedAt: string;
  profileImage?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  youtubeUrl?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
}

export async function fetchDoctorsData(
  params: FetchDoctorsParams = {}
): Promise<{ success: boolean; doctors: DoctorRecord[] }> {
  const url = new URL("/api/doctors", BASE_URL);

  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.status) url.searchParams.set("status", params.status);
  if (params.department) url.searchParams.set("department", params.department);
  if (params.sort) url.searchParams.set("sort", params.sort);

  const response = await fetch(url.toString(), {
    cache: "force-cache",
    next: {
      tags: ["doctors"],
      revalidate: 60 * 10,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch doctors");
  }

  return response.json();
}

