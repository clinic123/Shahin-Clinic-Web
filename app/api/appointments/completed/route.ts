import { auth } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

import { createTransporter } from "@/lib/email";

// Email template for appointment completion (only to user)
const createCompletionEmailTemplate = (
  appointment: any,
  completedBy: string
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

  const completionTime = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Patient/User Completion Email
  return {
    subject: `Appointment Completed - Serial #${appointment.serial}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Appointment Successfully Completed! 🎉</h2>
        <p>Dear ${appointment.patientName},</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #1e293b; margin-top: 0;">Your Appointment is Complete</h3>
          <p><strong>Serial Number:</strong> ${appointment.serial}</p>
          <p><strong>Doctor:</strong> Dr. ${appointment.doctorName}</p>
          <p><strong>Appointment Place:</strong> ${
            appointment.appointmentsType
          }</p>
          <p><strong>Appointment Date:</strong> ${formattedDate}</p>
          <p><strong>Completed On:</strong> ${completionTime}</p>
          <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">COMPLETED</span></p>
          <p><strong>Marked Complete By:</strong> ${completedBy}</p>
        </div>

        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1e293b; margin-top: 0;">Appointment Summary:</h4>
          <p><strong>Patient:</strong> ${appointment.patientName} (${
      appointment.patientAge
    } years, ${appointment.patientGender})</p>
          <p><strong>Mobile:</strong> ${appointment.mobile}</p>
          ${
            appointment.symptoms
              ? `<p><strong>Reported Symptoms:</strong> ${appointment.symptoms}</p>`
              : ""
          }
        </div>

        <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #d97706; margin-top: 0;">Follow-up Instructions:</h4>
          <ul style="color: #92400e;">
            <li>Follow any prescribed medications as directed by your doctor</li>
            <li>Schedule a follow-up appointment if recommended</li>
            <li>Contact the clinic if you have any concerns or questions</li>
            <li>Keep your medical records for future reference</li>
          </ul>
        </div>

        <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1e40af; margin-top: 0;">Feedback Request</h4>
          <p style="color: #374151;">
            We value your feedback! Please take a moment to share your experience with our services.
          </p>
        </div>

        <p style="color: #64748b;">
          Thank you for choosing our healthcare services. We hope you are satisfied with your visit.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 14px;">
          This is an automated completion notification. Please do not reply to this email.
        </p>
      </div>
    `,
  };
};

// Function to send completion email only to user
const sendCompletionEmail = async (appointment: any, completedBy: string) => {
  try {
    const transporter = createTransporter();
    const template = createCompletionEmailTemplate(appointment, completedBy);

    // Send only to patient/user
    if (appointment.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: appointment.email,
        subject: template.subject,
        html: template.html,
      });
      console.log(`Completion email sent to patient: ${appointment.email}`);
    } else {
      console.log("No email found for patient, skipping email notification");
    }
  } catch (emailError) {
    console.error("Error sending completion email:", emailError);
    // Don't throw error - appointment should still be completed even if email fails
  }
};

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "user") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { appointmentId } = await req.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // First, get the current appointment to check if it exists and get details
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: true,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Update appointment status to COMPLETED
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "COMPLETED" },
      include: {
        doctor: true,
      },
    });

    // Determine who completed the appointment
    const completedBy =
      session.user.role === "admin"
        ? "Administrator"
        : `Dr. ${session.user.name}`;

    // Send completion email only to user asynchronously
    sendCompletionEmail(appointment, completedBy).catch(console.error);

    // Revalidate cache
    revalidateTag(`appointment-${appointmentId}`);
    revalidateTag("appointments");

    return NextResponse.json(
      {
        success: true,
        appointment,
        message:
          "Appointment completed successfully. Notification email has been sent to the patient.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error completing appointment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
