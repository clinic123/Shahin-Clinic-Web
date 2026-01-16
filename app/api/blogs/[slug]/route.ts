import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Post slug is required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: {
        slug,
      },

      include: {
        author: true,
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user can view unpublished posts
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!post.published) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Error fetching post" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const {
      title,
      content,
      excerpt,
      published,
      categoryIds,
      tagNames,
      featuredImage,
    } = await request.json();

    // Check authorization
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { slug: slug },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Convert HTML string to JSON object for Prisma if content is string
    let contentJson = content;
    if (typeof content === "string") {
      contentJson = {
        html: content,
        text: content.replace(/<[^>]*>/g, "").substring(0, 200),
        version: "1.0",
        updatedAt: new Date().toISOString(),
      };
    }

    // First, remove all existing post tags
    await prisma.postTag.deleteMany({
      where: { postId: slug },
    });

    // Then update the post with new tags
    const post = await prisma.post.update({
      where: { id: slug },
      data: {
        title,
        content: contentJson,
        excerpt,
        published,
        publishedAt: published ? new Date() : null,
        featuredImage,
        // Add tags if provided
        ...(tagNames && {
          tags: {
            create: tagNames.map((tagName: string) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: {
                    name: tagName,
                    slug: tagName.toLowerCase().replace(/\s+/g, "-"),
                  },
                },
              },
            })),
          },
        }),
      },
      include: {
        author: { select: { name: true } },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use a transaction to ensure all deletions happen together
    const result = await prisma.$transaction(async (tx) => {
      // First, check if post exists
      const post = await tx.post.findUnique({
        where: { slug },
        include: {
          comments: {
            include: {
              replies: true,
            },
          },
          tags: true,
        },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      // Handle comments with nested replies - we need to delete in correct order
      if (post.comments.length > 0) {
        // First, break the parent-child relationships by setting parentId to null
        await tx.comment.updateMany({
          where: {
            postId: slug,
            parentId: { not: null },
          },
          data: { parentId: null },
        });

        // Now we can safely delete all comments for this post
        await tx.comment.deleteMany({
          where: { postId: slug },
        });
      }

      // Delete related post tags
      await tx.postTag.deleteMany({
        where: { postId: slug },
      });

      // Finally delete the post
      const deletedPost = await tx.post.delete({
        where: { slug },
      });

      return deletedPost;
    });

    revalidateTag("blogs");
    revalidatePath("/blogs");
    revalidatePath("/admin/blogs");
    revalidatePath("/");
    return NextResponse.json({
      message: "Post deleted successfully",
      post: result,
    });
  } catch (error) {
    console.error("Error deleting post:", error);

    if (error instanceof Error) {
      if (error.message.includes("Post not found")) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      if (error.message.includes("P2014")) {
        return NextResponse.json(
          {
            error:
              "Cannot delete post because it has related comments or tags. Please try again.",
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
