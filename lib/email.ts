import nodemailer from "nodemailer";

export const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true, // use true for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const createOrderStatusUpdateTemplate = (
  order: any,
  oldStatus: string,
  newStatus: string
) => {
  const formattedDate = new Date(order.updatedAt).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusMessages: any = {
    pending: "is being processed",
    confirmed: "has been confirmed",
    shipped: "has been shipped",
    delivered: "has been delivered",
    cancelled: "has been cancelled",
  };

  const customerEmail = {
    subject: `Order ${newStatus} - #${order.id.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Order Update</h2>
        <p>Dear ${order.customerName},</p>
        <p>Your order <strong>#${order.id.slice(-8).toUpperCase()}</strong> ${
      statusMessages[newStatus]
    }.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Order Details:</h3>
          <p><strong>Order ID:</strong> #${order.id.slice(-8).toUpperCase()}</p>
          <p><strong>Updated Date:</strong> ${formattedDate}</p>
          <p><strong>Total Amount:</strong> ৳${order.totalAmount} BDT</p>
          <p><strong>New Status:</strong> ${newStatus}</p>
        </div>

        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #166534; margin-top: 0;">Order Items:</h4>
          ${order.items
            .map(
              (item: any) => `
            <div style="border-bottom: 1px solid #e2e8f0; padding: 10px 0;">
              <p><strong>${item.book.title}</strong> by ${item.book.author}</p>
              <p>Quantity: ${item.quantity} × ৳${item.price} = ৳${
                item.quantity * item.price
              }</p>
            </div>
          `
            )
            .join("")}
        </div>

        <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #d97706; margin-top: 0;">Shipping Information:</h4>
          <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
          <p><strong>Contact:</strong> ${order.customerPhone} | ${
      order.customerEmail
    }</p>
          ${
            newStatus === "shipped"
              ? "<p><strong>Tracking Information:</strong> Your order is on the way. You will receive a tracking number soon.</p>"
              : ""
          }
          ${
            newStatus === "delivered"
              ? "<p><strong>Delivery Date:</strong> " + formattedDate + "</p>"
              : ""
          }
        </div>

        <p style="color: #64748b;">
          If you have any questions, please contact our customer support.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 14px;">
          This is an automated notification. Please do not reply to this email.
        </p>
      </div>
    `,
  };

  return customerEmail;
};

export const sendOrderStatusUpdateEmail = async (
  order: any,
  oldStatus: string,
  newStatus: string
) => {
  try {
    const transporter = createTransporter();
    const template = createOrderStatusUpdateTemplate(
      order,
      oldStatus,
      newStatus
    );

    if (order.customerEmail) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: order.customerEmail,
        subject: template.subject,
        html: template.html,
      });
    }

    console.log("Order status update email sent successfully");
  } catch (emailError) {
    console.error("Error sending order status update email:", emailError);
  }
};
