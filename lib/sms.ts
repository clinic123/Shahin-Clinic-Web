import twilio from "twilio";

// Twilio client (will be undefined if credentials are not provided)
let twilioClient: twilio.Twilio | null = null;

try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log("Twilio client initialized successfully");
  } else {
    console.warn(
      "Twilio credentials not found. SMS functionality will be disabled."
    );
  }
} catch (error) {
  console.error("Failed to initialize Twilio client:", error);
}

interface SMSOptions {
  to: string;
  body: string;
  from?: string;
}

export async function sendSMS({
  to,
  body,
  from = process.env.TWILIO_PHONE_NUMBER,
}: SMSOptions): Promise<boolean> {
  // Validate phone number format
  const cleanNumber = to.replace(/\D/g, "");

  if (!cleanNumber) {
    console.error("Invalid phone number:", to);
    return false;
  }

  // If Twilio is not configured, log the message and return true for development
  if (!twilioClient || !from) {
    console.log("SMS (Twilio not configured):", {
      to: cleanNumber,
      body,
      from,
    });
    return true; // Return true in development to simulate success
  }

  try {
    const message = await twilioClient.messages.create({
      body,
      from,
      to: cleanNumber,
    });

    console.log("SMS sent successfully:", message.sid);
    return true;
  } catch (error: any) {
    console.error("SMS sending failed:", error.message);

    // Handle specific Twilio errors
    if (error.code === 21211) {
      console.error("Invalid phone number format");
    } else if (error.code === 21408) {
      console.error("Twilio account not authorized to send to this country");
    } else if (error.code === 21610) {
      console.error("Twilio account not authorized to send SMS");
    }

    return false;
  }
}

// SMS templates for common use cases
export const smsTemplates = {
  appointmentConfirmed: (
    patientName: string,
    appointmentDate: string,
    doctorName: string,
    appointmentId: string
  ) =>
    `Hi ${patientName}, your appointment with Dr. ${doctorName} on ${new Date(
      appointmentDate
    ).toLocaleDateString()} at ${new Date(appointmentDate).toLocaleTimeString(
      [],
      { hour: "2-digit", minute: "2-digit" }
    )} has been confirmed. Appointment ID: ${appointmentId.slice(
      -8
    )}. Please arrive 15 mins early.`,

  appointmentCancelled: (
    patientName: string,
    appointmentDate: string,
    doctorName: string,
    reason?: string
  ) =>
    `Hi ${patientName}, your appointment with Dr. ${doctorName} on ${new Date(
      appointmentDate
    ).toLocaleDateString()} has been cancelled.${
      reason ? ` Reason: ${reason}` : ""
    } Contact us to reschedule.`,

  appointmentReminder: (
    patientName: string,
    appointmentDate: string,
    doctorName: string
  ) =>
    `Reminder: Hi ${patientName}, you have an appointment with Dr. ${doctorName} tomorrow at ${new Date(
      appointmentDate
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}. Please arrive 15 mins early.`,

  paymentReminder: (patientName: string, amount: number) =>
    `Hi ${patientName}, friendly reminder: You have a payment of $${amount.toFixed(
      2
    )} due. Please make payment at your earliest convenience.`,

  paymentReceived: (patientName: string, amount: number) =>
    `Hi ${patientName}, we've received your payment of $${amount.toFixed(
      2
    )}. Thank you for your payment!`,
};

// Helper function to format phone numbers
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, "");

  if (cleaned.length === 10) {
    return `+1${cleaned}`; // US numbers
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+${cleaned}`; // US numbers with country code
  } else if (cleaned.length > 10) {
    return `+${cleaned}`; // International numbers
  }

  return phoneNumber; // Return original if format is unexpected
}
