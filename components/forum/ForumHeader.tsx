"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserDropdown } from "@/components/user-dropdown";
import { MessageSquare, Search, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ForumHeader({ user }: { user?: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sortParam = searchParams.get("sort");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/forum/topics?search=${encodeURIComponent(
        searchQuery
      )}`;
    }
  };

  // Helper: active tab logic
  const isActive = (target: string) => {
    if (target === "/forum") return pathname === "/forum"; // only exact
    return pathname.startsWith(target); // subpaths count too
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Top */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Community Forum
                </h1>
                <p className="text-sm text-gray-600">
                  Get help and share knowledge with other users
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search forum..."
                className="pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <Button asChild>
              <Link href="/forum/topics/new">
                <MessageSquare className="h-4 w-4 mr-2" />
                New Topic
              </Link>
            </Button>
            <UserDropdown user={user} />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex lg:gap-8 gap-4 flex-wrap border-t border-gray-200">
          <NavLink href="/forum" active={isActive("/forum")}>
            Home
          </NavLink>

          <NavLink
            href="/forum/categories"
            active={isActive("/forum/categories")}
          >
            Categories
          </NavLink>

          <NavLink
            href="/forum/topics"
            active={
              pathname.startsWith("/forum/topics") &&
              (!sortParam || sortParam !== "popular")
            }
          >
            All Topics
          </NavLink>

          <NavLink
            href="/forum/topics?sort=popular"
            active={
              pathname.startsWith("/forum/topics") && sortParam === "popular"
            }
          >
            <TrendingUp className="h-4 w-4 inline mr-1" />
            Popular
          </NavLink>
        </div>
      </div>
    </div>
  );
}

// Reusable NavLink component
function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "border-green-600 text-green-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
    >
      {children}
    </Link>
  );
}
