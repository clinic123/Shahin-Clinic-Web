import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

// DELETE remove item from cart
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
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

    const cartItemId = id;

    if (!cartItemId) {
      return NextResponse.json(
        {
          success: false,
          error: "Cart item ID is required",
        },
        { status: 400 }
      );
    }

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

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cartId: cart.id,
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

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    // Revalidate cache
    revalidateTag("cart");
    revalidatePath("/cart");

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to remove item from cart",
      },
      { status: 500 }
    );
  }
}

// Clear entire cart
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
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

    const action = id;

    if (action !== "clear") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action",
        },
        { status: 400 }
      );
    }

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

    // Delete all cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Revalidate cache
    revalidateTag("cart");
    revalidatePath("/cart");

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clear cart",
      },
      { status: 500 }
    );
  }
}
