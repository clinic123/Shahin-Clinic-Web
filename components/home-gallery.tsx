import { buttonVariants } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { GalleryFilters } from "./home/GalleryFilters";

interface HomeGalleryProps {
  params: "home" | "gallery";
  search?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

interface GalleryRecord {
  id: string;
  title: string;
  description: string;
  featuredImage: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

interface GalleriesResult {
  galleries: GalleryRecord[];
  totalCount: number;
  totalPages: number;
}

async function getGalleries(
  limit: number,
  sort: string,
  search?: string,
  page: number = 1
): Promise<GalleriesResult> {
  // Validate inputs
  if (limit < 1 || limit > 100) {
    limit = 10; // Default limit
  }
  if (page < 1) {
    page = 1;
  }

  const skip = (page - 1) * limit;

  // Build search filter
  const where: Prisma.GalleryWhereInput = {
    published: true,
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  // Build orderBy clause
  const orderBy = ((): Prisma.GalleryOrderByWithRelationInput => {
    switch (sort) {
      case "oldest":
        return { createdAt: "asc" };
      case "newest":
      default:
        return { createdAt: "desc" };
    }
  })();

  // Use unstable_cache for better cache control with revalidation tags
  const getCachedGalleries = unstable_cache(
    async () => {
      const [galleries, totalCount] = await Promise.all([
        prisma.gallery.findMany({
          where,
          select: {
            id: true,
            title: true,
            description: true,
            featuredImage: true,
            published: true,
            createdAt: true,
            updatedAt: true,
            publishedAt: true,
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.gallery.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        galleries,
        totalCount,
        totalPages,
      };
    },
    [`galleries-${sort}-${limit}-${search || ""}-${page}`],
    {
      tags: ["galleries"],
      revalidate: 60, // Revalidate every 60 seconds to show new galleries
    }
  );

  return getCachedGalleries();
}

const HomeGallery = async ({
  params,
  search,
  sort = "newest",
  page,
  limit,
}: HomeGalleryProps) => {
  const isHome = params === "home";
  const limitNumber = isHome
    ? 4
    : limit
    ? Number.isNaN(Number(limit)) || Number(limit) < 1
      ? 12
      : Math.min(Number(limit), 100)
    : 12;

  // Validate and parse page
  const currentPage = page
    ? Number.isNaN(Number(page)) || Number(page) < 1
      ? 1
      : Number(page)
    : 1;

  // Validate sort parameter
  const validSorts = ["newest", "oldest"];
  const validatedSort = validSorts.includes(sort) ? sort : "newest";

  // Sanitize search input
  const sanitizedSearch = search?.trim() || undefined;

  try {
    const { galleries, totalCount, totalPages } = await getGalleries(
      limitNumber,
      validatedSort,
      sanitizedSearch,
      currentPage
    );

    // Validate galleries data
    const validGalleries = galleries.filter((gallery) => {
      return (
        gallery &&
        gallery.id &&
        gallery.title &&
        gallery.featuredImage &&
        gallery.published === true
      );
    });

    if (isHome) {
      if (!validGalleries.length) {
        return (
          <section className="py-16 text-center text-gray-500">
            No galleries available.
          </section>
        );
      }

      return (
        <section className="py-16 container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-5 text-black text-3xl md:text-4xl uppercase font-bold">
              <h1>Our Gallery</h1>
              <div className="w-24 h-0.5 bg-primary justify-center mx-auto mt-3" />
            </div>
            <p className="text-gray-600 text-center mb-10 text-sm lg:text-base">
              Shaheen&apos;s Clinic was established in 2016 by Dr. Shaheen
              Mahmud as a dedicated home for Classical Homeopathy, offering
              time-tested healing methods for those seeking natural care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {validGalleries.slice(0, 4).map((gallery) => (
              <div
                key={gallery.id}
                className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-w-4 aspect-h-3 bg-gray-200">
                  <Image
                    src={gallery.featuredImage}
                    alt={gallery.title}
                    width={320}
                    height={212}
                    className="w-full h-86 object-cover brightness-75 transition-all duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-opacity-40 flex items-end">
                  <div className="p-3 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-semibold text-lg truncate">
                      {gallery.title}
                    </h3>
                    <p className="text-sm truncate">{gallery.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/gallery" className={buttonVariants()}>
              View All Galleries
            </Link>
          </div>
        </section>
      );
    }

    // Gallery page with filters and pagination
    if (!validGalleries.length) {
      return (
        <section className="py-16 container">
          <div className="mb-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Our Gallery
              </h1>
              <p className="text-gray-600 text-lg">
                Explore our collection of images and moments.
              </p>
            </div>
            <GalleryFilters
              currentSearch={sanitizedSearch || ""}
              currentSort={validatedSort}
              currentLimit={limitNumber}
            />
          </div>
          <div className="text-center text-gray-500 mt-8">
            {sanitizedSearch
              ? `No galleries found matching "${sanitizedSearch}".`
              : "No galleries available at the moment."}
          </div>
        </section>
      );
    }

    return (
      <section className="py-16 container">
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Our Gallery
            </h1>
            <p className="text-gray-600 text-lg">
              Explore our collection of images and moments.
            </p>
          </div>
          <GalleryFilters
            currentSearch={sanitizedSearch || ""}
            currentSort={validatedSort}
            currentLimit={limitNumber}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {validGalleries.map((gallery) => (
            <div
              key={gallery.id}
              className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="aspect-w-4 aspect-h-3 bg-gray-200">
                <Image
                  src={gallery.featuredImage}
                  alt={gallery.title}
                  width={320}
                  height={212}
                  className="w-full h-86 object-cover brightness-75 transition-all duration-300"
                />
              </div>
              <div className="absolute inset-0 bg-opacity-40 flex items-end">
                <div className="p-3 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-semibold text-lg truncate">
                    {gallery.title}
                  </h3>
                  <p className="text-sm truncate">{gallery.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={`/gallery?page=${currentPage - 1}${
                        sanitizedSearch
                          ? `&search=${encodeURIComponent(sanitizedSearch)}`
                          : ""
                      }${
                        validatedSort !== "newest"
                          ? `&sort=${validatedSort}`
                          : ""
                      }${limitNumber !== 12 ? `&limit=${limitNumber}` : ""}`}
                    />
                  </PaginationItem>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href={`/gallery?page=${pageNum}${
                              sanitizedSearch
                                ? `&search=${encodeURIComponent(
                                    sanitizedSearch
                                  )}`
                                : ""
                            }${
                              validatedSort !== "newest"
                                ? `&sort=${validatedSort}`
                                : ""
                            }${
                              limitNumber !== 12 ? `&limit=${limitNumber}` : ""
                            }`}
                            isActive={pageNum === currentPage}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  }
                )}

                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href={`/gallery?page=${currentPage + 1}${
                        sanitizedSearch
                          ? `&search=${encodeURIComponent(sanitizedSearch)}`
                          : ""
                      }${
                        validatedSort !== "newest"
                          ? `&sort=${validatedSort}`
                          : ""
                      }${limitNumber !== 12 ? `&limit=${limitNumber}` : ""}`}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
            <div className="text-center mt-4 text-sm text-gray-600">
              Showing {validGalleries.length} of {totalCount} galleries
            </div>
          </div>
        )}
      </section>
    );
  } catch (error) {
    return (
      <section className="py-16 text-center text-red-600">
        {error instanceof Error
          ? error.message
          : "Failed to load gallery section."}
      </section>
    );
  }
};

export default HomeGallery;
