import { auth } from "@/lib/auth";
import { createTransporter } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// GET single course order (Admin only)
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
        {
          success: false,
          error: "Unauthorized: Admin access required",
        },
        { status: 401 }
      );
    }

    const { id: courseOrderId } = await params;

    const courseOrder = await prisma.courseOrder.findUnique({
      where: { id: courseOrderId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            shortDescription: true,
            image: true,
            price: true,
            videoUrl: true,
            category: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            createdAt: true,
          },
        },
      },
    });

    if (!courseOrder) {
      return NextResponse.json(
        {
          success: false,
          error: "Course order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: courseOrder,
    });
  } catch (error) {
    console.error("Error fetching course order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course order",
      },
      { status: 500 }
    );
  }
}

// PATCH update course order (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Admin access required",
        },
        { status: 401 }
      );
    }

    const { id: courseOrderId } = await params;
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
      status,
      accessGranted,
      paymentTransactionId,
      paymentMobile,
      customerEmail,
      customerPhone,
      sendEmail = true,
      videoLink,
    } = body;

    // Find the current course order
    const currentOrder = await prisma.courseOrder.findUnique({
      where: { id: courseOrderId },
      include: {
        course: true,
        user: true,
      },
    });

    if (!currentOrder) {
      return NextResponse.json(
        {
          success: false,
          error: "Course order not found",
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (status) {
      updateData.status = status;
      if (status === "ACCESS_GRANTED") {
        updateData.accessGranted = true;
      }
    }

    if (typeof accessGranted === "boolean") {
      updateData.accessGranted = accessGranted;
      if (accessGranted) {
        updateData.status = "ACCESS_GRANTED";
      }
    }

    if (paymentTransactionId)
      updateData.paymentTransactionId = paymentTransactionId;
    if (paymentMobile) updateData.paymentMobile = paymentMobile;
    if (customerEmail) updateData.customerEmail = customerEmail;
    if (customerPhone) updateData.customerPhone = customerPhone;

    if (status === "ACCESS_GRANTED") {
      updateData.videoLink = videoLink;
    }

    // Update course order
    const updatedCourseOrder = await prisma.courseOrder.update({
      where: { id: courseOrderId },
      data: updateData,
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

    // Send email notifications if requested
    if (sendEmail) {
      // Send access granted email
      if (
        status === "ACCESS_GRANTED" ||
        (accessGranted && !currentOrder.accessGranted)
      ) {
        await sendCourseAccessEmail(
          updatedCourseOrder,
          updatedCourseOrder.course,
          updatedCourseOrder.user
        );
      }

      // Send status update email
      if (status && status !== currentOrder.status) {
        await sendStatusUpdateEmail(
          updatedCourseOrder,
          updatedCourseOrder.course,
          updatedCourseOrder.user,
          currentOrder.status
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Course order updated successfully",
      data: updatedCourseOrder,
    });
  } catch (error) {
    console.error("Error updating course order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update course order",
      },
      { status: 500 }
    );
  }
}

// DELETE course order (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Admin access required",
        },
        { status: 401 }
      );
    }

    const { id: courseOrderId } = await params;

    // Check if order exists
    const courseOrder = await prisma.courseOrder.findUnique({
      where: { id: courseOrderId },
    });

    if (!courseOrder) {
      return NextResponse.json(
        {
          success: false,
          error: "Course order not found",
        },
        { status: 404 }
      );
    }

    // Delete the course order
    await prisma.courseOrder.delete({
      where: { id: courseOrderId },
    });

    return NextResponse.json({
      success: true,
      message: "Course order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete course order",
      },
      { status: 500 }
    );
  }
}

// Email functions
const sendCourseAccessEmail = async (
  courseOrder: any,
  course: any,
  user: any
) => {
  try {
    const transporter = createTransporter();

    const emailContent = {
      subject: `Course Access Granted - ${course.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Course Access Granted!</h2>
          <p>Dear ${user.name},</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Your Course Access Details:</h3>
            <p><strong>Course:</strong> ${course.title}</p>
            <p><strong>Access Code:</strong> <code style="background: #1e293b; color: white; padding: 8px 12px; border-radius: 4px; font-size: 18px; font-weight: bold; letter-spacing: 2px;">${
              courseOrder.accessCode
            }</code></p>
            ${
              course.videoUrl
                ? `
            <p><strong>Video Link:</strong> <a href="${course.videoUrl}" style="color: #2563eb; text-decoration: underline;">Click here to access your course</a></p>
            `
                : ""
            }
          </div>

          <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #d97706; margin-top: 0;">How to Access Your Course:</h4>
            <ol style="color: #64748b; line-height: 1.6;">
              <li>Save your access code: <strong>${
                courseOrder.accessCode
              }</strong></li>
              ${
                course.videoUrl
                  ? `<li>Click on the video link above to start learning</li>`
                  : ""
              }
              <li>Use the access code if prompted when accessing course materials</li>
              <li>If you face any issues, contact our support team with your access code</li>
            </ol>
          </div>

          <p style="color: #64748b;">
            Happy learning! We hope you enjoy the course and gain valuable knowledge.
          </p>
        </div>
      `,
    };

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });
  } catch (emailError) {
    console.error("Error sending course access email:", emailError);
  }
};

const sendStatusUpdateEmail = async (
  courseOrder: any,
  course: any,
  user: any,
  previousStatus: string
) => {
  try {
    const transporter = createTransporter();

    const statusMessages: { [key: string]: string } = {
      CONFIRMED:
        "Your payment has been verified and your enrollment is confirmed.",
      ACCESS_GRANTED:
        "Course access has been granted. Check your email for access details.",
      CANCELLED: "Your course enrollment has been cancelled.",
      COMPLETED: "Your course has been marked as completed.",
    };

    const emailContent = {
      subject: `Course Order Status Update - ${course.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Course Order Status Updated</h2>
          <p>Dear ${user.name},</p>
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Order Update:</h3>
            <p><strong>Course:</strong> ${course.title}</p>
            <p><strong>Previous Status:</strong> ${previousStatus}</p>
            <p><strong>New Status:</strong> ${courseOrder.status}</p>
            <p><strong>Message:</strong> ${
              statusMessages[courseOrder.status] ||
              "Your order status has been updated."
            }</p>
          </div>

          ${
            courseOrder.status === "ACCESS_GRANTED"
              ? `
          <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Access Code:</strong> <code style="background: #1e293b; color: white; padding: 8px 12px; border-radius: 4px; font-size: 16px; font-weight: bold;">${
              courseOrder.accessCode
            }</code></p>
            ${
              course.videoUrl
                ? `<p><strong>Video Link:</strong> <a href="${course.videoUrl}">${course.videoUrl}</a></p>`
                : ""
            }
          </div>
          `
              : ""
          }

          <p style="color: #64748b;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      `,
    };

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });
  } catch (emailError) {
    console.error("Error sending status update email:", emailError);
  }
};
