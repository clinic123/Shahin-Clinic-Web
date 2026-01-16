import type { Session } from "@/lib/auth";
import { betterFetch } from "@better-fetch/fetch";

export async function getSession() {
  try {
    const { data } = await betterFetch<Session>("/api/auth/get-session", {
      baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "",
    });
    return data;
  } catch (error) {
    console.error("Error fetching session:", error);
    return null;
  }
}

export function getRoleRedirectPath(role?: string): string {
  const rolePathMap: Record<string, string> = {
    admin: "/admin",
    doctor: "/doctor",
    user: "/dashboard",
  };
  return rolePathMap[role || "user"] || "/dashboard";
}

export function hasPermission(
  userRole: string | undefined,
  requiredRole: string | string[]
): boolean {
  if (!userRole) return false;
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
}
