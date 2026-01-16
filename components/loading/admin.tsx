import { Skeleton } from "../ui/skeleton";

export function NavbarSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

export function ContentSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
