import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('MAIL_HOST'),
      port: this.config.get<number>('MAIL_PORT'),
      secure: this.config.get<boolean>('MAIL_SECURE', false),
      auth: {
        user: this.config.get<string>('MAIL_USER'),
        pass: this.config.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const url = `${this.config.get('APP_URL')}/auth/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: `"${this.config.get('MAIL_FROM_NAME', 'App')}" <${this.config.get('MAIL_FROM')}>`,
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2>Welcome! Please verify your email</h2>
          <p>Click the button below to activate your account. This link expires in <strong>24 hours</strong>.</p>
          <a href="${url}" style="
            display:inline-block;padding:12px 28px;background:#4F46E5;
            color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;
          ">Verify Email</a>
          <p style="margin-top:24px;color:#6B7280;font-size:14px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    this.logger.log(`Verification email sent to ${email}`);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const url = `${this.config.get('APP_URL')}/auth/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: `"${this.config.get('MAIL_FROM_NAME', 'App')}" <${this.config.get('MAIL_FROM')}>`,
      to: email,
      subject: 'Reset your password',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2>Password Reset Request</h2>
          <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${url}" style="
            display:inline-block;padding:12px 28px;background:#4F46E5;
            color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;
          ">Reset Password</a>
          <p style="margin-top:24px;color:#6B7280;font-size:14px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    this.logger.log(`Password reset email sent to ${email}`);
  }
}