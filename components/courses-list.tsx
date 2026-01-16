import CoursesListClient from "@/components/CoursesListClient";
import type {
  CourseRecord,
  CoursesResponse,
  FetchCoursesParams,
} from "@/lib/actions/fetchCoursesData";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { unstable_cache } from "next/cache";

interface CourseListProps {
  params?: "home" | "course" | "similar";
  redirectAuth: string;
}

async function getCourses(
  limit: number,
  sort: string,
  category?: string,
  search?: string,
  page: number = 1
): Promise<CoursesResponse> {
  // Validate inputs
  if (limit < 1 || limit > 100) {
    limit = 12; // Default limit
  }
  if (page < 1) {
    page = 1;
  }

  const skip = (page - 1) * limit;

  // Build orderBy clause
  const orderBy = ((): Prisma.CourseOrderByWithRelationInput => {
    switch (sort) {
      case "created_at_asc":
        return { createdAt: "asc" };
      case "price_low":
        return { price: "asc" };
      case "price_high":
        return { price: "desc" };
      case "created_at_desc":
        return { createdAt: "desc" };
      case "oldest":
        return { createdAt: "asc" };
      case "newest":
      default:
        return { createdAt: "desc" };
    }
  })();

  // Build where clause
  const where: Prisma.CourseWhereInput = {
    isActive: true,
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(category &&
      category !== "all" && {
        category,
      }),
  };

  // Use unstable_cache for better cache control with revalidation tags
  const getCachedCourses = unstable_cache(
    async () => {
      const [courses, totalCount] = await Promise.all([
        prisma.course.findMany({
          where,
          select: {
            id: true,
            title: true,
            description: true,
            shortDescription: true,
            image: true,
            price: true,
            videoUrl: true,
            category: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.course.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      // Convert Date objects to strings for compatibility
      const coursesData: CourseRecord[] = courses.map((course) => ({
        ...course,
        createdAt:
          typeof course.createdAt === "string"
            ? course.createdAt
            : course.createdAt.toISOString(),
        updatedAt:
          typeof course.updatedAt === "string"
            ? course.updatedAt
            : course.updatedAt.toISOString(),
      }));

      return {
        courses: coursesData,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    },
    [`courses-${category || "all"}-${sort}-${limit}-${search || ""}-${page}`],
    {
      tags: ["courses"],
      revalidate: 60, // Revalidate every 60 seconds to show new courses
    }
  );

  return getCachedCourses();
}

export default async function CourseList({
  params = "course",
  redirectAuth,
}: CourseListProps) {
  try {
    const limit = params === "home" || params === "similar" ? 4 : 12;
    const initialFilters: FetchCoursesParams = {
      limit,
      page: 1,
      sort: "newest",
    };

    const initialData = await getCourses(
      limit,
      initialFilters.sort || "newest",
      undefined,
      undefined,
      initialFilters.page || 1
    );

    return (
      <CoursesListClient
        params={params}
        redirectAuth={redirectAuth}
        initialData={initialData}
        initialFilters={initialFilters}
      />
    );
  } catch (error) {
    console.error("Error fetching courses:", error);
    // Return empty data structure on error
    const emptyData: CoursesResponse = {
      courses: [],
      pagination: {
        page: 1,
        limit: params === "home" || params === "similar" ? 4 : 12,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };

    return (
      <CoursesListClient
        params={params}
        redirectAuth={redirectAuth}
        initialData={emptyData}
        initialFilters={{
          limit: params === "home" || params === "similar" ? 4 : 12,
          page: 1,
          sort: "newest",
        }}
      />
    );
  }
}
