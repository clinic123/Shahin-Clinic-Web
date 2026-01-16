import { auth } from "@/lib/auth";

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteParams) {
  const { id } = await context.params;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (
    !session ||
    (session.user.role !== "admin" && session.user.role !== "doctor")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: { user: true },
    });

    // Send SMS notification
    if (status === "CONFIRMED" && appointment.mobile) {
      await sendConfirmationSMS(appointment.mobile, appointment);
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

async function sendConfirmationSMS(mobile: string, appointment: any) {
  // Implement SMS sending logic for Bangladesh numbers
  // You can use services like SSL Wireless, GreenWeb, or other Bangladeshi SMS providers

  const message = `Your appointment with ${
    appointment.doctorName
  } on ${appointment.appointmentDate.toLocaleDateString()} has been confirmed. Thank you for choosing our service.`;

  // Example with fetch to SMS API
  try {
    await fetch("https://api.sslwireless.com/api/v3/send-sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_token: process.env.SMS_API_KEY,
        sid: process.env.SMS_SENDER_ID,
        msisdn: mobile,
        sms: message,
        csms_id: appointment.id,
      }),
    });
  } catch (error) {
    console.error("Failed to send SMS:", error);
  }
}
