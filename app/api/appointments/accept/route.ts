import { auth } from "@/lib/auth";
import { createTransporter } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// Email templates for appointment confirmation
const createConfirmationEmailTemplates = (appointment: any) => {
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

  // Patient/User Confirmation Email
  const patientEmail = {
    subject: `Appointment Confirmed - Serial #${appointment.serial}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Appointment Confirmed! ✅</h2>
        <p>Dear ${appointment.patientName},</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #1e293b; margin-top: 0;">Your Appointment is Confirmed</h3>
          <p><strong>Serial Number:</strong> ${appointment.serial}</p>
          <p><strong>Doctor:</strong> Dr. ${appointment.doctorName}</p>
         <p><strong>Appointment Place:</strong> ${
           appointment.appointmentType
         }</p>

          <p><strong>Date & Time:</strong> ${formattedDate}</p>
          <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">CONFIRMED</span></p>
        </div>

        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1e293b; margin-top: 0;">Appointment Details:</h4>
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
          <h4 style="color: #d97706; margin-top: 0;">Important Instructions:</h4>
          <ul style="color: #92400e;">
            <li>Please arrive 15 minutes before your scheduled appointment time</li>
            <li>Bring any previous medical reports or prescriptions</li>
            <li>Carry a valid ID proof for verification</li>
            <li>If you need to reschedule, please contact us 24 hours in advance</li>
          </ul>
        </div>

        <p style="color: #64748b;">
          We look forward to serving you. For any queries, please contact our reception.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 14px;">
          This is an automated confirmation. Please do not reply to this email.
        </p>
      </div>
    `,
  };

  // Doctor Notification Email
  const doctorEmail = {
    subject: `Appointment Confirmed - ${appointment.patientName} - Serial #${appointment.serial}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Confirmed</h2>
        <p>Dear Dr. ${appointment.doctorName},</p>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <h3 style="color: #1e293b; margin-top: 0;">Appointment Confirmed</h3>
          <p><strong>Serial Number:</strong> ${appointment.serial}</p>
          <p><strong>Patient Name:</strong> ${appointment.patientName}</p>
            <p><strong>Appointment Place:</strong> ${
              appointment.appointmentType
            }</p>
          <p><strong>Appointment Date:</strong> ${formattedDate}</p>
          <p><strong>Status:</strong> <span style="color: #2563eb; font-weight: bold;">CONFIRMED</span></p>
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
          The appointment has been confirmed and is now scheduled in your calendar.
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
    subject: `Appointment Confirmed - ${appointment.patientName} - Serial #${appointment.serial}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Appointment Status Updated</h2>
        
        <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
          <h3 style="color: #1e293b; margin-top: 0;">Appointment Confirmed</h3>
          <p><strong>Serial Number:</strong> ${appointment.serial}</p>
          <p><strong>Patient:</strong> ${appointment.patientName}</p>
          <p><strong>Doctor:</strong> Dr. ${appointment.doctorName}</p>
           <p><strong>Appointment Place:</strong> ${appointment.appointmentType}</p>
          <p><strong>Date & Time:</strong> ${formattedDate}</p>
          <p><strong>Status:</strong> <span style="color: #7c3aed; font-weight: bold;">CONFIRMED</span></p>
        </div>

        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1e293b; margin-top: 0;">Contact Information:</h4>
          <p><strong>Patient Mobile:</strong> ${appointment.mobile}</p>
          <p><strong>Patient Email:</strong> ${appointment.email}</p>
          <p><strong>Confirmed By:</strong> System</p>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 14px;">
          System generated notification.
        </p>
      </div>
    `,
  };

  return { patientEmail, doctorEmail, adminEmail };
};

// Function to send confirmation emails
const sendConfirmationEmails = async (appointment: any) => {
  try {
    const transporter = createTransporter();
    const templates = createConfirmationEmailTemplates(appointment);

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
      console.log(`Confirmation email sent to patient: ${appointment.email}`);
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
        console.log(`Confirmation email sent to doctor: ${doctor.email}`);
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
        `Confirmation email sent to ${adminEmails.length} admin users`
      );
    }

    console.log("All confirmation emails sent successfully");
  } catch (emailError) {
    console.error("Error sending confirmation emails:", emailError);
    // Don't throw error - appointment should still be confirmed even if emails fail
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

    // Update appointment status to CONFIRMED
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "CONFIRMED" },
      include: {
        doctor: true,
      },
    });

    // Send confirmation emails asynchronously (don't await to avoid blocking response)
    sendConfirmationEmails(appointment).catch(console.error);

    return NextResponse.json({ success: true, appointment }, { status: 200 });
  } catch (error) {
    console.error("Error accepting appointment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
