import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const revalidateGalleries = () => {
  revalidateTag("galleries");
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/galleries");
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Post id is required" },
        { status: 400 }
      );
    }

    const gallery = await prisma.gallery.findUnique({
      where: {
        id,
      },
    });

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    // Check if user can view unpublished posts
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!gallery.published) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ gallery });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      { error: "Error fetching gallery" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const { title, description, featuredImage, published } =
      await request.json();

    // Check authorization
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if post exists
    const existingPost = await prisma.gallery.findUnique({
      where: { id: id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Then update the post with new tags
    const post = await prisma.gallery.update({
      where: { id: id },
      data: {
        title,
        description: description,
        featuredImage,
        published,
        publishedAt: published ? new Date() : null,
      },
    });
    revalidateGalleries();
    return NextResponse.json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use a transaction to ensure all deletions happen together
    const result = await prisma.$transaction(async (tx) => {
      // First, check if post exists
      const post = await tx.gallery.findUnique({
        where: { id },
      });

      if (!post) {
        throw new Error("Gallery not found");
      }

      // Finally delete the post
      const deletedPost = await tx.gallery.delete({
        where: { id },
      });

      return deletedPost;
    });
    revalidateGalleries();
    return NextResponse.json({
      message: "Gallery deleted successfully",
      post: result,
    });
  } catch (error) {
    console.error("Error deleting gallery:", error);

    if (error instanceof Error) {
      if (error.message.includes("gallery not found")) {
        return NextResponse.json(
          { error: "gallery not found" },
          { status: 404 }
        );
      }

      if (error.message.includes("P2014")) {
        return NextResponse.json(
          {
            error:
              "Cannot delete gallery because it has related comments or tags. Please try again.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
