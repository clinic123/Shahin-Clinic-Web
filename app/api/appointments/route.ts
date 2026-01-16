import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/get-session";
import { Prisma } from "@/prisma/generated/prisma/client";

import { createTransporter } from "@/lib/email";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

  // Patient/User Email
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
          <p><strong>Department:</strong> ${appointment.department}</p>
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
          ${
            isScope
              ? "<p><strong>Appointment Type:</strong> Scope Procedure</p>"
              : ""
          }
        </div>

        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #166534; margin-top: 0;">Payment Details:</h4>
          <p><strong>Amount Paid:</strong> ৳${appointment.amountPaid} BDT</p>
          <p><strong>Payment Method:</strong> ${appointment.paymentMethod}</p>
          <p><strong>Transaction ID:</strong> ${
            appointment.paymentTransactionId
          }</p>
        </div>

        ${
          isScope
            ? `
        <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #92400e; margin-top: 0;">Important Note for Scope Procedure:</h4>
          <p style="color: #92400e;">
            This is a scope procedure appointment. Our team will contact you shortly to confirm the exact time 
            and provide pre-procedure instructions. Please keep your phone available.
          </p>
        </div>
        `
            : ""
        }

        <p style="color: #64748b;">
          ${
            isScope
              ? "Our team will contact you soon to confirm the timing and provide preparation instructions."
              : "Please arrive 15 minutes before your scheduled appointment time.<br>If you need to reschedule or cancel, please contact us at least 24 hours in advance."
          }
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 14px;">
          This is an automated confirmation. Please do not reply to this email.
        </p>
      </div>
    `,
  };

  // Doctor Email
  const doctorEmail = {
    subject: isScope
      ? `New Scope Appointment - ${appointment.patientName} - Serial #${appointment.serial}`
      : `New Appointment - ${appointment.patientName} - Serial #${appointment.serial}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">New ${
          isScope ? "Scope " : ""
        }Appointment Scheduled</h2>
        <p>Dear Dr. ${appointment.doctorName},</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Patient Details:</h3>
          <p><strong>Serial Number:</strong> ${appointment.serial}</p>
          <p><strong>Patient Name:</strong> ${appointment.patientName}</p>
          <p><strong>Age & Gender:</strong> ${appointment.patientAge} years, ${
      appointment.patientGender
    }</p>
          <p><strong>Mobile:</strong> ${appointment.mobile}</p>
          <p><strong>Email:</strong> ${appointment.email}</p>
          <p><strong>Appointment Date:</strong> ${formattedDate}</p>
          ${
            isScope
              ? '<p><strong>Appointment Type:</strong> <span style="color: #dc2626; font-weight: bold;">SCOPE PROCEDURE</span></p>'
              : ""
          }
        </div>

        ${
          isScope
            ? `
        <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #92400e; margin-top: 0;">Scope Procedure Note:</h4>
          <p style="color: #92400e;">
            This is a scope procedure. Please review the schedule and ensure proper preparation time is allocated.
          </p>
        </div>
        `
            : ""
        }

        <p style="color: #64748b;">
          Please review the patient details before the appointment.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 14px;">
          This is an automated notification.
        </p>
      </div>
    `,
  };

  // Admin Email - Different template for scope appointments
  const adminEmail = {
    subject: isScope
      ? `🚨 SCOPE APPOINTMENT - ${appointment.patientName} - Serial #${appointment.serial}`
      : `New Appointment Created - ${appointment.patientName} - Serial #${appointment.serial}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${isScope ? "#dc2626" : "#7c3aed"};">${
      isScope
        ? "🚨 SCOPE APPOINTMENT NOTIFICATION"
        : "New Appointment Notification"
    }</h2>
        <p><strong>Serial Number:</strong> ${appointment.serial}</p>
        
        <div style="background: ${
          isScope ? "#fef2f2" : "#faf5ff"
        }; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${
      isScope ? "#dc2626" : "#7c3aed"
    };">
          <h3 style="color: #1e293b; margin-top: 0;">Appointment Summary:</h3>
          <p><strong>Patient:</strong> ${appointment.patientName} (${
      appointment.patientAge
    } years, ${appointment.patientGender})</p>
          <p><strong>Doctor:</strong> Dr. ${appointment.doctorName}</p>
          <p><strong>Department:</strong> ${appointment.department}</p>
          <p><strong>Date & Time:</strong> ${formattedDate}</p>
          <p><strong>Contact:</strong> ${appointment.mobile} | ${
      appointment.email
    }</p>
          ${
            isScope
              ? '<p style="color: #dc2626; font-weight: bold;">⚠️ THIS IS A SCOPE PROCEDURE APPOINTMENT</p>'
              : ""
          }
        </div>

        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1e293b; margin-top: 0;">Payment Information:</h4>
          <p><strong>Amount:</strong> ৳${appointment.amountPaid}</p>
          <p><strong>Method:</strong> ${appointment.paymentMethod}</p>
          <p><strong>Transaction ID:</strong> ${
            appointment.paymentTransactionId
          }</p>
          <p><strong>Payment Mobile:</strong> ${appointment.paymentMobile}</p>
        </div>

        ${
          isScope
            ? `
        <div style="background: #fffbeb; padding: 15px; border-radius: 8px; border: 2px solid #f59e0b;">
          <h4 style="color: #92400e; margin-top: 0;">🔔 Scope Procedure Action Required:</h4>
          <p style="color: #92400e;">
            • Contact patient to confirm exact procedure time<br>
            • Provide pre-procedure instructions<br>
            • Ensure scope equipment availability<br>
            • Allocate sufficient time for the procedure
          </p>
        </div>
        `
            : ""
        }

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 14px;">
          System generated notification.
        </p>
      </div>
    `,
  };

  return { patientEmail, doctorEmail, adminEmail };
};

const sendAppointmentEmails = async (
  appointment: any,
  user: any,
  isScope: boolean = false
) => {
  try {
    const transporter = createTransporter();
    const templates = createEmailTemplates(appointment, user, isScope);

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
    }

    // Send to doctor (if doctor has email and exists)
    if (appointment.doctorId) {
      const doctor = await prisma.doctor.findUnique({
        where: { id: appointment.doctorId },
        select: { email: true },
      });

      if (doctor?.email) {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: doctor.email,
          subject: templates.doctorEmail.subject,
          html: templates.doctorEmail.html,
        });
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
    }

    console.log("Appointment confirmation emails sent successfully");
  } catch (emailError) {
    console.error("Error sending appointment emails:", emailError);
    // Don't throw error - appointment should still be created even if emails fail
  }
};

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
      // 2️⃣ Increment manually
      newValue = existingCounter.value + 1;
      await prisma.counter.update({
        where: { name: counterName },
        data: { value: newValue },
      });
    } else {
      // 3️⃣ Create new counter if not exists
      const created = await prisma.counter.create({
        data: { name: counterName, value: 1 },
      });
      newValue = created.value;
    }

    // 4️⃣ Build serial number
    const serialNumber = newValue.toString().padStart(4, "0");
    return `${year}${month}${serialNumber}`;
  } catch (error) {
    console.error("Error getting serial:", error);
    // fallback to timestamp
    const timestamp = Date.now().toString().slice(-6);
    return `${year}${month}${timestamp}`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    // Session is now optional - users can book appointments without login

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      patientName,
      patientAge,
      patientGender,
      mobile,
      email, // Email is now required in body when no session
      appointmentDate,
      doctorName,
      paymentMobile,
      paymentTransactionId,
      paymentMethod,
      amountPaid,
      doctorId,
      appointmentType,
      isScope, // New field for scope appointments
    } = body;

    // Validate required fields quickly before DB insert
    if (
      !patientName ||
      !patientAge ||
      !patientGender ||
      !mobile ||
      !email || // Email is now required
      !appointmentDate ||
      !doctorName ||
      !paymentMobile ||
      !paymentTransactionId ||
      !paymentMethod ||
      !appointmentType
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    // Validate and parse appointment date
    let parsedDate: Date;
    if (typeof appointmentDate === "string") {
      // Try to parse the date string
      parsedDate = new Date(appointmentDate);

      // Check if date is valid
      if (isNaN(parsedDate.getTime())) {
        // Try to fix common formatting issues
        // If time doesn't have leading zero for hours (e.g., "2025-11-23T1:00:00")
        const fixedDateString = appointmentDate.replace(
          /T(\d{1}):(\d{2})/,
          "T0$1:$2"
        );
        parsedDate = new Date(fixedDateString);

        // If still invalid, return error
        if (isNaN(parsedDate.getTime())) {
          return NextResponse.json(
            {
              error: `Invalid appointment date format. Received: "${appointmentDate}". Please provide a valid date and time in ISO format (e.g., "2025-01-15T14:30:00").`,
            },
            { status: 400 }
          );
        }
      }
    } else if (appointmentDate instanceof Date) {
      parsedDate = appointmentDate;
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid appointment date object provided." },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Appointment date must be a string or Date object." },
        { status: 400 }
      );
    }

    const serial = await getNextAppointmentSerial();
    const dayOfWeek = parsedDate.getDay();

    // Only check for Friday/Saturday restrictions for non-scope appointments
    if (!isScope && (dayOfWeek === 5 || dayOfWeek === 6)) {
      return NextResponse.json(
        { error: "Appointments are not allowed on Friday and Saturday" },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientName,
        patientAge,
        patientGender,
        mobile,
        email: email || session?.user?.email || "", // Use email from body or session
        appointmentDate: parsedDate,
        doctorName,
        paymentMobile,
        paymentTransactionId,
        userId: session?.user?.id || "", // Use empty string if no session (you may want to create a guest user)
        paymentMethod: paymentMethod,
        amountPaid: parseFloat(amountPaid) ?? 0,
        doctorId: doctorId || null,
        serial: parseInt(serial),
        appointmentType: appointmentType,
        isScope: isScope || false, // Store scope flag in database
      },
      include: {
        doctor: true,
      },
    });

    // Send emails with scope information (only if session exists)
    if (session?.user) {
      sendAppointmentEmails(appointment, session.user, isScope).catch(
        console.error
      );
    } else {
      // Send email to guest user
      // You may want to create a guest email sending function here
      console.log("Guest appointment created:", appointment);
    }

    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "newest";
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const doctorName = searchParams.get("doctorName");
    const department = searchParams.get("department");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page") || "1";

    let whereAppointment: Prisma.AppointmentWhereInput = {};

    // Build orderBy
    const orderBy = ((): Prisma.AppointmentOrderByWithRelationInput => {
      switch (sort) {
        case "patient_asc":
          return { patientName: "asc" };
        case "patient_desc":
          return { patientName: "desc" };
        case "doctor_asc":
          return { doctorName: "asc" };
        case "doctor_desc":
          return { doctorName: "desc" };
        case "date_asc":
          return { appointmentDate: "asc" };
        case "date_desc":
          return { appointmentDate: "desc" };
        case "oldest":
          return { createdAt: "asc" };
        case "newest":
        default:
          return { createdAt: "desc" };
      }
    })();

    // Build where conditions
    if (session.user.role === "admin") {
      whereAppointment = {
        // Status filter
        ...(status &&
          status !== "all" && {
            status: status as any,
          }),
        // Doctor name filter
        ...(doctorName && {
          doctorName: { contains: doctorName, mode: "insensitive" },
        }),
        // Department filter
        ...(department && {
          department: { contains: department, mode: "insensitive" },
        }),
        // Date range filter
        ...((dateFrom || dateTo) && {
          appointmentDate: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && {
              lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)),
            }),
          },
        }),
        // Search filter
        ...(search && {
          OR: [
            { patientName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { mobile: { contains: search, mode: "insensitive" } },
            { symptoms: { contains: search, mode: "insensitive" } },
            { paymentTransactionId: { contains: search, mode: "insensitive" } },
            { doctorName: { contains: search, mode: "insensitive" } },
            { department: { contains: search, mode: "insensitive" } },
          ],
        }),
      };
    }
    if (session.user.role === "doctor") {
      // ✅ Fetch the doctor record using findFirst (because userId is not unique)
      const doctor = await prisma.doctor.findFirst({
        where: { userId: session.user.id },
      });

      if (!doctor) {
        return NextResponse.json(
          { error: "Doctor profile not registered" },
          { status: 404 }
        );
      }

      whereAppointment = {
        doctorId: doctor.id, // ✅ use the actual doctor ID
        ...(status && status !== "all" ? { status: status as any } : {}),
        ...(doctorName
          ? { doctorName: { contains: doctorName, mode: "insensitive" } }
          : {}),
        ...(department
          ? { department: { contains: department, mode: "insensitive" } }
          : {}),
        ...(dateFrom || dateTo
          ? {
              appointmentDate: {
                ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                ...(dateTo
                  ? {
                      lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)),
                    }
                  : {}),
              },
            }
          : {}),
        ...(search && {
          OR: [
            { patientName: { contains: search, mode: "insensitive" } },
            { mobile: { contains: search, mode: "insensitive" } },
            { symptoms: { contains: search, mode: "insensitive" } },
            { paymentTransactionId: { contains: search, mode: "insensitive" } },
          ],
        }),
      };
    }
    if (session.user.role === "user") {
      whereAppointment = {
        userId: session.user.id,
        ...(status && status !== "all" ? { status: status as any } : {}),
        ...(doctorName
          ? { doctorName: { contains: doctorName, mode: "insensitive" } }
          : {}),
        ...(department
          ? { department: { contains: department, mode: "insensitive" } }
          : {}),
        ...(dateFrom || dateTo
          ? {
              appointmentDate: {
                ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                ...(dateTo
                  ? {
                      lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)),
                    }
                  : {}),
              },
            }
          : {}),
        ...(search && {
          OR: [
            { patientName: { contains: search, mode: "insensitive" } },
            { mobile: { contains: search, mode: "insensitive" } },
            { symptoms: { contains: search, mode: "insensitive" } },
            { paymentTransactionId: { contains: search, mode: "insensitive" } },
          ],
        }),
      };
    }

    // Calculate pagination
    const take = limit ? Number(limit) : 10;
    const skip = (Number(page) - 1) * take;

    const [appointments, totalCount] = await Promise.all([
      prisma.appointment.findMany({
        where:
          Object.keys(whereAppointment).length > 0
            ? whereAppointment
            : undefined,
        orderBy,
        skip,
        take,
      }),
      prisma.appointment.count({
        where:
          Object.keys(whereAppointment).length > 0
            ? whereAppointment
            : undefined,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / take);
    const hasNextPage = Number(page) < totalPages;
    const hasPrevPage = Number(page) > 1;

    return NextResponse.json({
      appointments,
      pagination: {
        page: Number(page),
        limit: take,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        sort,
        status,
        search,
        doctorName,
        department,
        dateFrom,
        dateTo,
      },
    });
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments", message: error.message },
      { status: 500 }
    );
  }
}
