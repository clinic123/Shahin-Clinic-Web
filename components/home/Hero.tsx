import HeroClient from "@/components/home/HeroClient";
import type { BannerRecord } from "@/lib/actions/fetchBannersData";
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

function ErrorState({ message }: { message: string }) {
  return (
    <div className="w-full relative h-[340px] lg:h-[680px] flex items-center justify-center">
      <div className="text-red-600">{message}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="w-full relative h-[340px] lg:h-[680px] flex items-center justify-center bg-gray-100">
      <div className="text-gray-500">No banners available</div>
    </div>
  );
}

async function getBanners(published: boolean = true): Promise<BannerRecord[]> {
  // Use unstable_cache for better cache control with revalidation tags
  const getCachedBanners = unstable_cache(
    async () => {
      const banners = await prisma.banner.findMany({
        where: {
          published,
        },
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          heading: true,
          description: true,
          image: true,
          button: true,
          buttonLink: true,
          published: true,
          order: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return banners;
    },
    [`banners-${published}`],
    {
      tags: ["banners"],
      revalidate: 60, // Revalidate every 60 seconds to show updated banners
    }
  );

  const banners = await getCachedBanners();

  // Convert Date objects to strings for compatibility
  return banners.map((banner) => ({
    ...banner,
    createdAt:
      typeof banner.createdAt === "string"
        ? banner.createdAt
        : banner.createdAt.toISOString(),
    updatedAt:
      typeof banner.updatedAt === "string"
        ? banner.updatedAt
        : banner.updatedAt.toISOString(),
  }));
}

export default async function Hero() {
  try {
    const banners = await getBanners(true);

    if (!banners?.length) {
      return <EmptyState />;
    }

    return <HeroClient banners={banners} />;
  } catch (error) {
    console.error("Failed to load hero banners:", error);
    return <ErrorState message="Error loading banners" />;
  }
}
