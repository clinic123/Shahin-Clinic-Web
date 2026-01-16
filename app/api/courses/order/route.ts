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

const createCourseOrderEmailTemplates = (
  courseOrder: any,
  user: any,
  course: any
) => {
  const formattedDate = new Date(courseOrder.createdAt).toLocaleString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  // Customer Email
  const customerEmail = {
    subject: `Course Enrollment Confirmation - ${course.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Course Enrollment Confirmed!</h2>
        <p>Dear ${user.name},</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Course Details:</h3>
          <p><strong>Course:</strong> ${course.title}</p>
          <p><strong>Description:</strong> ${course.description}</p>
          <p><strong>Order Date:</strong> ${formattedDate}</p>
          <p><strong>Total Amount:</strong> ৳${courseOrder.totalAmount} BDT</p>
          <p><strong>Status:</strong> ${courseOrder.status}</p>
          <p><strong>Order ID:</strong> ${courseOrder.id
            .slice(-8)
            .toUpperCase()}</p>
        </div>

        <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #d97706; margin-top: 0;">Next Steps:</h4>
          <p>Your course access is being processed. You will receive another email with your access code and video link once your payment is verified by our team.</p>
          <p>This usually takes 1-2 business days. You will be notified via email once your access is granted.</p>
        </div>

        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1e293b; margin-top: 0;">Payment Information:</h4>
          <p><strong>Payment Method:</strong> ${courseOrder.paymentMethod}</p>
          <p><strong>Transaction ID:</strong> ${
            courseOrder.paymentTransactionId
          }</p>
          <p><strong>Payment Mobile:</strong> ${courseOrder.paymentMobile}</p>
        </div>

        <p style="color: #64748b;">
          Thank you for enrolling in our course! We will notify you once your access is granted.
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
    subject: `New Course Enrollment - ${course.title} - ${user.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">New Course Enrollment</h2>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Order Summary:</h3>
          <p><strong>Order ID:</strong> ${courseOrder.id
            .slice(-8)
            .toUpperCase()}</p>
          <p><strong>Customer:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Phone:</strong> ${courseOrder.customerPhone}</p>
          <p><strong>Course:</strong> ${course.title}</p>
          <p><strong>Order Date:</strong> ${formattedDate}</p>
          <p><strong>Total Amount:</strong> ৳${courseOrder.totalAmount} BDT</p>
        </div>

        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1e293b; margin-top: 0;">Payment Information:</h4>
          <p><strong>Payment Method:</strong> ${courseOrder.paymentMethod}</p>
          <p><strong>Transaction ID:</strong> ${
            courseOrder.paymentTransactionId
          }</p>
          <p><strong>Payment Mobile:</strong> ${courseOrder.paymentMobile}</p>
        </div>

        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #166534; margin-top: 0;">Action Required:</h4>
          <p>Please verify the payment and grant access to the customer by updating the order status in the admin panel.</p>
          <p><strong>Course Video URL:</strong> ${
            course.videoUrl || "Not set"
          }</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/admin/course-orders" 
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

const sendCourseOrderEmails = async (
  courseOrder: any,
  user: any,
  course: any
) => {
  try {
    const transporter = createTransporter();
    const templates = createCourseOrderEmailTemplates(
      courseOrder,
      user,
      course
    );

    // Get admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: "admin" },
      select: { email: true },
    });

    const adminEmails = adminUsers.map((admin) => admin.email).filter(Boolean);

    // Send to customer
    if (user.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
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

    console.log("Course order emails sent successfully");
  } catch (emailError) {
    console.error("Error sending course order emails:", emailError);
  }
};

// Generate unique access code
const generateAccessCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// POST create course order
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
      courseId,
      paymentMethod,
      paymentTransactionId,
      paymentMobile,
      customerPhone,
    } = body;

    // Validate required fields
    if (
      !courseId ||
      !paymentMethod ||
      !paymentTransactionId ||
      !paymentMobile ||
      !customerPhone
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

    // Verify course exists and is active
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        isActive: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          error: "Course not found or inactive",
        },
        { status: 404 }
      );
    }

    // Check if user already has an active order for this course
    const existingOrder = await prisma.courseOrder.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId,
        status: {
          in: ["PENDING", "CONFIRMED", "ACCESS_GRANTED"],
        },
      },
    });

    if (existingOrder) {
      return NextResponse.json(
        {
          success: false,
          error: "You already have an active enrollment for this course",
        },
        { status: 409 }
      );
    }

    // Generate unique access code
    let accessCode = generateAccessCode();
    let isUnique = false;

    // Ensure access code is unique
    while (!isUnique) {
      const existingOrder = await prisma.courseOrder.findFirst({
        where: { accessCode },
      });

      if (!existingOrder) {
        isUnique = true;
      } else {
        accessCode = generateAccessCode();
      }
    }

    // Create course order
    const courseOrder = await prisma.courseOrder.create({
      data: {
        userId: session.user.id,
        courseId,
        totalAmount: course.price,
        paymentMethod,
        paymentTransactionId,
        paymentMobile,
        customerEmail: session.user.email,
        customerPhone,
        accessCode,
      },
      include: {
        course: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    // Send emails (don't await to avoid blocking response)
    sendCourseOrderEmails(courseOrder, session.user, course).catch(
      console.error
    );

    return NextResponse.json(
      {
        success: true,
        message: "Course enrollment successful",
        data: courseOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

// GET course orders
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
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    let where: any = {};

    // Regular users can only see their own orders
    if (session.user.role === "user") {
      where.userId = session.user.id;
    }

    // Admin can see all orders and apply filters
    if (session.user.role === "admin") {
      if (status && status !== "all") {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
          { course: { title: { contains: search, mode: "insensitive" } } },
          { paymentTransactionId: { contains: search, mode: "insensitive" } },
          { customerPhone: { contains: search, mode: "insensitive" } },
        ];
      }
    }

    const [courseOrders, totalCount] = await Promise.all([
      prisma.courseOrder.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              image: true,
              price: true,
              videoUrl: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.courseOrder.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: courseOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        status,
        search,
      },
    });
  } catch (error) {
    console.error("Error fetching course orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course orders",
      },
      { status: 500 }
    );
  }
}
