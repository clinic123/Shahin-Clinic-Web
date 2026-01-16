import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

export const BlogsListSkeleton = ({
  params,
}: {
  params: "homepage" | "blogs";
}) => {
  return (
    <div className="container py-8">
      {params === "blogs" && (
        <div className="flex gap-2 mb-6 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-between gap-5 mb-8">
        {params === "blogs" && (
          <>
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-40" />
          </>
        )}
      </div>

      {params === "homepage" && (
        <div className="text-center pb-10 mx-auto max-w-2xl flex flex-col items-center justify-center gap-3">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-4 w-80" />
        </div>
      )}

      <div
        className={cn(
          "mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 pb-8",
          params === "blogs" &&
            "border-t border-gray-200 mt-10 pt-10 sm:mt-16 sm:pt-16 lg:grid-cols-3 pb-8"
        )}
      >
        {Array.from({ length: params === "homepage" ? 3 : 6 }).map(
          (_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center space-x-2 mt-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
