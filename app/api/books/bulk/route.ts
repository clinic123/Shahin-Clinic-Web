// app/api/books/bulk/route.ts
import { auth } from "@/lib/auth";

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// POST bulk create books (admin only)
export async function POST(request: NextRequest) {
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

    const { books } = body;

    if (!books || !Array.isArray(books)) {
      return NextResponse.json(
        {
          success: false,
          error: "Books array is required",
        },
        { status: 400 }
      );
    }

    if (books.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Books array cannot be empty",
        },
        { status: 400 }
      );
    }

    // Validate each book
    for (const book of books) {
      if (
        !book.title ||
        !book.author ||
        !book.description ||
        !book.image ||
        !book.price
      ) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required fields for book: ${
              book.title || "Unknown"
            }`,
          },
          { status: 400 }
        );
      }

      if (book.price < 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Price cannot be negative for book: ${book.title}`,
          },
          { status: 400 }
        );
      }

      if (book.stock < 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Stock cannot be negative for book: ${book.title}`,
          },
          { status: 400 }
        );
      }
    }

    // Check for duplicates
    const existingBooks = await prisma.book.findMany({
      where: {
        OR: books.map((book) => ({
          title: book.title,
          author: book.author,
        })),
        isActive: true,
      },
    });

    if (existingBooks.length > 0) {
      const duplicateTitles = existingBooks
        .map((b) => `${b.title} by ${b.author}`)
        .join(", ");
      return NextResponse.json(
        {
          success: false,
          error: `Duplicate books found: ${duplicateTitles}`,
        },
        { status: 409 }
      );
    }

    // Create books in transaction
    const createdBooks = await prisma.$transaction(
      books.map((book) =>
        prisma.book.create({
          data: {
            title: book.title,
            author: book.author,
            description: book.description,
            image: book.image,
            price: parseFloat(book.price),
            stock: parseInt(book.stock) || 0,
            rokomariLinkForDirectBuy: book.rokomariLinkForDirectBuy || null,
            amazonLink: book.amazonLink || null,
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
          },
        })
      )
    );

    return NextResponse.json(
      {
        success: true,
        message: `${createdBooks.length} books created successfully`,
        data: createdBooks,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating bulk books:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create books",
      },
      { status: 500 }
    );
  }
}

// PUT bulk update books (admin only)
export async function PUT(request: NextRequest) {
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

    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        {
          success: false,
          error: "Updates array is required",
        },
        { status: 400 }
      );
    }

    // Validate each update
    for (const update of updates) {
      if (!update.id) {
        return NextResponse.json(
          {
            success: false,
            error: "Book ID is required for each update",
          },
          { status: 400 }
        );
      }

      if (update.price !== undefined && update.price < 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Price cannot be negative for book ID: ${update.id}`,
          },
          { status: 400 }
        );
      }

      if (update.stock !== undefined && update.stock < 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Stock cannot be negative for book ID: ${update.id}`,
          },
          { status: 400 }
        );
      }
    }

    // Update books in transaction
    const updatedBooks = await prisma.$transaction(
      updates.map((update) =>
        prisma.book.update({
          where: { id: update.id },
          data: {
            ...(update.title && { title: update.title }),
            ...(update.author && { author: update.author }),
            ...(update.description && { description: update.description }),
            ...(update.image && { image: update.image }),
            ...(update.price !== undefined && {
              price: parseFloat(update.price),
            }),
            ...(update.stock !== undefined && {
              stock: parseInt(update.stock),
            }),
            ...(update.rokomariLinkForDirectBuy !== undefined && {
              rokomariLinkForDirectBuy: update.rokomariLinkForDirectBuy || null,
            }),
            ...(update.amazonLink !== undefined && {
              amazonLink: update.amazonLink || null,
            }),
            ...(update.isActive !== undefined && { isActive: update.isActive }),
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
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `${updatedBooks.length} books updated successfully`,
      data: updatedBooks,
    });
  } catch (error) {
    console.error("Error updating bulk books:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update books",
      },
      { status: 500 }
    );
  }
}
