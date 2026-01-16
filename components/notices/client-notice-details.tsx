"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotice } from "@/hooks/useNotices";
import { format, isAfter } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Info,
  Megaphone,
  Pin,
  Share2,
  User,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ClientNoticeDetailsProps {
  noticeId: string;
}

export function ClientNoticeDetails({ noticeId }: ClientNoticeDetailsProps) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useNotice(noticeId);

  const notice = data?.notice;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "important":
        return <AlertCircle className="h-5 w-5" />;
      case "update":
        return <Info className="h-5 w-5" />;
      case "maintenance":
        return <Wrench className="h-5 w-5" />;
      default:
        return <Megaphone className="h-5 w-5" />;
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

  const isNoticeExpired = () => {
    if (!notice?.expiresAt) return false;
    return isAfter(new Date(), new Date(notice.expiresAt));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: notice?.title,
          text: notice?.summary,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled the share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You might want to show a toast here
      alert("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notices
          </Button>

          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="pt-4">
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError || !notice) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push("/notices")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notices
          </Button>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message ||
                "Notice not found or you don't have permission to view it."}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/notices")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to All Notices
        </Button>

        {/* Notice Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {notice.title}
                  </h1>
                  {notice.isPinned && (
                    <Pin className="h-5 w-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                  )}
                </div>

                {/* Meta information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>By {notice.author.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Published {format(new Date(notice.createdAt), "PPP")}
                    </span>
                  </div>
                  {notice.expiresAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        Expires {format(new Date(notice.expiresAt), "PPP")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Category badge */}
                <Badge
                  variant="secondary"
                  className={`flex items-center gap-1 w-fit ${getCategoryColor(
                    notice.category
                  )}`}
                >
                  {getCategoryIcon(notice.category)}
                  {notice.category.charAt(0).toUpperCase() +
                    notice.category.slice(1)}
                </Badge>
              </div>

              {/* Share button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex-shrink-0"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Summary */}
            {notice.summary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium">{notice.summary}</p>
              </div>
            )}

            {/* Expired notice warning */}
            {isNoticeExpired() && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This notice has expired and is no longer current.
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>

          <CardContent>
            {/* Notice content */}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-gray-500">
                <div>
                  {notice.publishedAt && (
                    <p>
                      Published at:{" "}
                      {format(new Date(notice.publishedAt), "PPP")}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push("/notices")}
                >
                  View All Notices
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
