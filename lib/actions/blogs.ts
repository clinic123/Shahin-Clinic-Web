"use server";

import { auth } from "@/lib/auth";
import { PrismaClient, type Prisma } from "@/prisma/generated/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";

const prisma = new PrismaClient();

// Type definitions for better type safety
export interface CreatePostInput {
  title: string;
  content: string;
  excerpt?: string;
  shortDescription: string;
  published?: boolean;
  categorySlug?: string;
  tagNames?: string[];
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  excerpt?: string;
  shortDescription?: string;
  published?: boolean;
  categorySlug?: string;
  tagNames?: string[];
}

export async function getBlogPosts(filters?: {
  sort?: string;
  category?: string;
  search?: string;
  limit?: number;
  published?: boolean;
}) {
  try {
    const sort = filters?.sort || "newest";
    const category = filters?.category;
    const search = filters?.search;
    const limit = filters?.limit;
    const published = filters?.published !== false;

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
      ...(category && {
        category: {
          slug: category,
        },
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
          { shortDescription: { contains: search, mode: "insensitive" } },
          { excerpt: { contains: search, mode: "insensitive" } },
        ],
      }),
      published,
    };

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy,
      take: limit,
    });

    return {
      success: true,
      data: posts,
      count: posts.length,
    };
  } catch (error: any) {
    console.error("Error fetching blog posts:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch blog posts",
      status: 500,
    };
  }
}

export async function getBlogPostBySlug(slug: string, allowUnpublished: boolean = false) {
  try {
    if (!slug || slug.trim() === "") {
      return {
        success: false,
        error: "Post slug is required",
        status: 400,
      };
    }

    const trimmedSlug = slug.trim();

    // Check admin session first to allow admins to view any post
    let isAdmin = false;
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      isAdmin = session?.user?.role === "admin";
    } catch (sessionError) {
      // If session check fails, continue with normal flow
      console.warn("Session check failed, continuing as non-admin:", sessionError);
    }

    // Log for debugging
    console.log("Fetching post with slug:", trimmedSlug, "isAdmin:", isAdmin, "allowUnpublished:", allowUnpublished);

    const post = await prisma.post.findUnique({
      where: { slug: trimmedSlug },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!post) {
      return {
        success: false,
        error: "Post not found",
        status: 404,
      };
    }

    // If allowUnpublished is true (for admin routes) or user is admin, allow viewing any post
    if (allowUnpublished || isAdmin) {
      return {
        success: true,
        data: post,
      };
    }

    // For non-admin users, only allow viewing published posts
    if (!post.published) {
      return {
        success: false,
        error: "Post not found",
        status: 404,
      };
    }

    return {
      success: true,
      data: post,
    };
  } catch (error: any) {
    console.error("Error fetching blog post:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch blog post",
      status: 500,
    };
  }
}

export async function createBlogPost(input: CreatePostInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized - Admin access required",
        status: 401,
      };
    }

    // Validate required fields
    if (!input.title || !input.content || !input.shortDescription) {
      return {
        success: false,
        error: "Missing required fields: title, content, shortDescription",
        status: 400,
      };
    }

    // Generate slug from title
    const slug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return {
        success: false,
        error: "A post with this title already exists",
        status: 409,
      };
    }

    // Prepare create data
    const createData: Prisma.PostCreateInput = {
      title: input.title,
      content: input.content,
      excerpt: input.excerpt || "",
      shortDescription: input.shortDescription,
      slug,
      published: input.published || false,
      publishedAt: input.published ? new Date() : null,
      author: {
        connect: { id: session.user.id },
      },
      ...(input.categorySlug && {
        category: {
          connect: { slug: input.categorySlug },
        },
      }),
    };

    // Handle tags if provided
    if (input.tagNames && input.tagNames.length > 0) {
      createData.tags = {
        create: input.tagNames.map((tagName: string) => ({
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
      };
    }

    const post = await prisma.post.create({
      data: createData,
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Revalidate
    revalidateTag("blogs");
    revalidatePath("/blogs");
    revalidatePath("/admin/blogs");
    revalidatePath(`/blogs/${post.slug}`);
    revalidatePath("/");

    return {
      success: true,
      data: post,
      message: "Blog post created successfully",
    };
  } catch (error) {
    console.error("Error creating blog post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create blog post",
      status: 500,
    };
  }
}

export async function updateBlogPost(slug: string, input: UpdatePostInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized - Admin access required",
        status: 401,
      };
    }

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (!existingPost) {
      return {
        success: false,
        error: "Post not found",
        status: 404,
      };
    }

    // Prepare update data
    const updateData: Prisma.PostUpdateInput = {
      ...(input.title && { title: input.title }),
      ...(input.content && { content: input.content }),
      ...(input.excerpt && { excerpt: input.excerpt }),
      ...(input.shortDescription && {
        shortDescription: input.shortDescription,
      }),
      ...(input.published !== undefined && {
        published: input.published,
        publishedAt: input.published ? new Date() : null,
      }),
      ...(input.categorySlug && {
        category: {
          connect: { slug: input.categorySlug },
        },
      }),
    };

    // Handle tags separately if provided
    if (input.tagNames && input.tagNames.length > 0) {
      // Delete existing tags
      await prisma.postTag.deleteMany({
        where: { postId: existingPost.id },
      });

      // Add new tags
      updateData.tags = {
        create: input.tagNames.map((tagName: string) => ({
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
      };
    }

    const post = await prisma.post.update({
      where: { slug },
      data: updateData,
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    revalidateTag("blogs");
    revalidatePath("/blogs");
    revalidatePath("/admin/blogs");
    revalidatePath(`/blogs/${slug}`);
    revalidatePath("/");

    return {
      success: true,
      data: post,
      message: "Blog post updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating blog post:", error);
    return {
      success: false,
      error: error.message || "Failed to update blog post",
      status: 500,
    };
  }
}

export async function deleteBlogPost(slug: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized - Admin access required",
        status: 401,
      };
    }

    // Use a transaction to ensure all deletions happen together
    const result = await prisma.$transaction(async (tx) => {
      // Check if post exists
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

      // Handle comments with nested replies
      if (post.comments.length > 0) {
        // Break parent-child relationships
        await tx.comment.updateMany({
          where: {
            postId: slug,
            parentId: { not: null },
          },
          data: { parentId: null },
        });

        // Delete all comments
        await tx.comment.deleteMany({
          where: { postId: slug },
        });
      }

      // Delete related post tags
      await tx.postTag.deleteMany({
        where: { postId: post.id },
      });

      // Delete the post
      const deletedPost = await tx.post.delete({
        where: { slug },
      });

      return deletedPost;
    });

    revalidateTag("blogs");
    revalidatePath("/blogs");
    revalidatePath("/admin/blogs");
    revalidatePath("/");

    return {
      success: true,
      data: result,
      message: "Blog post deleted successfully",
    };
  } catch (error: any) {
    console.error("Error deleting blog post:", error);

    if (error.message.includes("Post not found")) {
      return {
        success: false,
        error: "Post not found",
        status: 404,
      };
    }

    return {
      success: false,
      error: error.message || "Failed to delete blog post",
      status: 500,
    };
  }
}

export async function getBlogPostsByAuthor(authorId: string) {
  try {
    const posts = await prisma.post.findMany({
      where: { authorId },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: posts,
      count: posts.length,
    };
  } catch (error: any) {
    console.error("Error fetching author posts:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch author posts",
      status: 500,
    };
  }
}
