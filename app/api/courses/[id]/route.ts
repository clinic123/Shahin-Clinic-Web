import { auth } from "@/lib/auth";
import { createTransporter } from "@/lib/email";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const revalidateCourses = () => {
  revalidateTag("courses");
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/admin/courses");
};

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
            <p><strong>Access Code:</strong> <code style="background: #1e293b; color: white; padding: 5px 10px; border-radius: 4px; font-size: 18px;">${
              courseOrder.accessCode
            }</code></p>
            ${
              course.videoUrl
                ? `
            <p><strong>Video Link:</strong> <a href="${course.videoUrl}" style="color: #2563eb;">Click here to access your course</a></p>
            `
                : ""
            }
          </div>

          <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #d97706; margin-top: 0;">How to Access:</h4>
            <ol style="color: #64748b;">
              <li>Use the access code above to unlock the course content</li>
              ${
                course.videoUrl
                  ? `<li>Click on the video link provided</li>`
                  : ""
              }
              <li>If you face any issues, contact our support team</li>
            </ol>
          </div>

          <p style="color: #64748b;">
            Happy learning! We hope you enjoy the course.
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();

    const {
      isActive,
      videoUrl,
      title,
      image,
      price,
      category,
      shortDescription,
      description,
    } = body;

    // Find the course order
    const courseOrder = await prisma.course.findUnique({
      where: { id: id },
    });

    if (!courseOrder) {
      return NextResponse.json(
        { error: "Course order not found" },
        { status: 404 }
      );
    }

    // Update course order
    const updatedCourseOrder = await prisma.course.update({
      where: { id },
      data: {
        isActive,
        videoUrl,
        title,
        image,
        price,
        category,
        shortDescription,
        description,
      },
    });

    revalidateCourses();
    return NextResponse.json({ courseOrder: updatedCourseOrder });
  } catch (error) {
    console.error("Error updating course order:", error);
    return NextResponse.json(
      { error: "Failed to update course order" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const book = await prisma.course.findUnique({
      where: {
        id: id,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        price: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        videoUrl: true,
        shortDescription: true,
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
    console.error("Error updating course order:", error);
    return NextResponse.json(
      { error: "Failed to update course order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await prisma.course.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    revalidateCourses();

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
