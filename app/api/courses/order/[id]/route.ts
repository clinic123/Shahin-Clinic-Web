import { auth } from "@/lib/auth";
import { createTransporter } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

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

          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin-top: 0;">Need Help?</h4>
            <p style="color: #64748b; margin: 0;">
              If you have any questions or need assistance, please reply to this email or contact our support team.
            </p>
          </div>

          <p style="color: #64748b;">
            Happy learning! We hope you enjoy the course and gain valuable knowledge.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #94a3b8; font-size: 14px;">
            This is an automated email. Please do not reply to this email.
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

    console.log("Course access email sent successfully");
  } catch (emailError) {
    console.error("Error sending course access email:", emailError);
  }
};

// GET single course order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id: courseOrderId } = await params;

    const courseOrder = await prisma.courseOrder.findUnique({
      where: { id: courseOrderId },
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

    if (!courseOrder) {
      return NextResponse.json(
        {
          success: false,
          error: "Course order not found",
        },
        { status: 404 }
      );
    }

    // Check if user has permission to view this order
    if (
      session.user.role === "user" &&
      courseOrder.userId !== session.user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied",
        },
        { status: 403 }
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

// PATCH update course order (admin only for status updates)
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

    const { status, videoUrl } = body;

    // Find the course order
    const courseOrder = await prisma.courseOrder.findUnique({
      where: { id: courseOrderId },
      include: {
        course: true,
        user: true,
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

    // Update data
    const updateData: any = {};

    if (status) {
      updateData.status = status;
      if (status === "ACCESS_GRANTED") {
        updateData.accessGranted = true;
      }
    }

    if (videoUrl) {
      updateData.accessGranted = true;
      updateData.status = "ACCESS_GRANTED";

      // Also update the course video URL
      await prisma.course.update({
        where: { id: courseOrder.courseId },
        data: { videoUrl },
      });
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

    // If access is granted or video URL is provided, send access email
    if (
      (status === "ACCESS_GRANTED" || videoUrl) &&
      updatedCourseOrder.accessGranted
    ) {
      sendCourseAccessEmail(
        updatedCourseOrder,
        updatedCourseOrder.course,
        updatedCourseOrder.user
      ).catch(console.error);
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
