"use server";

import { auth } from "@/lib/auth";
import { createTransporter } from "@/lib/email";
import { PrismaClient } from "@/prisma/generated/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";

const prisma = new PrismaClient();

interface CreateAppointmentInput {
  patientName: string;
  patientAge: number;
  patientGender: string;
  mobile: string;
  email?: string;
  appointmentDate: string;
  doctorName: string;
  paymentMobile: string;
  paymentTransactionId: string;
  paymentMethod: string;
  amountPaid: number;
  doctorId?: string;
  appointmentType: string;
  isScope?: boolean;
}

async function getNextAppointmentSerial(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const counterName = `appointment-${year}${month}`;

  try {
    const existingCounter = await prisma.counter.findUnique({
      where: { name: counterName },
    });

    let newValue: number;

    if (existingCounter) {
      newValue = existingCounter.value + 1;
      await prisma.counter.update({
        where: { name: counterName },
        data: { value: newValue },
      });
    } else {
      const created = await prisma.counter.create({
        data: { name: counterName, value: 1 },
      });
      newValue = created.value;
    }

    const serialNumber = newValue.toString().padStart(4, "0");
    return `${year}${month}${serialNumber}`;
  } catch (error) {
    console.error("Error getting serial:", error);
    const timestamp = Date.now().toString().slice(-6);
    return `${year}${month}${timestamp}`;
  }
}

const createEmailTemplates = (
  appointment: any,
  user: any,
  isScope: boolean = false
) => {
  const formattedDate = new Date(appointment.appointmentDate).toLocaleString(
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

  const patientEmail = {
    subject: isScope
      ? `Scope Appointment Confirmation - Serial #${appointment.serial}`
      : `Appointment Confirmation - Serial #${appointment.serial}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">${
          isScope ? "Scope Appointment" : "Appointment"
        } Confirmed!</h2>
        <p>Dear ${appointment.patientName},</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Appointment Details:</h3>
          <p><strong>Serial Number:</strong> ${appointment.serial}</p>
          <p><strong>Doctor:</strong> Dr. ${appointment.doctorName}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          ${
            isScope
              ? "<p><strong>Time:</strong> Will be assigned and confirmed via phone</p>"
              : ""
          }
          <p><strong>Patient:</strong> ${appointment.patientName} (${
      appointment.patientAge
    } years, ${appointment.patientGender})</p>
          <p><strong>Mobile:</strong> ${appointment.mobile}</p>
        </div>

        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #166534; margin-top: 0;">Payment Details:</h4>
          <p><strong>Amount Paid:</strong> ৳${appointment.amountPaid} BDT</p>
          <p><strong>Payment Method:</strong> ${appointment.paymentMethod}</p>
          <p><strong>Transaction ID:</strong> ${
            appointment.paymentTransactionId
          }</p>
        </div>

        <p style="color: #64748b;">
          ${
            isScope
              ? "Our team will contact you soon to confirm the timing and provide preparation instructions."
              : "Please arrive 15 minutes before your scheduled appointment time."
          }
        </p>
      </div>
    `,
  };

  return { patientEmail };
};

const sendAppointmentEmails = async (
  appointment: any,
  user: any,
  isScope: boolean = false
) => {
  try {
    const transporter = createTransporter();
    const templates = createEmailTemplates(appointment, user, isScope);

    if (appointment.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: appointment.email,
        subject: templates.patientEmail.subject,
        html: templates.patientEmail.html,
      });
    }

    console.log("Appointment confirmation emails sent successfully");
  } catch (emailError) {
    console.error("Error sending appointment emails:", emailError);
  }
};

export async function createAppointment(input: CreateAppointmentInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "Unauthorized",
        status: 401,
      };
    }

    // Validate required fields
    if (
      !input.patientName ||
      !input.patientAge ||
      !input.patientGender ||
      !input.mobile ||
      !input.appointmentDate ||
      !input.doctorName ||
      !input.paymentMobile ||
      !input.paymentTransactionId ||
      !input.paymentMethod ||
      !input.appointmentType
    ) {
      return {
        success: false,
        error: "Missing required fields",
        status: 400,
      };
    }

    // Validate and parse appointment date
    let parsedDate: Date;
    if (typeof input.appointmentDate === "string") {
      parsedDate = new Date(input.appointmentDate);

      if (isNaN(parsedDate.getTime())) {
        const fixedDateString = input.appointmentDate.replace(
          /T(\d{1}):(\d{2})/,
          "T0$1:$2"
        );
        parsedDate = new Date(fixedDateString);

        if (isNaN(parsedDate.getTime())) {
          return {
            success: false,
            error: `Invalid appointment date format. Received: "${input.appointmentDate}". Please provide a valid date and time in ISO format (e.g., "2025-01-15T14:30:00").`,
            status: 400,
          };
        }
      }
    } else {
      return {
        success: false,
        error: "Appointment date must be a string.",
        status: 400,
      };
    }

    const serial = await getNextAppointmentSerial();
    const dayOfWeek = parsedDate.getDay();
    const isScope = input.isScope || false;

    // Only check for Friday/Saturday restrictions for non-scope appointments
    if (!isScope && (dayOfWeek === 5 || dayOfWeek === 6)) {
      return {
        success: false,
        error: "Appointments are not allowed on Friday and Saturday",
        status: 400,
      };
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientName: input.patientName,
        patientAge: input.patientAge,
        patientGender: input.patientGender,
        mobile: input.mobile,
        email: input.email || session.user.email,
        appointmentDate: parsedDate,
        doctorName: input.doctorName,
        paymentMobile: input.paymentMobile,
        paymentTransactionId: input.paymentTransactionId,
        userId: session.user.id,
        paymentMethod: input.paymentMethod as "BKASH" | "NAGAD" | "ROCKET",
        amountPaid: parseFloat(String(input.amountPaid)) ?? 0,
        doctorId: input.doctorId || null,
        serial: parseInt(serial),
        appointmentType: input.appointmentType as "IN_PERSON" | "VIRTUAL",
        isScope: isScope,
      },
      include: {
        doctor: true,
      },
    });

    // Send emails
    sendAppointmentEmails(appointment, session.user, isScope).catch(
      console.error
    );

    // Revalidate
    revalidateTag("appointments");
    revalidateTag(`appointment-${appointment.id}`);
    revalidatePath("/appointments");
    revalidatePath("/dashboard/appointments");
    revalidatePath("/admin/appointments");
    revalidatePath("/doctor/appointments");

    return {
      success: true,
      data: appointment,
      message: "Appointment created successfully",
    };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create appointment",
      status: 500,
    };
  }
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: string
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "doctor")
    ) {
      return {
        success: false,
        error: "Unauthorized",
        status: 401,
      };
    }

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: status as any },
      include: { user: true },
    });

    // Revalidate
    revalidateTag("appointments");
    revalidateTag(`appointment-${appointmentId}`);
    revalidatePath("/appointments");
    revalidatePath("/dashboard/appointments");
    revalidatePath("/admin/appointments");
    revalidatePath("/doctor/appointments");

    return {
      success: true,
      data: appointment,
      message: "Appointment status updated successfully",
    };
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update appointment status",
      status: 500,
    };
  }
}

export async function acceptAppointment(appointmentId: string) {
  return updateAppointmentStatus(appointmentId, "CONFIRMED");
}

export async function rejectAppointment(appointmentId: string) {
  return updateAppointmentStatus(appointmentId, "REJECTED");
}

export async function completeAppointment(appointmentId: string) {
  return updateAppointmentStatus(appointmentId, "COMPLETED");
}
