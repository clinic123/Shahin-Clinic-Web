import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin } from "better-auth/plugins";
import { createTransporter } from "./email";
import { ac, admin, doctor, user } from "./permissions";
import prisma from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mongodb" }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, token }) {
      const transporter = createTransporter();
      const resetUrl = `${process.env.BETTER_AUTH_URL}/reset-password?token=${token}`;

      const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Reset Your Password</h2>
            <p>Hello ${user.name},</p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h3 style="color: #1e293b; margin-top: 0;">Password Reset Request</h3>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #92400e; margin-top: 0;">Important:</h4>
              <ul style="color: #92400e;">
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>For security reasons, don't share this link with anyone</li>
              </ul>
            </div>

            <p style="color: #64748b;">
              If the button doesn't work, copy and paste this link in your browser:
            </p>
            <p style="color: #2563eb; word-break: break-all;">${resetUrl}</p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #94a3b8; font-size: 14px;">
              This is an automated password reset request. Please do not reply to this email.
            </p>
          </div>
        `;

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: "Reset your password - Your App Name",
          html: html,
        });
      } catch (error) {
        console.error("Error sending reset password email:", error);
      }
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectURL: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
  },
  hooks: {},
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
      phoneNumber: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [
    adminPlugin({
      adminUserIds: ["BmiEQBumD31Kv4TWFipaoqMnmMGmRFsV"],
      ac: ac,
      adminRoles: ["admin", "user", "doctor"],
      roles: {
        admin,
        user,
        doctor,
      },
    }),

    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
