"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/useCategories";
import {
  Briefcase,
  Footprints,
  Glasses,
  Hand,
  Shirt,
  ShoppingBasket,
  Venus,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const categoryIcons: Record<string, React.ReactNode> = {
  all: <ShoppingBasket className="w-4 h-4" />,
  "t-shirts": <Shirt className="w-4 h-4" />,
  shoes: <Footprints className="w-4 h-4" />,
  accessories: <Glasses className="w-4 h-4" />,
  bags: <Briefcase className="w-4 h-4" />,
  dresses: <Venus className="w-4 h-4" />,
  jackets: <Shirt className="w-4 h-4" />,
  gloves: <Hand className="w-4 h-4" />,
};

const Categories = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { categoriesQuery } = useCategories();
  const selectedCategory = searchParams.get("category") || "all";

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams);

    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }

    // Reset to page 1 when category changes
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Loading state
  if (categoriesQuery.isLoading) {
    return (
      <div className="w-full mb-6">
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (categoriesQuery.isError) {
    return (
      <div className="w-full mb-6 p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
        <p className="text-destructive text-sm text-center">
          Failed to load categories.{" "}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => categoriesQuery.refetch()}
            className="h-auto p-0 ml-1 text-inherit"
          >
            Try again
          </Button>
        </p>
      </div>
    );
  }

  const categories = categoriesQuery.data || [];

  return (
    <div className="w-full mb-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-4 px-1">
          {/* All Categories Button */}
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange("all")}
            className="flex items-center gap-2 shrink-0"
          >
            <ShoppingBasket className="w-4 h-4" />
            <span>All Products</span>
            {selectedCategory === "all" && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                {categories.length}
              </Badge>
            )}
          </Button>

          {/* Category Buttons */}
          {categories.map((category: any) => (
            <Button
              key={category.slug}
              variant={
                selectedCategory === category.slug ? "default" : "outline"
              }
              size="sm"
              onClick={() => handleCategoryChange(category.slug)}
              className="flex items-center gap-2 shrink-0"
            >
              {categoryIcons[category.slug] || <Shirt className="w-4 h-4" />}
              <span className="capitalize">{category.name}</span>
              {selectedCategory === category.slug &&
                category._count?.products && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 p-0 text-xs"
                  >
                    {category._count.products}
                  </Badge>
                )}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default Categories;
