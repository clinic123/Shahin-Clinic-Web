import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const publishedOnly = searchParams.get("publishedOnly") === "true";

    const skip = (page - 1) * limit;

    let where: any = {};

    if (publishedOnly) {
      where.isPublished = true;
      where.OR = [{ expiresAt: null }, { expiresAt: { gt: new Date() } }];
    }

    if (category && category !== "all") {
      where.category = category;
    }

    const [notices, totalCount] = await Promise.all([
      prisma.notice.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [
          { isPinned: "desc" },
          { publishedAt: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.notice.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      notices,
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
    console.error("Error fetching notices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
    const {
      title,
      content,
      summary,
      category = "general",
      isPublished = false,
      isPinned = false,
      expiresAt,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        summary,
        category,
        isPublished,
        isPinned,
        authorId: session.user.id,
        publishedAt: isPublished ? new Date() : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ notice }, { status: 201 });
  } catch (error) {
    console.error("Error creating notice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
