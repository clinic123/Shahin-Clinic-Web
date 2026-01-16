"use server";

import { auth } from "@/lib/auth";
import { createTransporter } from "@/lib/email";
import { PrismaClient } from "@/prisma/generated/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";

const prisma = new PrismaClient();

interface UpdateCourseOrderInput {
  status?: string;
  accessGranted?: boolean;
  paymentTransactionId?: string;
  paymentMobile?: string;
  customerEmail?: string;
  customerPhone?: string;
  videoLink?: string;
  sendEmail?: boolean;
}

// Helper function to send course access email
async function sendCourseAccessEmail(
  order: any,
  course: any,
  user: any
) {
  try {
    const transporter = createTransporter();
    if (!transporter) return;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@example.com",
      to: user.email,
      subject: `Course Access Granted - ${course.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Course Access Granted</h2>
          <p>Dear ${user.name},</p>
          <p>Your access to the course <strong>${course.title}</strong> has been granted.</p>
          ${order.videoLink ? `<p>Course Video Link: <a href="${order.videoLink}">${order.videoLink}</a></p>` : ""}
          ${order.accessCode ? `<p>Access Code: <strong>${order.accessCode}</strong></p>` : ""}
          <p>Thank you for your purchase!</p>
          <p>Best regards,<br>Admin Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending course access email:", error);
  }
}

// Helper function to send status update email
async function sendStatusUpdateEmail(
  order: any,
  course: any,
  user: any,
  oldStatus: string
) {
  try {
    const transporter = createTransporter();
    if (!transporter) return;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@example.com",
      to: user.email,
      subject: `Course Order Status Updated - ${course.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Order Status Updated</h2>
          <p>Dear ${user.name},</p>
          <p>Your course order status for <strong>${course.title}</strong> has been updated.</p>
          <p>Previous Status: ${oldStatus}</p>
          <p>New Status: ${order.status}</p>
          <p>Thank you!</p>
          <p>Best regards,<br>Admin Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending status update email:", error);
  }
}

export async function updateCourseOrder(
  orderId: string,
  input: UpdateCourseOrderInput
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized - Admin access required",
        status: 401,
      };
    }

    // Find the current course order
    const currentOrder = await prisma.courseOrder.findUnique({
      where: { id: orderId },
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

    if (!currentOrder) {
      return {
        success: false,
        error: "Course order not found",
        status: 404,
      };
    }

    // Prepare update data
    const updateData: any = {};

    if (input.status) {
      updateData.status = input.status;
      if (input.status === "ACCESS_GRANTED") {
        updateData.accessGranted = true;
      }
    }

    if (typeof input.accessGranted === "boolean") {
      updateData.accessGranted = input.accessGranted;
      if (input.accessGranted) {
        updateData.status = "ACCESS_GRANTED";
      }
    }

    if (input.paymentTransactionId !== undefined)
      updateData.paymentTransactionId = input.paymentTransactionId;
    if (input.paymentMobile !== undefined)
      updateData.paymentMobile = input.paymentMobile;
    if (input.customerEmail !== undefined)
      updateData.customerEmail = input.customerEmail;
    if (input.customerPhone !== undefined)
      updateData.customerPhone = input.customerPhone;

    if (input.videoLink !== undefined) {
      updateData.videoLink = input.videoLink;
      if (input.videoLink && input.videoLink.trim() !== "") {
        updateData.accessGranted = true;
        updateData.status = "ACCESS_GRANTED";
        
        // Also update the course video URL
        await prisma.course.update({
          where: { id: currentOrder.courseId },
          data: { videoUrl: input.videoLink },
        });
      }
    }

    // Update course order
    const updatedCourseOrder = await prisma.courseOrder.update({
      where: { id: orderId },
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
    const shouldSendEmail = input.sendEmail !== false;
    if (shouldSendEmail) {
      // Send access granted email
      if (
        input.status === "ACCESS_GRANTED" ||
        (input.accessGranted && !currentOrder.accessGranted)
      ) {
        await sendCourseAccessEmail(
          updatedCourseOrder,
          updatedCourseOrder.course,
          updatedCourseOrder.user
        );
      }

      // Send status update email
      if (input.status && input.status !== currentOrder.status) {
        await sendStatusUpdateEmail(
          updatedCourseOrder,
          updatedCourseOrder.course,
          updatedCourseOrder.user,
          currentOrder.status
        );
      }
    }

    // Revalidate
    revalidateTag("course-orders");
    revalidateTag(`course-order-${orderId}`);
    revalidatePath("/admin/course-orders");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: updatedCourseOrder,
      message: "Course order updated successfully",
    };
  } catch (error) {
    console.error("Error updating course order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update course order",
      status: 500,
    };
  }
}

export async function bulkUpdateCourseOrders(
  orderIds: string[],
  status: string,
  sendEmail: boolean = true
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized - Admin access required",
        status: 401,
      };
    }

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return {
        success: false,
        error: "Order IDs are required",
        status: 400,
      };
    }

    if (!status) {
      return {
        success: false,
        error: "Status is required",
        status: 400,
      };
    }

    // Update orders
    const updateData: any = {
      status,
    };

    if (status === "ACCESS_GRANTED") {
      updateData.accessGranted = true;
    }

    const updatedOrders = await prisma.courseOrder.updateMany({
      where: {
        id: { in: orderIds },
      },
      data: updateData,
    });

    // Send emails if requested
    if (sendEmail && status === "ACCESS_GRANTED") {
      const ordersWithDetails = await prisma.courseOrder.findMany({
        where: {
          id: { in: orderIds },
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

      for (const order of ordersWithDetails) {
        await sendCourseAccessEmail(order, order.course, order.user);
      }
    }

    // Revalidate
    revalidateTag("course-orders");
    revalidatePath("/admin/course-orders");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: updatedOrders,
      message: `Successfully updated ${updatedOrders.count} orders`,
    };
  } catch (error) {
    console.error("Error bulk updating course orders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update course orders",
      status: 500,
    };
  }
}

