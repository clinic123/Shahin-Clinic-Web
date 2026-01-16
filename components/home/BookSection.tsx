import BookCard from "@/components/books/BookCard";
import BookFilters from "@/components/books/BookFilters";
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
import Link from "next/link";

interface BookSectionProps {
  params?: "home" | "book";
  searchParams?: {
    search?: string;
    sort?: string;
    page?: string;
    limit?: string;
  };
}

interface BookRecord {
  id: string;
  title: string;
  author: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  rokomariLinkForDirectBuy?: string | null;
  amazonLink?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BooksResult {
  books: BookRecord[];
  totalCount: number;
  totalPages: number;
}

const SORT_MAP: Record<
  string,
  { sortBy: "createdAt" | "price"; sortOrder: "asc" | "desc" }
> = {
  newest: { sortBy: "createdAt", sortOrder: "desc" },
  oldest: { sortBy: "createdAt", sortOrder: "asc" },
  price_low: { sortBy: "price", sortOrder: "asc" },
  price_high: { sortBy: "price", sortOrder: "desc" },
};

async function getBooks(
  limit: number,
  sortBy: "createdAt" | "price",
  sortOrder: "asc" | "desc",
  search?: string,
  page: number = 1
): Promise<BooksResult> {
  // Validate inputs
  if (limit < 1 || limit > 100) {
    limit = 12; // Default limit
  }
  if (page < 1) {
    page = 1;
  }

  const skip = (page - 1) * limit;

  // Build search filter
  const where: Prisma.BookWhereInput = {
    isActive: true,
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  // Build orderBy
  const orderBy: Prisma.BookOrderByWithRelationInput = {
    [sortBy]: sortOrder,
  };

  // Use unstable_cache for better cache control with revalidation tags
  const getCachedBooks = unstable_cache(
    async () => {
      const [books, totalCount] = await Promise.all([
        prisma.book.findMany({
          where,
          select: {
            id: true,
            title: true,
            author: true,
            description: true,
            image: true,
            price: true,
            stock: true,
            rokomariLinkForDirectBuy: true,
            amazonLink: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.book.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        books,
        totalCount,
        totalPages,
      };
    },
    [`books-${sortBy}-${sortOrder}-${limit}-${search || ""}-${page}`],
    {
      tags: ["books"],
      revalidate: 60, // Revalidate every 60 seconds to show new books
    }
  );

  return getCachedBooks();
}

export default async function BookSection({
  params = "home",
  searchParams,
}: BookSectionProps) {
  try {
    const isHome = params === "home";
    const limitNumber = isHome
      ? 4
      : searchParams?.limit
      ? Number.isNaN(Number(searchParams.limit)) ||
        Number(searchParams.limit) < 1
        ? 12
        : Math.min(Number(searchParams.limit), 100)
      : 12;

    // Validate and parse page
    const currentPage = searchParams?.page
      ? Number.isNaN(Number(searchParams.page)) || Number(searchParams.page) < 1
        ? 1
        : Number(searchParams.page)
      : 1;

    const searchQuery = searchParams?.search?.trim() || undefined;
    const sortValue = searchParams?.sort || "newest";
    const sortConfig = SORT_MAP[sortValue] ?? SORT_MAP.newest;

    const { books, totalCount, totalPages } = await getBooks(
      limitNumber,
      sortConfig.sortBy,
      sortConfig.sortOrder,
      searchQuery,
      currentPage
    );

    // Validate books data
    const validBooks = books.filter((book) => {
      return book && book.id && book.title && book.isActive === true;
    });

    return (
      <section className="my-20">
        <div className="max-w-3xl mx-auto text-center mb-16 px-4">
          <h2 className="text-3xl md:text-4xl font-bold uppercase text-black">
            {isHome ? "Featured Books" : "Our Books"}
          </h2>
          <div className="w-24 h-0.5 bg-primary mx-auto mt-3" />
          <p className="text-gray-600 mt-6 text-sm md:text-base">
            Explore a curated selection of insightful books that inspire
            learning, reflection, and growth.
          </p>
        </div>

        {isHome ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto px-4">
              {validBooks.slice(0, 4).map((book) => (
                <BookCard
                  key={book.id}
                  book={{
                    ...book,
                    createdAt:
                      typeof book.createdAt === "string"
                        ? book.createdAt
                        : book.createdAt.toISOString(),
                    updatedAt:
                      typeof book.updatedAt === "string"
                        ? book.updatedAt
                        : book.updatedAt.toISOString(),
                  }}
                />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/books"
                className="inline-flex items-center justify-center rounded-full border border-primary px-6 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                View more books
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="container mx-auto mb-10 px-4">
              <BookFilters
                initialSearch={searchQuery || ""}
                initialSort={sortValue}
              />
            </div>
            <div className="max-w-7xl mx-auto px-4">
              {validBooks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {searchQuery
                      ? `No books found matching "${searchQuery}".`
                      : "No books available at the moment."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {validBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={{
                          ...book,
                          createdAt:
                            typeof book.createdAt === "string"
                              ? book.createdAt
                              : book.createdAt.toISOString(),
                          updatedAt:
                            typeof book.updatedAt === "string"
                              ? book.updatedAt
                              : book.updatedAt.toISOString(),
                        }}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-12">
                      <Pagination>
                        <PaginationContent>
                          {currentPage > 1 && (
                            <PaginationItem>
                              <PaginationPrevious
                                href={`/books?page=${currentPage - 1}${
                                  searchQuery
                                    ? `&search=${encodeURIComponent(
                                        searchQuery
                                      )}`
                                    : ""
                                }${
                                  sortValue !== "newest"
                                    ? `&sort=${sortValue}`
                                    : ""
                                }${
                                  limitNumber !== 12
                                    ? `&limit=${limitNumber}`
                                    : ""
                                }`}
                              />
                            </PaginationItem>
                          )}

                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((pageNum) => {
                            // Show first page, last page, current page, and pages around current
                            if (
                              pageNum === 1 ||
                              pageNum === totalPages ||
                              (pageNum >= currentPage - 1 &&
                                pageNum <= currentPage + 1)
                            ) {
                              return (
                                <PaginationItem key={pageNum}>
                                  <PaginationLink
                                    href={`/books?page=${pageNum}${
                                      searchQuery
                                        ? `&search=${encodeURIComponent(
                                            searchQuery
                                          )}`
                                        : ""
                                    }${
                                      sortValue !== "newest"
                                        ? `&sort=${sortValue}`
                                        : ""
                                    }${
                                      limitNumber !== 12
                                        ? `&limit=${limitNumber}`
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
                                <PaginationItem key={pageNum}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }
                            return null;
                          })}

                          {currentPage < totalPages && (
                            <PaginationItem>
                              <PaginationNext
                                href={`/books?page=${currentPage + 1}${
                                  searchQuery
                                    ? `&search=${encodeURIComponent(
                                        searchQuery
                                      )}`
                                    : ""
                                }${
                                  sortValue !== "newest"
                                    ? `&sort=${sortValue}`
                                    : ""
                                }${
                                  limitNumber !== 12
                                    ? `&limit=${limitNumber}`
                                    : ""
                                }`}
                              />
                            </PaginationItem>
                          )}
                        </PaginationContent>
                      </Pagination>
                      <div className="text-center mt-4 text-sm text-gray-600">
                        Showing {validBooks.length} of {totalCount} books
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </section>
    );
  } catch (error) {
    return (
      <section className="px-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <div className="text-red-600 bg-red-50 p-4 rounded-lg max-w-md mx-auto">
            <p className="font-semibold">Unable to load books</p>
            <p className="text-sm mt-1">
              {error instanceof Error
                ? error.message
                : "Please try again later"}
            </p>
          </div>
        </div>
      </section>
    );
  }
}
