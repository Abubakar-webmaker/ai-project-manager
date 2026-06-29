// src/shared/utils/email.util.ts
import { transporter } from "../../config/mail.config";
import { env } from "../../config/env.config";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

export const getVerificationEmailTemplate = (
  name: string,
  token: string
): string => {
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Welcome to AI Project Manager!</h2>
      <p>Hi ${name},</p>
      <p>Please verify your email address by clicking the button below:</p>
      <a href="${verifyUrl}" 
         style="background: #6366f1; color: white; padding: 12px 24px; 
                text-decoration: none; border-radius: 6px; display: inline-block;">
        Verify Email
      </a>
      <p style="color: #666; margin-top: 20px;">
        This link expires in 24 hours.
      </p>
    </div>
  `;
};

export const getPasswordResetEmailTemplate = (
  name: string,
  token: string
): string => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>You requested to reset your password. Click the button below:</p>
      <a href="${resetUrl}" 
         style="background: #6366f1; color: white; padding: 12px 24px; 
                text-decoration: none; border-radius: 6px; display: inline-block;">
        Reset Password
      </a>
      <p style="color: #666; margin-top: 20px;">
        This link expires in 1 hour. If you didn't request this, ignore this email.
      </p>
    </div>
  `;
};