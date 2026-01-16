import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { message: "Category slug is required" },
        { status: 404 }
      );
    }

    const category = await prisma.forumCategory.findUnique({
      where: { slug: slug },
      include: {
        topics: {
          orderBy: { lastActivityAt: "desc" },
          include: {
            author: { select: { name: true, image: true } },
            _count: { select: { posts: true } },
          },
        },
        _count: { select: { topics: true } },
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch category", error: error.message },
      { status: 500 }
    );
  }
}
