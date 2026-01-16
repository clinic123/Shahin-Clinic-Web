import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const notice = await prisma.notice.findUnique({
      where: { id },
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

    if (!notice) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }

    return NextResponse.json({ notice });
  } catch (error) {
    console.error("Error fetching notice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      content,
      summary,
      category,
      isPublished,
      isPinned,
      expiresAt,
    } = body;

    const existingNotice = await prisma.notice.findUnique({
      where: { id },
    });

    if (!existingNotice) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }

    const updateData: any = {
      ...(title && { title }),
      ...(content && { content }),
      ...(summary !== undefined && { summary }),
      ...(category && { category }),
      ...(isPinned !== undefined && { isPinned }),
      ...(expiresAt !== undefined && {
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }),
    };

    // Handle publish status change
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished;
      updateData.publishedAt =
        isPublished && !existingNotice.isPublished
          ? new Date()
          : existingNotice.publishedAt;
    }

    const notice = await prisma.notice.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ notice });
  } catch (error) {
    console.error("Error updating notice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingNotice = await prisma.notice.findUnique({
      where: { id },
    });

    if (!existingNotice) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }

    await prisma.notice.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Notice deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting notice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
