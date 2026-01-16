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
        { error: "Topic slug is required" },
        { status: 400 }
      );
    }
    const topic = await prisma.forumTopic.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, image: true, role: true } },
        category: true,
        votes: {
          select: {
            userId: true,
            type: true,
          },
        },
        posts: {
          // where: { parentId: null }, // Only get top-level posts
          include: {
            author: {
              select: { id: true, name: true, image: true, role: true },
            },
            votes: {
              select: {
                userId: true,
                type: true,
              },
            },
            _count: {
              select: { replies: true, votes: true },
            },

            replies: {
              where: { parentId: null },
              include: {
                author: {
                  select: { id: true, name: true, image: true, role: true },
                },
                votes: {
                  select: { userId: true, type: true },
                },
                _count: {
                  select: { replies: true, votes: true },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: [{ isAnswer: "desc" }, { createdAt: "asc" }],
        },
        _count: {
          select: { posts: true, followers: true, votes: true },
        },
      },
    });

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.forumTopic.update({
      where: { id: topic.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(topic);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch topic", error: error.message },
      { status: 500 }
    );
  }
}
