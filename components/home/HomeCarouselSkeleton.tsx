import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HeroCarouselSkeleton() {
  return (
    <div className="w-full relative">
      <div className="relative">
        {/* Carousel Content Skeleton */}
        <div className="relative">
          <div className="relative h-[440px] overflow-hidden lg:h-[680px] flex items-center gap-16 bg-muted bg-cover bg-no-repeat bg-center mx-auto lg:px-4 py-16">
            {/* Background Skeleton */}
            <div className="absolute z-0 inset-0 bg-muted" />

            {/* Content Skeleton */}
            <div className="relative container mx-auto text-left z-20 w-full gap-4">
              <div className="flex flex-1 w-full flex-col justify-center space-y-4">
                {/* Heading Skeletons */}
                <div className="space-y-3">
                  <Skeleton className="h-12 w-3/4 bg-muted-foreground/20" />
                  <Skeleton className="h-12 w-1/2 bg-muted-foreground/20" />
                </div>

                {/* Description Skeleton */}
                <div className="space-y-2 pt-4 max-w-xl">
                  <Skeleton className="h-4 w-full bg-muted-foreground/20" />
                  <Skeleton className="h-4 w-5/6 bg-muted-foreground/20" />
                  <Skeleton className="h-4 w-4/6 bg-muted-foreground/20" />
                </div>

                {/* Button Skeleton */}
                <Skeleton className="h-12 w-40 mt-6 bg-muted-foreground/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows Skeleton */}
        <Skeleton className="absolute w-[50px] h-[100px] left-0 top-1/2 -translate-y-1/2 bg-muted-foreground/20 border-none rounded-none" />
        <Skeleton className="absolute w-[50px] h-[100px] right-0 top-1/2 -translate-y-1/2 bg-muted-foreground/20 border-none rounded-none" />
      </div>

      {/* Indicators/Dots Skeleton */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
        {[1, 2, 3].map((item) => (
          <Skeleton
            key={item}
            className="h-3 w-3 rounded-full bg-muted-foreground/20"
          />
        ))}
      </div>
    </div>
  );
}

// Alternative: Multiple Slide Skeletons (if you want to show multiple loading items)
export function CarouselSkeletonMultiple({ count = 3 }: { count?: number }) {
  return (
    <div className="w-full relative">
      <div className="relative">
        <div className="flex space-x-4 overflow-hidden">
          {Array.from({ length: count }).map((_, index) => (
            <Card key={index} className="min-w-full flex-shrink-0">
              <CardContent className="p-0">
                <div className="relative h-[440px] lg:h-[680px] bg-muted">
                  <div className="absolute inset-0 bg-muted" />

                  {/* Content */}
                  <div className="relative container mx-auto h-full flex items-center">
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-64 bg-muted-foreground/20" />
                      <Skeleton className="h-6 w-48 bg-muted-foreground/20" />
                      <div className="space-y-2 pt-2">
                        <Skeleton className="h-4 w-96 bg-muted-foreground/20" />
                        <Skeleton className="h-4 w-80 bg-muted-foreground/20" />
                      </div>
                      <Skeleton className="h-10 w-32 mt-4 bg-muted-foreground/20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <Skeleton className="absolute w-[50px] h-[100px] left-0 top-1/2 -translate-y-1/2 bg-muted-foreground/20" />
        <Skeleton className="absolute w-[50px] h-[100px] right-0 top-1/2 -translate-y-1/2 bg-muted-foreground/20" />
      </div>
    </div>
  );
}
