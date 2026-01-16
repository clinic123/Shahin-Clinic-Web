import Categories from "@/components/blog/Categories";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import SortFilter from "@/components/ui/filter";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Search from "@/components/ui/search";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Prisma } from "@/prisma/generated/prisma/client";
import { PostTypeWithRelations } from "@/types/post";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { FaCloud } from "react-icons/fa6";
import BlogCard from "./BlogCard";

interface BlogsListProps {
  category?: string;
  sort?: string;
  search?: string;
  page?: string;
  limit?: string;
  params: "homepage" | "blogs";
}

interface BlogsResult {
  posts: PostTypeWithRelations[];
  totalCount: number;
  totalPages: number;
}

async function getBlogs(
  limit: number,
  sort: string,
  category?: string,
  search?: string,
  page: number = 1
): Promise<BlogsResult> {
  // Validate inputs
  if (limit < 1 || limit > 100) {
    limit = 12; // Default limit
  }
  if (page < 1) {
    page = 1;
  }

  const skip = (page - 1) * limit;

  // Build orderBy clause
  const orderBy = ((): Prisma.PostOrderByWithRelationInput => {
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
  const where: Prisma.PostWhereInput = {
    published: true,
    // Category filter
    ...(category && {
      category: {
        slug: category,
      },
    }),
    // Search filter
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  // Use unstable_cache for better cache control with revalidation tags
  const getCachedBlogs = unstable_cache(
    async () => {
      const [posts, totalCount] = await Promise.all([
        prisma.post.findMany({
          where,
          include: {
            author: true,
            category: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.post.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        posts,
        totalCount,
        totalPages,
      };
    },
    [`blogs-${category || "all"}-${sort}-${limit}-${search || ""}-${page}`],
    {
      tags: ["blogs"],
      revalidate: 60, // Revalidate every 60 seconds to show new blogs
    }
  );

  return getCachedBlogs();
}

const BlogsList = async ({
  category,
  sort = "newest",
  search,
  page,
  limit,
  params,
}: BlogsListProps) => {
  const isHome = params === "homepage";
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
  const sanitizedCategory = category?.trim() || undefined;

  try {
    const { posts, totalCount, totalPages } = await getBlogs(
      limitNumber,
      validatedSort,
      sanitizedCategory,
      sanitizedSearch,
      currentPage
    );

    // Validate posts data
    const validPosts = posts.filter((post) => {
      return post && post.id && post.title && post.published === true;
    });

    return (
      <div className="container py-8">
        {params === "blogs" && <Categories />}
        <div className="flex flex-wrap justify-between gap-5">
          {params === "blogs" && <Search />}
          {params === "blogs" && <SortFilter />}
        </div>
        {params === "homepage" && (
          <div className="text-center pb-10 mx-auto max-w-2xl flex flex-col items-center justify-center gap-3">
            <h2 className="text-4xl xl:text-5xl font-semibold ">Blogs</h2>
            <p>
              At Shaheen's Clinic, we believe in the power of shared knowledge
              and experience. Our blog is designed to inspire, educate, and
              connect — whether you're a patient exploring holistic healing, a
              practitioner expanding your expertise, or a student eager to
              learn.
            </p>
          </div>
        )}
        {validPosts.length <= 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FaCloud />
              </EmptyMedia>
              <EmptyTitle>Blog Data Empty</EmptyTitle>
              <EmptyDescription>
                {sanitizedSearch
                  ? `No blogs found matching "${sanitizedSearch}".`
                  : "Create new blog to your database to access them anywhere."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link href={"/blogs/create"} className={buttonVariants()}>
                Create Blog
              </Link>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <div
              className={cn(
                "mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-x-6 gap-y-6 pb-8",
                params === "blogs" &&
                  "border-t border-gray-200  mt-10  pt-10 sm:mt-16 sm:pt-16 lg:grid-cols-3 pb-8"
              )}
            >
              {validPosts?.map((item) => (
                <BlogCard key={item.id} post={item} />
              ))}
            </div>

            {params === "blogs" && totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious
                          href={`/blogs?page=${currentPage - 1}${
                            sanitizedCategory
                              ? `&category=${encodeURIComponent(
                                  sanitizedCategory
                                )}`
                              : ""
                          }${
                            sanitizedSearch
                              ? `&search=${encodeURIComponent(sanitizedSearch)}`
                              : ""
                          }${
                            validatedSort !== "newest"
                              ? `&sort=${validatedSort}`
                              : ""
                          }${
                            limitNumber !== 12 ? `&limit=${limitNumber}` : ""
                          }`}
                        />
                      </PaginationItem>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => {
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
                                href={`/blogs?page=${pageNum}${
                                  sanitizedCategory
                                    ? `&category=${encodeURIComponent(
                                        sanitizedCategory
                                      )}`
                                    : ""
                                }${
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
                      }
                    )}

                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext
                          href={`/blogs?page=${currentPage + 1}${
                            sanitizedCategory
                              ? `&category=${encodeURIComponent(
                                  sanitizedCategory
                                )}`
                              : ""
                          }${
                            sanitizedSearch
                              ? `&search=${encodeURIComponent(sanitizedSearch)}`
                              : ""
                          }${
                            validatedSort !== "newest"
                              ? `&sort=${validatedSort}`
                              : ""
                          }${
                            limitNumber !== 12 ? `&limit=${limitNumber}` : ""
                          }`}
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
                <div className="text-center mt-4 text-sm text-gray-600">
                  Showing {validPosts.length} of {totalCount} blogs
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="container py-8">
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FaCloud />
            </EmptyMedia>
            <EmptyTitle>Error Loading Blogs</EmptyTitle>
            <EmptyDescription>
              {error instanceof Error
                ? error.message
                : "Failed to load blogs section."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }
};

export default BlogsList;
