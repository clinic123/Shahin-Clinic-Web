import { Prisma } from "@/prisma/generated/prisma/client";
import { getServerSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "newest";
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");
    const published = searchParams.get("published");

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
    const where: Prisma.PostWhereInput = {
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
      authorId: session.user.id,
      // Published filter (if provided)
      published: true,
    };

    const posts = await prisma.post.findMany({
      where: where,

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
      take: limit ? Number(limit) : undefined,
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch posts", error: error.message },
      { status: 500 }
    );
  }
}
