// app/api/orders/route.ts
import { auth } from "@/lib/auth";
import { createTransporter } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// Blacklist for transaction IDs
const blacklist = [
  "00000000",
  "11111111",
  "22222222",
  "33333333",
  "44444444",
  "55555555",
  "66666666",
  "77777777",
  "88888888",
  "99999999",
  "TEST1234",
  "DEMO0001",
  "SAMPLE01",
  "MOCK0001",
  "FAKE0001",
];

const createOrderEmailTemplates = (order: any, user: any) => {
  const formattedDate = new Date(order.createdAt).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Customer Email
  const customerEmail = {
    subject: `Order ${order.status} - #${order.id.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Order Confirmed!</h2>
        <p>Dear ${order.customerName},</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Order Details:</h3>
          <p><strong>Order ID:</strong> #${order.id.slice(-8).toUpperCase()}</p>
          <p><strong>Order Date:</strong> ${formattedDate}</p>
          <p><strong>Total Amount:</strong> ৳${order.totalAmount} BDT</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>

        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #166534; margin-top: 0;">Order Items:</h4>
          ${order.items
            .map(
              (item: any) => `
            <div style="border-bottom: 1px solid #e2e8f0; padding: 10px 0;">
              <p><strong>${item.book.title}</strong> by ${item.book.author}</p>
              <p>Quantity: ${item.quantity} × ৳${item.price} = ৳${
                item.quantity * item.price
              }</p>
            </div>
          `
            )
            .join("")}
        </div>

        <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #d97706; margin-top: 0;">Shipping Information:</h4>
          <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
          <p><strong>Contact:</strong> ${order.customerPhone} | ${
      order.customerEmail
    }</p>
          <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
        </div>

        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1e293b; margin-top: 0;">Payment Details:</h4>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Transaction ID:</strong> ${order.paymentTransactionId}</p>
          <p><strong>Payment Mobile:</strong> ${order.paymentMobile}</p>
        </div>

        <p style="color: #64748b;">
          Thank you for your order! We will process it soon and notify you about the shipping details.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 14px;">
          This is an automated confirmation. Please do not reply to this email.
        </p>
      </div>
    `,
  };

  // Admin Email
  const adminEmail = {
    subject: `New Book Order - #${order.id.slice(-8).toUpperCase()} - ${
      order.customerName
    }`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">New Book Order Received</h2>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Order Summary:</h3>
          <p><strong>Order ID:</strong> #${order.id.slice(-8).toUpperCase()}</p>
          <p><strong>Customer:</strong> ${order.customerName}</p>
          <p><strong>Email:</strong> ${order.customerEmail}</p>
          <p><strong>Phone:</strong> ${order.customerPhone}</p>
          <p><strong>Order Date:</strong> ${formattedDate}</p>
          <p><strong>Total Amount:</strong> ৳${order.totalAmount} BDT</p>
        </div>

        <div style="background: #faf5ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1e293b; margin-top: 0;">Order Items:</h4>
          ${order.items
            .map(
              (item: any) => `
            <div style="border-bottom: 1px solid #e2e8f0; padding: 10px 0;">
              <p><strong>${item.book.title}</strong> by ${item.book.author}</p>
              <p>Quantity: ${item.quantity} × ৳${item.price} = ৳${
                item.quantity * item.price
              }</p>
              <p><strong>Book ID:</strong> ${item.bookId}</p>
            </div>
          `
            )
            .join("")}
        </div>

        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1e293b; margin-top: 0;">Payment Information:</h4>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Transaction ID:</strong> ${order.paymentTransactionId}</p>
          <p><strong>Payment Mobile:</strong> ${order.paymentMobile}</p>
        </div>

        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #047857; margin-top: 0;">Shipping Address:</h4>
          <p>${order.shippingAddress}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/admin/orders" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View in Admin Panel
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 14px;">
          System generated notification.
        </p>
      </div>
    `,
  };

  return { customerEmail, adminEmail };
};

const sendOrderEmails = async (order: any, user: any) => {
  try {
    const transporter = createTransporter();
    const templates = createOrderEmailTemplates(order, user);

    // Get admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: "admin" },
      select: { email: true },
    });

    const adminEmails = adminUsers.map((admin) => admin.email).filter(Boolean);

    // Send to customer
    if (order.customerEmail) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: order.customerEmail,
        subject: templates.customerEmail.subject,
        html: templates.customerEmail.html,
      });
    }

    // Send to all admin users
    if (adminEmails.length > 0) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: adminEmails,
        subject: templates.adminEmail.subject,
        html: templates.adminEmail.html,
      });
    }

    console.log("Order confirmation emails sent successfully");
  } catch (emailError) {
    console.error("Error sending order emails:", emailError);
  }
};

// POST create order
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

    const {
      paymentMethod,
      paymentTransactionId,
      paymentMobile,
      shippingAddress,
      customerPhone,
      customerName,
      customerEmail,
    } = body;

    // Validate required fields
    if (
      !paymentMethod ||
      !paymentTransactionId ||
      !paymentMobile ||
      !shippingAddress ||
      !customerPhone ||
      !customerName ||
      !customerEmail
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields are required",
        },
        { status: 400 }
      );
    }

    // Validate transaction ID
    if (blacklist.includes(paymentTransactionId.toUpperCase())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid transaction ID",
        },
        { status: 400 }
      );
    }

    // Get user's cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cart is empty",
        },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total, item) => {
      return total + item.quantity * (item.book?.price ?? 0);
    }, 0);

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          totalAmount,
          paymentMethod,
          paymentTransactionId,
          paymentMobile,
          shippingAddress,
          customerEmail,
          customerPhone,
          customerName,
          items: {
            create: cart.items.map((item) => ({
              bookId: item.bookId,
              quantity: item.quantity,
              price: item.book?.price ?? 0,
            })),
          },
        },
        include: {
          items: {
            include: {
              book: true,
            },
          },
        },
      });

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    // Send emails (don't await to avoid blocking response)
    sendOrderEmails(order, session.user).catch(console.error);

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully",
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

// GET orders for current user
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: { userId: session.user.id },
        include: {
          items: {
            include: {
              book: {
                select: {
                  id: true,
                  title: true,
                  author: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({
        where: { userId: session.user.id },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}
