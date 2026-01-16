import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.forumCategory.findMany({
      where: { isActive: true },
      include: {
        topics: {
          orderBy: { lastActivityAt: "desc" },
          take: 5,
          include: {
            author: { select: { name: true, image: true } },
            _count: { select: { posts: true } },
          },
        },
        _count: { select: { topics: true } },
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch forum categories", error: error.message },
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

    const { name, description, color, order } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const category = await prisma.forumCategory.create({
      data: {
        name,
        slug,
        description,
        color,
        order: order || 0,
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error creating category" },
      { status: 500 }
    );
  }
}
