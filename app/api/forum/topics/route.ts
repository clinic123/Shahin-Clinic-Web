import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "latest";
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");

    const orderBy = (): Prisma.ForumTopicOrderByWithRelationInput => {
      switch (sort) {
        case "popular":
          return { views: "desc" };
        case "votes":
          return { upvotes: "desc" };
        case "oldest":
          return { createdAt: "asc" };
        case "latest":
        default:
          return { lastActivityAt: "desc" };
      }
    };

    const where: Prisma.ForumTopicWhereInput = {
      ...(category && {
        category: { slug: category },
      }),
      ...(search && {
        OR: [{ title: { contains: search, mode: "insensitive" } }],
      }),
    };

    const skip = page && limit ? (parseInt(page) - 1) * parseInt(limit) : 0;
    const take = limit ? parseInt(limit) : 20;

    const [topics, total] = await Promise.all([
      prisma.forumTopic.findMany({
        where,
        include: {
          author: { select: { name: true, image: true, role: true } },
          category: true,
          _count: { select: { posts: true, followers: true } },
          votes: {
            where: { type: "UPVOTE" },
            select: { id: true },
          },
        },
        orderBy: [{ isPinned: "desc" }, { isFeatured: "desc" }, orderBy()],
        skip,
        take,
      }),
      prisma.forumTopic.count({ where }),
    ]);

    return NextResponse.json({
      topics,
      pagination: {
        total,
        page: page ? parseInt(page) : 1,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch forum topics", error: error.message },
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

    const { title, content, categoryId } = await request.json();

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: "Title, content, and category are required" },
        { status: 400 }
      );
    }

    const slug = title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

    const topic = await prisma.forumTopic.create({
      data: {
        title,
        slug,
        content,
        categoryId,
        authorId: session.user.id,
      },
      include: {
        author: { select: { name: true, image: true, role: true } },
        category: true,
        _count: { select: { posts: true } },
      },
    });

    return NextResponse.json(topic);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error creating topic" },
      { status: 500 }
    );
  }
}
