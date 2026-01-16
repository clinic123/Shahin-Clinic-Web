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
import CaseStudyCard from "./CaseStudyCard";

interface CaseStudiesResult {
  caseStudies: any[];
  totalCount: number;
  totalPages: number;
}

async function getCaseStudies(
  limit: number,
  sort: string,
  search?: string,
  page: number = 1
): Promise<CaseStudiesResult> {
  // Validate inputs
  if (limit < 1 || limit > 100) {
    limit = 4; // Default limit
  }
  if (page < 1) {
    page = 1;
  }

  const skip = (page - 1) * limit;

  // Build orderBy clause
  const orderBy = ((): Prisma.CaseStudyOrderByWithRelationInput => {
    switch (sort) {
      case "title_asc":
        return { title: "asc" };
      case "title_desc":
        return { title: "desc" };
      case "published_at_asc":
        return { publishedAt: "asc" };
      case "published_at_desc":
        return { publishedAt: "desc" };
      case "oldest":
        return { createdAt: "asc" };
      case "newest":
      default:
        return { createdAt: "desc" };
    }
  })();

  // Build where clause
  const where: Prisma.CaseStudyWhereInput = {
    published: true,
    // Search filter
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { condition: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  // Use unstable_cache for better cache control with revalidation tags
  const getCachedCaseStudies = unstable_cache(
    async () => {
      try {
        const [caseStudies, totalCount] = await Promise.all([
          prisma.caseStudy.findMany({
            where,
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
            orderBy,
            skip,
            take: limit,
          }),
          prisma.caseStudy.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return {
          caseStudies: caseStudies || [],
          totalCount: totalCount || 0,
          totalPages: totalPages || 0,
        };
      } catch (error: any) {
        console.error("Error in getCachedCaseStudies:", error);
        // Return empty result instead of throwing
        return {
          caseStudies: [],
          totalCount: 0,
          totalPages: 0,
        };
      }
    },
    [`case-studies-${sort}-${limit}-${search || ""}-${page}`],
    {
      tags: ["case-studies"],
      revalidate: 60, // Revalidate every 60 seconds to show new case studies
    }
  );

  return getCachedCaseStudies();
}

interface CaseStudyListProps {
  sort?: string;
  search?: string;
  page?: string;
  limit?: string;
}

const CaseStudyList = async ({
  sort = "newest",
  search,
  page,
  limit,
}: CaseStudyListProps) => {
  const limitNumber = limit
    ? Number.isNaN(Number(limit)) || Number(limit) < 1
      ? 4
      : Math.min(Number(limit), 100)
    : 4;

  // Validate and parse page
  const currentPage = page
    ? Number.isNaN(Number(page)) || Number(page) < 1
      ? 1
      : Number(page)
    : 1;

  // Validate sort parameter
  const validSorts = [
    "newest",
    "oldest",
    "title_asc",
    "title_desc",
    "published_at_asc",
    "published_at_desc",
  ];
  const validatedSort = validSorts.includes(sort) ? sort : "newest";

  // Sanitize search input
  const sanitizedSearch = search?.trim() || undefined;

  try {
    const { caseStudies, totalCount, totalPages } = await getCaseStudies(
      limitNumber,
      validatedSort,
      sanitizedSearch,
      currentPage
    );

    // Validate case studies data
    const validCaseStudies = caseStudies.filter((caseStudy) => {
      return (
        caseStudy &&
        caseStudy.id &&
        caseStudy.title &&
        caseStudy.published === true
      );
    });

    if (validCaseStudies.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No case studies found.{" "}
            {sanitizedSearch &&
              `Try adjusting your search for "${sanitizedSearch}".`}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl lg:text-4xl mb-2 font-bold  text-center text-gray-900">
            Case Studies
          </h2>
          <p className="text-gray-600 text-center max-w-xl mx-auto">
            Browse our case studies to see how homeopathy has helped patients
            around the world.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {validCaseStudies.map((caseStudy) => (
            <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={`/success?page=${currentPage - 1}${
                        sanitizedSearch
                          ? `&search=${encodeURIComponent(sanitizedSearch)}`
                          : ""
                      }${
                        validatedSort !== "newest"
                          ? `&sort=${validatedSort}`
                          : ""
                      }`}
                    />
                  </PaginationItem>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => {
                    // Show first page, last page, current page, and pages around current
                    const shouldShow =
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 &&
                        pageNum <= currentPage + 1);

                    if (shouldShow) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href={`/success?page=${pageNum}${
                              sanitizedSearch
                                ? `&search=${encodeURIComponent(
                                    sanitizedSearch
                                  )}`
                                : ""
                            }${
                              validatedSort !== "newest"
                                ? `&sort=${validatedSort}`
                                : ""
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
                        <PaginationItem key={`ellipsis-${pageNum}`}>
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
                      href={`/success?page=${currentPage + 1}${
                        sanitizedSearch
                          ? `&search=${encodeURIComponent(sanitizedSearch)}`
                          : ""
                      }${
                        validatedSort !== "newest"
                          ? `&sort=${validatedSort}`
                          : ""
                      }`}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching case studies:", error);
    return (
      <div className="text-center py-12">
        <p className="text-destructive">
          Failed to load case studies. Please try again later.
        </p>
      </div>
    );
  }
};

export default CaseStudyList;
