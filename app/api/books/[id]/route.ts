import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// GET single book by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookId } = await params;

    if (!bookId) {
      return NextResponse.json(
        {
          success: false,
          error: "Book ID is required",
        },
        { status: 400 }
      );
    }

    const book = await prisma.book.findUnique({
      where: {
        id: bookId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        author: true,
        description: true,
        image: true,
        price: true,
        stock: true,
        rokomariLinkForDirectBuy: true,
        amazonLink: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!book) {
      return NextResponse.json(
        {
          success: false,
          error: "Book not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch book",
      },
      { status: 500 }
    );
  }
}

// PUT update book by ID (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Admin access required",
        },
        { status: 401 }
      );
    }

    const { id: bookId } = await params;

    if (!bookId) {
      return NextResponse.json(
        {
          success: false,
          error: "Book ID is required",
        },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON body",
        },
        { status: 400 }
      );
    }

    const {
      title,
      author,
      description,
      image,
      price,
      stock,
      rokomariLinkForDirectBuy,
      amazonLink,
      isActive,
    } = body;

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!existingBook) {
      return NextResponse.json(
        {
          success: false,
          error: "Book not found",
        },
        { status: 404 }
      );
    }

    // Validate price and stock if provided
    if (price !== undefined && price < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Price cannot be negative",
        },
        { status: 400 }
      );
    }

    if (stock !== undefined && stock < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Stock cannot be negative",
        },
        { status: 400 }
      );
    }

    // Check for duplicate title and author if updating
    if (title || author) {
      const duplicateBook = await prisma.book.findFirst({
        where: {
          title: title || existingBook.title,
          author: author || existingBook.author,
          id: { not: bookId },
          isActive: true,
        },
      });

      if (duplicateBook) {
        return NextResponse.json(
          {
            success: false,
            error: "A book with this title and author already exists",
          },
          { status: 409 }
        );
      }
    }

    // Update book
    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: {
        ...(title && { title }),
        ...(author && { author }),
        ...(description && { description }),
        ...(image && { image }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(rokomariLinkForDirectBuy !== undefined && {
          rokomariLinkForDirectBuy: rokomariLinkForDirectBuy || null,
        }),
        ...(amazonLink !== undefined && { amazonLink: amazonLink || null }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        title: true,
        author: true,
        description: true,
        image: true,
        price: true,
        stock: true,
        rokomariLinkForDirectBuy: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Book updated successfully",
      data: updatedBook,
    });
  } catch (error) {
    console.error("Error updating book:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update book",
      },
      { status: 500 }
    );
  }
}

// DELETE book by ID (soft delete - admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Admin access required",
        },
        { status: 401 }
      );
    }

    const { id: bookId } = await params;

    if (!bookId) {
      return NextResponse.json(
        {
          success: false,
          error: "Book ID is required",
        },
        { status: 400 }
      );
    }

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!existingBook) {
      return NextResponse.json(
        {
          success: false,
          error: "Book not found",
        },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.book.update({
      where: { id: bookId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete book",
      },
      { status: 500 }
    );
  }
}
