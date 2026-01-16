// app/api/test-email/route.ts
import { createTransporter } from "@/lib/email";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.SMTP_USER,
      subject: "✅ Test Email",
      text: "Nodemailer setup working successfully!",
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Email test failed:", err);
    return NextResponse.json({ success: false, message: err.message });
  }
}
