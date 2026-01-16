import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Email templates for appointment cancellation
const createCancellationEmailTemplates = async (
  appointment: any,
  reason: string = "",
  cancelledBy: string
) => {
  const { getServerSession } = await import("@/lib/get-session");
  const { cookies } = await import("next/headers");

  const cookieHeader = (await cookies()).toString();
  const session = await getServerSession();

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

  // Patient/User Cancellation Email
  const patientEmail = {
    subject: `Appointment Cancelled - Serial #${appointment.serial}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Appointment Cancelled</h2>
        <p>Dear ${appointment.patientName},</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="color: #1e293b; margin-top: 0;">Your Appointment Has Been Cancelled</h3>
          <p><strong>Serial Number:</strong> ${appointment.serial}</p>
          <p><strong>Doctor:</strong> Dr. ${appointment.doctorName}</p>
          <p><strong>Appointment Place:</strong> ${
            appointment.appointmentsType
          }</p>
          <p><strong>Original Date & Time:</strong> ${formattedDate}</p>
          <p><strong>Status:</strong> <span style="color: #ef4444; font-weight: bold;">CANCELLED</span></p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          <p><strong>Cancelled By:</strong> ${cancelledBy}</p>
        </div>

        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1e293b; margin-top: 0;">Original Appointment Details:</h4>
          <p><strong>Patient:</strong> ${appointment.patientName} (${
      appointment.patientAge
    } years, ${appointment.patientGender})</p>
          <p><strong>Mobile:</strong> ${appointment.mobile}</p>
          ${
            appointment.symptoms
              ? `<p><strong>Symptoms:</strong> ${appointment.symptoms}</p>`
              : ""
          }
        </div>

        <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #d97706; margin-top: 0;">Next Steps:</h4>
          <ul style="color: #92400e;">
            <li>If this was cancelled in error, please contact our reception immediately</li>
            <li>To reschedule, please book a new appointment through our portal</li>
            <li>For refund inquiries, please contact our billing department</li>
            <li>We apologize for any inconvenience caused</li>
          </ul>
        </div>

        ${
          appointment.amountPaid > 0
            ? `
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #92400e; margin-top: 0;">Payment Information:</h4>
          <p><strong>Amount Paid:</strong> ৳${appointment.amountPaid}</p>
          <p><strong>Payment Method:</strong> ${appointment.paymentMethod}</p>
          <p><strong>Transaction ID:</strong> ${appointment.paymentTransactionId}</p>
          <p><em>Refund will be processed as per our cancellation policy</em></p>
        </div>
        `
            : ""
        }

        <p style="color: #64748b;">
          Thank you for your understanding. We hope to serve you better in the future.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 14px;">
          This is an automated cancellation notice. Please do not reply to this email.
        </p>
      </div>
    `,
  };

  // Doctor Notification Email
  const doctorEmail = {
    subject: `Appointment Cancelled - ${appointment.patientName} - Serial #${appointment.serial}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Appointment Cancelled</h2>
        <p>Dear Dr. ${appointment.doctorName},</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="color: #1e293b; margin-top: 0;">Appointment Cancelled</h3>
          <p><strong>Serial Number:</strong> ${appointment.serial}</p>
          <p><strong>Patient Name:</strong> ${appointment.patientName}</p>
          <p><strong>Appointment Place:</strong> ${
            appointment.appointmentsType
          }</p>
          <p><strong>Original Appointment Date:</strong> ${formattedDate}</p>
          <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">CANCELLED</span></p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          <p><strong>Cancelled By:</strong> ${cancelledBy}</p>
        </div>

        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1e293b; margin-top: 0;">Patient Details:</h4>
          <p><strong>Age & Gender:</strong> ${appointment.patientAge} years, ${
      appointment.patientGender
    }</p>
          <p><strong>Mobile:</strong> ${appointment.mobile}</p>
          <p><strong>Email:</strong> ${appointment.email}</p>
          ${
            appointment.symptoms
              ? `<p><strong>Symptoms:</strong> ${appointment.symptoms}</p>`
              : ""
          }
        </div>

        <p style="color: #64748b;">
          This appointment slot is now available for other patients.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 14px;">
          This is an automated notification.
        </p>
      </div>
    `,
  };

  // Admin Notification Email
  const adminEmail = {
    subject: `Appointment Cancelled - ${appointment.patientName} - Serial #${appointment.serial}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Appointment Cancellation Alert</h2>
        
        <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
          <h3 style="color: #1e293b; margin-top: 0;">Appointment Cancelled</h3>
          <p><strong>Serial Number:</strong> ${appointment.serial}</p>
          <p><strong>Patient:</strong> ${appointment.patientName}</p>
          <p><strong>Doctor:</strong> Dr. ${appointment.doctorName}</p>
        <p><strong>Appointment Place:</strong> ${
          appointment.appointmentsType
        }</p>
          <p><strong>Original Date:</strong> ${formattedDate}</p>
          <p><strong>Status:</strong> <span style="color: #7c3aed; font-weight: bold;">CANCELLED</span></p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          <p><strong>Cancelled By:</strong> ${cancelledBy} (${
      session?.user.role
    })</p>
        </div>

        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1e293b; margin-top: 0;">Contact Information:</h4>
          <p><strong>Patient Mobile:</strong> ${appointment.mobile}</p>
          <p><strong>Patient Email:</strong> ${appointment.email}</p>
        </div>

        ${
          appointment.amountPaid > 0
            ? `
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #92400e; margin-top: 0;">Payment Details:</h4>
          <p><strong>Amount Paid:</strong> ৳${appointment.amountPaid}</p>
          <p><strong>Payment Method:</strong> ${appointment.paymentMethod}</p>
          <p><strong>Transaction ID:</strong> ${appointment.paymentTransactionId}</p>
          <p><em>Refund may be required as per cancellation policy</em></p>
        </div>
        `
            : ""
        }

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 14px;">
          System generated cancellation alert.
        </p>
      </div>
    `,
  };

  return { patientEmail, doctorEmail, adminEmail };
};

// Function to send cancellation emails
const sendCancellationEmails = async (
  appointment: any,
  reason: string,
  cancelledBy: string
) => {
  try {
    const transporter = createTransporter();
    const templates = await createCancellationEmailTemplates(
      appointment,
      reason,
      cancelledBy
    );

    // Get admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: "admin" },
      select: { email: true },
    });

    const adminEmails = adminUsers.map((admin) => admin.email).filter(Boolean);

    // Send to patient/user
    if (appointment.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: appointment.email,
        subject: templates.patientEmail.subject,
        html: templates.patientEmail.html,
      });
      console.log(`Cancellation email sent to patient: ${appointment.email}`);
    }

    // Send to doctor (if doctor has email and exists)
    if (appointment.doctorId) {
      const doctor = await prisma.doctor.findUnique({
        where: { id: appointment.doctorId },
        select: { email: true, name: true },
      });

      if (doctor?.email) {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: doctor.email,
          subject: templates.doctorEmail.subject,
          html: templates.doctorEmail.html,
        });
        console.log(`Cancellation email sent to doctor: ${doctor.email}`);
      }
    }

    // Send to all admin users
    if (adminEmails.length > 0) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: adminEmails,
        subject: templates.adminEmail.subject,
        html: templates.adminEmail.html,
      });
      console.log(
        `Cancellation email sent to ${adminEmails.length} admin users`
      );
    }

    console.log("All cancellation emails sent successfully");
  } catch (emailError) {
    console.error("Error sending cancellation emails:", emailError);
    // Don't throw error - appointment should still be cancelled even if emails fail
  }
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or doctor
    if (session.user.role === "user") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { appointmentId, reason } = await req.json();

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

    // Update appointment status to CANCELLED
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CANCELLED",
        // Store rejection reason if provided
        ...(reason && { rejectionReason: reason }),
      },
      include: {
        doctor: true,
      },
    });

    // Determine who cancelled the appointment
    const cancelledBy =
      session.user.role === "admin"
        ? "Administrator"
        : `Dr. ${session.user.name}`;

    // Send cancellation emails asynchronously
    sendCancellationEmails(appointment, reason || "", cancelledBy).catch(
      console.error
    );

    // Revalidate cache
    revalidateTag(`appointment-${appointmentId}`);
    revalidateTag("appointments");

    return NextResponse.json(
      {
        success: true,
        appointment,
        message:
          "Appointment cancelled successfully. Notification emails have been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting appointment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
