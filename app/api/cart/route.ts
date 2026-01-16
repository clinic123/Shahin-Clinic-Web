// app/api/cart/route.ts
import { Prisma } from "@/prisma/generated/prisma";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const bookSelect = {
  id: true,
  title: true,
  author: true,
  image: true,
  price: true,
  stock: true,
  rokomariLinkForDirectBuy: true,
  amazonLink: true,
  isActive: true,
} as const;

const cartInclude = {
  include: {
    items: {
      include: {
        book: {
          select: bookSelect,
        },
      },
      orderBy: {
        createdAt: "desc" as const,
      },
    },
  },
} as const;

type CartWithItems = Prisma.CartGetPayload<typeof cartInclude>;

// GET cart for current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      ...cartInclude,
    });

    if (!cart) {
      // Create empty cart if doesn't exist
      const newCart = await prisma.cart.create({
        data: {
          userId: session.user.id,
        },
        ...cartInclude,
      });

      return NextResponse.json({
        success: true,
        data: newCart,
      });
    }

    // Filter out items where book is inactive or out of stock
    const validItems = cart.items.filter(
      (item) => item.book && item.book.isActive && item.book.stock > 0
    );

    // Update cart with valid items only
    if (validItems.length !== cart.items.length) {
      // Remove invalid items from cart
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          bookId: {
            in: cart.items
              .filter(
                (item) =>
                  !item.book || !item.book.isActive || item.book.stock === 0
              )
              .map((item) => item.bookId)
              .filter(Boolean) as string[],
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...cart,
          items: validItems,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cart",
      },
      { status: 500 }
    );
  }
}
// POST add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
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

    const { bookId, quantity = 1 } = body;

    if (!bookId) {
      return NextResponse.json(
        {
          success: false,
          error: "Book ID is required",
        },
        { status: 400 }
      );
    }

    // Verify book exists and is active
    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        isActive: true,
        stock: { gt: 0 },
      },
    });

    if (!book) {
      return NextResponse.json(
        {
          success: false,
          error: "Book not found or out of stock",
        },
        { status: 404 }
      );
    }

    // Check if requested quantity exceeds available stock
    if (quantity > book.stock) {
      return NextResponse.json(
        {
          success: false,
          error: `Only ${book.stock} units available in stock`,
        },
        { status: 400 }
      );
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
      });
    }

    // Check if item already in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_bookId: {
          cartId: cart.id,
          bookId: bookId,
        },
      },
      include: {
        book: true,
      },
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;

      // Check if new quantity exceeds stock
      if (newQuantity > book.stock) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot add more than ${book.stock} units total`,
          },
          { status: 400 }
        );
      }

      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              image: true,
              price: true,
              stock: true,
              rokomariLinkForDirectBuy: true,
              amazonLink: true,
              isActive: true,
            },
          },
        },
      });

      // Revalidate cache
      revalidateTag("cart");
      revalidatePath("/cart");

      return NextResponse.json({
        success: true,
        message: "Item quantity updated in cart",
        data: updatedItem,
      });
    } else {
      // Add new item - use transaction to handle race conditions and unique constraint issues
      try {
        const result = await prisma.$transaction(async (tx) => {
          // Check if item exists within transaction (prevents race conditions)
          const existingItem = await tx.cartItem.findUnique({
            where: {
              cartId_bookId: {
                cartId: cart.id,
                bookId: bookId,
              },
            },
          });

          if (existingItem) {
            // Item exists, update quantity instead
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > book.stock) {
              throw new Error(`Cannot add more than ${book.stock} units total`);
            }

            const updatedItem = await tx.cartItem.update({
              where: { id: existingItem.id },
              data: { quantity: newQuantity },
              include: {
                book: {
                  select: {
                    id: true,
                    title: true,
                    author: true,
                    image: true,
                    price: true,
                    stock: true,
                    rokomariLinkForDirectBuy: true,
                    amazonLink: true,
                    isActive: true,
                  },
                },
              },
            });

            return { item: updatedItem, isUpdate: true };
          } else {
            // Create new item - handle unique constraint on courseId for null values
            // The constraint cartId_courseId can cause issues when multiple books (all with courseId: null) are added
            // We'll catch the error and handle it gracefully
            try {
              const newCartItem = await tx.cartItem.create({
                data: {
                  cartId: cart.id,
                  bookId: bookId,
                  quantity: quantity,
                  // courseId will be null by default for books
                },
                include: {
                  book: {
                    select: {
                      id: true,
                      title: true,
                      author: true,
                      image: true,
                      price: true,
                      stock: true,
                      rokomariLinkForDirectBuy: true,
                      amazonLink: true,
                      isActive: true,
                    },
                  },
                },
              });

              return { item: newCartItem, isUpdate: false };
            } catch (createErr: any) {
              // If we get a unique constraint error on cartId_courseId, it means
              // there's already an item with courseId: null in this cart
              // This shouldn't happen if bookId is unique, but we handle it anyway
              if (
                createErr.code === "P2002" &&
                createErr.meta?.target?.includes("courseId")
              ) {
                // Try to find the item by bookId (which should be unique)
                const existingByBookId = await tx.cartItem.findUnique({
                  where: {
                    cartId_bookId: {
                      cartId: cart.id,
                      bookId: bookId,
                    },
                  },
                });

                if (existingByBookId) {
                  // Item exists, update quantity instead
                  const newQuantity = existingByBookId.quantity + quantity;
                  if (newQuantity > book.stock) {
                    throw new Error(
                      `Cannot add more than ${book.stock} units total`
                    );
                  }

                  const updatedItem = await tx.cartItem.update({
                    where: { id: existingByBookId.id },
                    data: { quantity: newQuantity },
                    include: {
                      book: {
                        select: {
                          id: true,
                          title: true,
                          author: true,
                          image: true,
                          price: true,
                          stock: true,
                          rokomariLinkForDirectBuy: true,
                          amazonLink: true,
                          isActive: true,
                        },
                      },
                    },
                  });

                  return { item: updatedItem, isUpdate: true };
                }
              }
              // Re-throw if it's not a constraint error we can handle
              throw createErr;
            }
          }
        });

        // Revalidate cache
        revalidateTag("cart");
        revalidatePath("/cart");

        return NextResponse.json(
          {
            success: true,
            message: result.isUpdate
              ? "Item quantity updated in cart"
              : "Item added to cart",
            data: result.item,
          },
          { status: result.isUpdate ? 200 : 201 }
        );
      } catch (createError: any) {
        // Handle errors from transaction
        if (createError.message?.includes("Cannot add more than")) {
          return NextResponse.json(
            {
              success: false,
              error: createError.message,
            },
            { status: 400 }
          );
        }

        // Handle unique constraint violation - fallback to find and update
        if (createError.code === "P2002") {
          // Try to find if there's an existing item with the same bookId
          const conflictItem = await prisma.cartItem.findFirst({
            where: {
              cartId: cart.id,
              bookId: bookId,
            },
            include: {
              book: true,
            },
          });

          if (conflictItem) {
            // Item exists, update quantity instead
            const newQuantity = conflictItem.quantity + quantity;
            if (newQuantity > book.stock) {
              return NextResponse.json(
                {
                  success: false,
                  error: `Cannot add more than ${book.stock} units total`,
                },
                { status: 400 }
              );
            }

            const updatedItem = await prisma.cartItem.update({
              where: { id: conflictItem.id },
              data: { quantity: newQuantity },
              include: {
                book: {
                  select: {
                    id: true,
                    title: true,
                    author: true,
                    image: true,
                    price: true,
                    stock: true,
                    rokomariLinkForDirectBuy: true,
                    amazonLink: true,
                    isActive: true,
                  },
                },
              },
            });

            // Revalidate cache
            revalidateTag("cart");
            revalidatePath("/cart");

            return NextResponse.json({
              success: true,
              message: "Item quantity updated in cart",
              data: updatedItem,
            });
          }
        }
        // Re-throw if it's not a constraint error we can handle
        console.error("Error creating cart item:", createError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to add item to cart. Please try again.",
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add item to cart",
      },
      { status: 500 }
    );
  }
}

// PUT update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
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

    const { cartItemId, quantity } = body;

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Cart item ID and quantity are required",
        },
        { status: 400 }
      );
    }

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          error: "Cart not found",
        },
        { status: 404 }
      );
    }

    // Find the cart item and verify it belongs to user's cart
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
      include: {
        book: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        {
          success: false,
          error: "Cart item not found",
        },
        { status: 404 }
      );
    }

    // Check if book is still available
    if (
      !cartItem.book ||
      !cartItem.book.isActive ||
      cartItem.book.stock === 0
    ) {
      // Remove the item from cart
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });

      return NextResponse.json(
        {
          success: false,
          error:
            "This book is no longer available and has been removed from your cart",
        },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });

      // Revalidate cache
      revalidateTag("cart");
      revalidatePath("/cart");

      return NextResponse.json({
        success: true,
        message: "Item removed from cart",
        data: null,
      });
    }

    // Check if requested quantity exceeds available stock
    if (quantity > cartItem.book.stock) {
      return NextResponse.json(
        {
          success: false,
          error: `Only ${cartItem.book.stock} units available in stock`,
        },
        { status: 400 }
      );
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            image: true,
            price: true,
            stock: true,
            rokomariLinkForDirectBuy: true,
            amazonLink: true,
            isActive: true,
          },
        },
      },
    });

    // Revalidate cache
    revalidateTag("cart");
    revalidatePath("/cart");

    return NextResponse.json({
      success: true,
      message: "Cart item updated",
      data: updatedCartItem,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update cart",
      },
      { status: 500 }
    );
  }
}
