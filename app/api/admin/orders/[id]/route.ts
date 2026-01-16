import { auth } from "@/lib/auth";
import { sendOrderStatusUpdateEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                image: true,
                price: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PUT update order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      console.log("Unauthorized access attempt");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Update data:", body);

    const {
      status,
      shippingAddress,
      customerPhone,
      customerName,
      customerEmail,
    } = body;

    // Find the order first
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      console.log("Order not found:", id);
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const oldStatus = order.status;
    console.log("Old status:", oldStatus, "New status:", status);

    // Prepare update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (shippingAddress) updateData.shippingAddress = shippingAddress;
    if (customerPhone) updateData.customerPhone = customerPhone;
    if (customerName) updateData.customerName = customerName;
    if (customerEmail) updateData.customerEmail = customerEmail;

    console.log("Update data to apply:", updateData);

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    console.log("Order updated successfully:", updatedOrder.id);

    if (status && status !== oldStatus) {
      // We don't await to avoid blocking the response
      sendOrderStatusUpdateEmail(updatedOrder, oldStatus, status).catch(
        (error) => console.error("Failed to send email:", error)
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE order
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
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
