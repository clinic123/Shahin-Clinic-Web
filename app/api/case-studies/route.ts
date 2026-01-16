import { Prisma } from "@/prisma/generated/prisma/client";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "newest";
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");
    const published = searchParams.get("published");

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
    const where: Prisma.CaseStudyWhereInput = {
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
      // Published filter (if provided)
      ...(published !== null && {
        published: published === "true",
      }),
    };

    const caseStudies = await prisma.caseStudy.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,

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
      take: limit ? Number(limit) : undefined,
    });

    return NextResponse.json(caseStudies);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch case studies", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      title,
      content,
      excerpt,
      published,
      tagNames,
      shortDescription,
      featuredImage,
      featuredImageAlt,
      patientName,
      patientAge,
      condition,
      treatmentDuration,
      outcome,
    } = await request.json();

    // Validate required fields
    if (!title || !content || !featuredImage) {
      return NextResponse.json(
        { error: "Title, content, and featured image are required" },
        { status: 400 }
      );
    }

    // Convert HTML string to JSON object for Prisma
    const slug =
      title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    // Create case study data
    const caseStudyData: any = {
      title,
      content,
      slug,
      excerpt: excerpt || `Excerpt for ${title}`,
      published: published || false,
      publishedAt: published ? new Date() : null,
      authorId: session.user.id,
      shortDescription,
      featuredImage,
      featuredImageAlt,
      patientName,
      patientAge,
      condition,
      treatmentDuration,
      outcome,
    };

    const caseStudy = await prisma.caseStudy.create({
      data: caseStudyData,
      include: {
        author: { select: { name: true } },
      },
    });

    revalidateTag("case-studies");
    revalidatePath("/success");
    revalidatePath("/admin/case-studies");
    revalidatePath("/");
    return NextResponse.json(caseStudy);
  } catch (error: any) {
    console.error("Detailed error creating case study:", error);
    return NextResponse.json(
      {
        error: "Failed to create case study",
        message: error.message,
        details: error,
      },
      { status: 500 }
    );
  }
}

