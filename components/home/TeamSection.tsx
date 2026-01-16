import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import DoctorCard from "../DoctorCard";
import { Button } from "../ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { TeamFilters } from "./TeamFilters";

interface TeamProps {
  sort?: string;
  search?: string;
  limit?: string;
  page?: string;
  params: "homepage" | "doctors";
}

interface DoctorRecord {
  id: string;
  name: string;
  specialization: string;
  department: string;
  email: string;
  phone: string;
  bio?: string | null;
  experience: number;
  education: string;
  consultationFee: number;
  availableDays: string[];
  status: "ACTIVE" | "INACTIVE";
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  profileImage?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  youtubeUrl?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
}

interface DoctorsResult {
  doctors: DoctorRecord[];
  totalCount: number;
  totalPages: number;
}

async function getDoctors(
  limit: number,
  status: "ACTIVE" | "INACTIVE",
  sort: string,
  search?: string,
  page: number = 1
): Promise<DoctorsResult> {
  // Validate inputs
  if (limit < 1 || limit > 100) {
    limit = 8; // Default limit
  }
  if (page < 1) {
    page = 1;
  }

  const skip = (page - 1) * limit;

  // Build search filter
  const where: Prisma.DoctorWhereInput = {
    status: status,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { specialization: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  // Build orderBy clause
  const orderBy = ((): Prisma.DoctorOrderByWithRelationInput => {
    switch (sort) {
      case "name_asc":
        return { name: "asc" };
      case "name_desc":
        return { name: "desc" };
      case "experience_asc":
        return { experience: "asc" };
      case "experience_desc":
        return { experience: "desc" };
      case "fee_asc":
        return { consultationFee: "asc" };
      case "fee_desc":
        return { consultationFee: "desc" };
      case "oldest":
        return { createdAt: "asc" };
      case "newest":
      default:
        return { createdAt: "desc" };
    }
  })();

  // Use unstable_cache for better cache control with revalidation tags
  const getCachedDoctors = unstable_cache(
    async () => {
      const [doctors, totalCount] = await Promise.all([
        prisma.doctor.findMany({
          where,
          select: {
            id: true,
            name: true,
            specialization: true,
            department: true,
            email: true,
            phone: true,
            bio: true,
            experience: true,
            education: true,
            consultationFee: true,
            availableDays: true,
            status: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
            profileImage: true,
            facebookUrl: true,
            twitterUrl: true,
            youtubeUrl: true,
            linkedinUrl: true,
            instagramUrl: true,
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.doctor.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        doctors,
        totalCount,
        totalPages,
      };
    },
    [`doctors-${status}-${sort}-${limit}-${search || ""}-${page}`],
    {
      tags: ["doctors"],
      revalidate: 60, // Revalidate every 60 seconds to show new doctors
    }
  );

  return getCachedDoctors();
}

export default async function Team({
  params,
  limit,
  sort = "newest",
  search,
  page,
}: TeamProps) {
  // Validate and parse limit
  const limitNumber =
    params === "homepage"
      ? 4
      : limit
      ? Number.isNaN(Number(limit)) || Number(limit) < 1
        ? 12
        : Math.min(Number(limit), 100) // Cap at 100
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
    "name_asc",
    "name_desc",
    "experience_asc",
    "experience_desc",
    "fee_asc",
    "fee_desc",
  ];
  const validatedSort = validSorts.includes(sort) ? sort : "newest";

  // Sanitize search input
  const sanitizedSearch = search?.trim() || undefined;

  try {
    const { doctors, totalCount, totalPages } = await getDoctors(
      limitNumber,
      "ACTIVE",
      validatedSort,
      sanitizedSearch,
      currentPage
    );

    // Validate doctors data
    const validDoctors = doctors.filter((doctor) => {
      return (
        doctor &&
        doctor.id &&
        doctor.name &&
        doctor.specialization &&
        doctor.department &&
        doctor.status === "ACTIVE"
      );
    });

    if (!validDoctors.length) {
      return (
        <section className="py-20 bg-linear-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-6">
            {params === "doctors" && (
              <TeamFilters
                currentSearch={sanitizedSearch || ""}
                currentSort={validatedSort}
                currentLimit={limitNumber}
              />
            )}
            <div className="text-center text-gray-500 mt-8">
              {sanitizedSearch
                ? `No doctors found matching "${sanitizedSearch}".`
                : "No active doctors available at the moment."}
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="py-20 bg-linear-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          {params === "homepage" && (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-5 text-black text-3xl md:text-4xl uppercase font-bold">
                <h1>Meet Our Doctors</h1>
                <div className="w-24 h-0.5 bg-primary justify-center mx-auto mt-3" />
              </div>
              <p className="text-gray-600 text-center mb-10 text-sm lg:text-base">
                Shaheen&apos;s Clinic was established in 2016 by Dr. Shaheen
                Mahmud as a dedicated home for Classical Homeopathy, offering
                time-tested healing methods for those seeking natural care.
              </p>
            </div>
          )}

          {params === "doctors" && (
            <div className="mb-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Our Medical Team
                </h1>
                <p className="text-gray-600 text-lg">
                  Meet our experienced healthcare professionals dedicated to
                  your well-being.
                </p>
              </div>
              <TeamFilters
                currentSearch={sanitizedSearch || ""}
                currentSort={validatedSort}
                currentLimit={limitNumber}
              />
            </div>
          )}

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {validDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={{
                  ...doctor,
                  createdAt:
                    typeof doctor.createdAt === "string"
                      ? doctor.createdAt
                      : doctor.createdAt.toISOString(),
                  updatedAt:
                    typeof doctor.updatedAt === "string"
                      ? doctor.updatedAt
                      : doctor.updatedAt.toISOString(),
                }}
              />
            ))}
          </div>

          {params === "doctors" && totalPages > 1 && (
            <div className="mt-12">
              <Pagination>
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href={`/teams?page=${currentPage - 1}${
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
                        (pageNum >= currentPage - 1 &&
                          pageNum <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href={`/teams?page=${pageNum}${
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
                        href={`/teams?page=${currentPage + 1}${
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
                Showing {validDoctors.length} of {totalCount} doctors
              </div>
            </div>
          )}

          {params === "homepage" && (
            <div className="text-center mt-16 cursor-pointer">
              <Link href="/teams">
                <Button>View All Doctors</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  } catch (error) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-6 text-center text-red-600">
          {error instanceof Error
            ? error.message
            : "Failed to load doctors section."}
        </div>
      </section>
    );
  }
}
