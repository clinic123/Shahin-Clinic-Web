import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, postId, parentId } = await request.json();

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id,
        postId,
        parentId: parentId || null,
        approved: true, // Auto-approve
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Helper function to build nested comment structure
function buildCommentTree(comments: any[]) {
  const commentMap = new Map();
  const rootComments: any[] = [];

  // First pass: store all comments in a map
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: build the tree
  comments.forEach((comment) => {
    const commentNode = commentMap.get(comment.id);
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies.push(commentNode);
      }
    } else {
      rootComments.push(commentNode);
    }
  });

  return rootComments;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId,
        approved: true,
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Build nested comment structure
    const nestedComments = buildCommentTree(comments);

    return NextResponse.json(nestedComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
