/**
 * Utility functions for handling role-based redirects
 */

export type UserRole = "admin" | "user" | "doctor";

/**
 * Get the default redirect URL based on user role
 */
export function getDefaultRedirectByRole(role: UserRole): string {
  const roleRedirects: Record<UserRole, string> = {
    admin: "/admin",
    doctor: "/doctor",
    user: "/dashboard",
  };

  return roleRedirects[role] || "/dashboard";
}

/**
 * Validate if a redirect URL is safe (prevents open redirect attacks)
 */
export function isValidRedirectUrl(url: string | null): boolean {
  if (!url) return false;

  // Only allow relative URLs starting with /
  if (!url.startsWith("/")) return false;

  // Prevent redirects to external sites
  if (url.includes("://")) return false;

  // List of allowed redirect paths
  const allowedPaths = [
    "/dashboard",
    "/cart",
    "/products",
    "/profile",
    "/settings",
    "/admin",
    "/doctor",
    "/orders",
    "/checkout",
  ];

  // Check if the URL starts with any allowed path
  return allowedPaths.some((path) => url.startsWith(path));
}

/**
 * Get the final redirect URL with fallback to role-based default
 */
export function getFinalRedirectUrl(
  redirectParam: string | null,
  userRole: UserRole
): string {
  // If redirect param is provided and valid, use it
  if (isValidRedirectUrl(redirectParam)) {
    return redirectParam as any;
  }

  // Otherwise, use role-based default
  return getDefaultRedirectByRole(userRole);
}
