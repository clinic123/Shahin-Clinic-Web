"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotices } from "@/hooks/useNotices";
import { format, isAfter } from "date-fns";
import {
  AlertCircle,
  Calendar,
  Filter,
  Info,
  Megaphone,
  Pin,
  Search,
  User,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function ClientNoticesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isError, error } = useNotices({
    page: currentPage,
    limit: 10,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    search: searchTerm || undefined,
  });

  const notices = data?.notices || [];
  const pagination = data?.pagination;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "important":
        return <AlertCircle className="h-4 w-4" />;
      case "update":
        return <Info className="h-4 w-4" />;
      case "maintenance":
        return <Wrench className="h-4 w-4" />;
      default:
        return <Megaphone className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "important":
        return "bg-red-100 text-red-800 border-red-200";
      case "update":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "maintenance":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isNoticeExpired = (notice: any) => {
    if (!notice.expiresAt) return false;
    return isAfter(new Date(), new Date(notice.expiresAt));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Failed to Load Notices
            </h2>
            <p className="text-gray-600 mb-4">
              {error?.message ||
                "There was an error loading the notices. Please try again."}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Notices & Announcements
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Stay informed with the latest updates, important announcements, and
          maintenance notices from our organization.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="update">Updates</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" variant="outline">
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notices List */}
      <div className="space-y-6">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : notices.length === 0 ? (
          // Empty state
          <Card>
            <CardContent className="text-center py-12">
              <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Notices Found
              </h3>
              <p className="text-gray-600">
                {searchTerm || categoryFilter !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "There are no notices available at the moment. Please check back later."}
              </p>
            </CardContent>
          </Card>
        ) : (
          // Notices list
          <>
            {notices.map((notice) => (
              <Card
                key={notice.id}
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
              >
                <Link href={`/notices/${notice.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                            {notice.title}
                          </CardTitle>
                          {notice.isPinned && (
                            <Pin className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {notice.author.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(notice.createdAt), "MMM d, yyyy")}
                          </div>
                          <Badge
                            variant="secondary"
                            className={`flex items-center gap-1 ${getCategoryColor(
                              notice.category
                            )}`}
                          >
                            {getCategoryIcon(notice.category)}
                            {notice.category.charAt(0).toUpperCase() +
                              notice.category.slice(1)}
                          </Badge>
                          {isNoticeExpired(notice) && (
                            <Badge variant="outline" className="text-xs">
                              Expired
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {notice.summary && (
                    <CardContent>
                      <p className="text-gray-600 line-clamp-2">
                        {notice.summary}
                      </p>
                      <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
                        Read more →
                      </div>
                    </CardContent>
                  )}
                </Link>
              </Card>
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </Button>

                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
