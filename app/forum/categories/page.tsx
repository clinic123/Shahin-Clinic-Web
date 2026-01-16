import { CreateCategoryDialog } from "@/components/forum/CreateCaregory";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import ForumPage from "./ForumPage";

const ForumMain = async () => {
  return (
    <div className="container mx-auto  space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Forum Categories
          </h2>
        </div>
        <div className="inline-flex items-center gap-2">
          <CreateCategoryDialog />
        </div>
      </div>
      <Suspense
        fallback={
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </>
        }
      >
        <ForumPage />
      </Suspense>
    </div>
  );
};

export default ForumMain;
