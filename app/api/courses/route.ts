import { auth } from "@/lib/auth";
import { Prisma } from "@/prisma/generated/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

const revalidateCourses = () => {
  revalidateTag("courses");
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/admin/courses");
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "newest";
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

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

    const where: Prisma.CourseWhereInput = {
      isActive: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          // { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(category && {
        category,
        ...(search && {
          OR: [{ title: { contains: search, mode: "insensitive" } }],
        }),
      }),
    };

    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.course.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { title, description, image, price, videoUrl, shortDescription } =
      body;

    if (!title || !description || !image || !price || !shortDescription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        image,
        price: parseFloat(price),
        videoUrl: videoUrl || null,
        shortDescription,
      },
    });

    revalidateCourses();

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
