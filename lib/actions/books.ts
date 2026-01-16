"use server";

import { auth } from "@/lib/auth";
import { PrismaClient } from "@/prisma/generated/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";

const prisma = new PrismaClient();

interface CreateBookInput {
  title: string;
  author: string;
  description: string;
  image: string;
  price: number;
  stock?: number;
  rokomariLinkForDirectBuy?: string;
  amazonLink?: string;
}

interface UpdateBookInput {
  title?: string;
  author?: string;
  description?: string;
  image?: string;
  price?: number;
  stock?: number;
  rokomariLinkForDirectBuy?: string;
  amazonLink?: string;
  isActive?: boolean;
}

export async function createBook(input: CreateBookInput) {
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
    if (
      !input.title ||
      !input.author ||
      !input.description ||
      !input.image ||
      input.price === undefined
    ) {
      return {
        success: false,
        error: "Missing required fields: title, author, description, image, price",
        status: 400,
      };
    }

    // Validate price
    if (input.price < 0) {
      return {
        success: false,
        error: "Price cannot be negative",
        status: 400,
      };
    }

    // Validate stock
    const stock = input.stock ?? 0;
    if (stock < 0) {
      return {
        success: false,
        error: "Stock cannot be negative",
        status: 400,
      };
    }

    // Check if book with same title and author already exists
    const existingBook = await prisma.book.findFirst({
      where: {
        title: input.title,
        author: input.author,
        isActive: true,
      },
    });

    if (existingBook) {
      return {
        success: false,
        error: "A book with this title and author already exists",
        status: 409,
      };
    }

    // Create book
    const book = await prisma.book.create({
      data: {
        title: input.title,
        author: input.author,
        description: input.description,
        image: input.image,
        price: parseFloat(String(input.price)),
        stock: parseInt(String(stock)),
        rokomariLinkForDirectBuy: input.rokomariLinkForDirectBuy || null,
        amazonLink: input.amazonLink || null,
      },
    });

    // Revalidate
    revalidateTag("books");
    revalidateTag(`book-${book.id}`);
    revalidatePath("/books");
    revalidatePath(`/books/${book.id}`); // Book detail page
    revalidatePath("/"); // Homepage where BookSection is displayed
    revalidatePath("/admin/books");

    return {
      success: true,
      data: book,
      message: "Book created successfully",
    };
  } catch (error) {
    console.error("Error creating book:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create book",
      status: 500,
    };
  }
}

export async function updateBook(bookId: string, input: UpdateBookInput) {
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

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!existingBook) {
      return {
        success: false,
        error: "Book not found",
        status: 404,
      };
    }

    // Validate price if provided
    if (input.price !== undefined && input.price < 0) {
      return {
        success: false,
        error: "Price cannot be negative",
        status: 400,
      };
    }

    // Validate stock if provided
    if (input.stock !== undefined && input.stock < 0) {
      return {
        success: false,
        error: "Stock cannot be negative",
        status: 400,
      };
    }

    // Check for duplicate title and author if updating
    if (input.title || input.author) {
      const duplicateBook = await prisma.book.findFirst({
        where: {
          title: input.title || existingBook.title,
          author: input.author || existingBook.author,
          isActive: true,
          id: { not: bookId },
        },
      });

      if (duplicateBook) {
        return {
          success: false,
          error: "A book with this title and author already exists",
          status: 409,
        };
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.author !== undefined) updateData.author = input.author;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.image !== undefined) updateData.image = input.image;
    if (input.price !== undefined)
      updateData.price = parseFloat(String(input.price));
    if (input.stock !== undefined) updateData.stock = parseInt(String(input.stock));
    if (input.rokomariLinkForDirectBuy !== undefined)
      updateData.rokomariLinkForDirectBuy = input.rokomariLinkForDirectBuy;
    if (input.amazonLink !== undefined) updateData.amazonLink = input.amazonLink;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    // Update book
    const book = await prisma.book.update({
      where: { id: bookId },
      data: updateData,
    });

    // Revalidate
    revalidateTag("books");
    revalidateTag(`book-${bookId}`);
    revalidatePath("/books");
    revalidatePath("/admin/books");

    return {
      success: true,
      data: book,
      message: "Book updated successfully",
    };
  } catch (error) {
    console.error("Error updating book:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update book",
      status: 500,
    };
  }
}

export async function deleteBook(bookId: string) {
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

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!existingBook) {
      return {
        success: false,
        error: "Book not found",
        status: 404,
      };
    }

    // Soft delete by setting isActive to false
    await prisma.book.update({
      where: { id: bookId },
      data: { isActive: false },
    });

    // Revalidate
    revalidateTag("books");
    revalidateTag(`book-${bookId}`);
    revalidatePath("/books");
    revalidatePath("/admin/books");

    return {
      success: true,
      message: "Book deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting book:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete book",
      status: 500,
    };
  }
}

