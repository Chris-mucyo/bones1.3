import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcryptjs'; // Single import
import * as crypto from 'crypto'; // Single crypto import
import { UsersService } from '../users/users.service.js';
import { MailService } from '../mail/mail.service.js';
import {
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {}
  // ─── Local Login ────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 🔥 FIXED: Check isEmailVerified, not isActive
    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  // ─── Google OAuth callback ───────────────────────────────────────

  async googleLogin(user: any) {
    if (!user) throw new UnauthorizedException('No user from Google');
    return this.generateTokens(user.id, user.email, user.role);
  }

  // ─── Refresh Token Rotation ──────────────────────────────────────

  async refresh(userId: number, refreshToken: string) {
    const valid = await this.usersService.validateRefreshToken(
      userId,
      refreshToken,
    );
    if (!valid)
      throw new UnauthorizedException('Invalid or expired refresh token');

    const user = await this.usersService.findByEmail(
      (await this.usersService.findById(userId)).email,
    );

    if (!user) throw new UnauthorizedException();

    return this.generateTokens(user.id, user.email, user.role as string);
  }

  async logout(userId: number) {
    await this.usersService.setRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  // ─── Email Verification ──────────────────────────────────────────

  async sendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.usersService.setEmailVerificationToken(user.id, token, expiry);

    const verificationUrl = `${this.config.get('FRONTEND_URL')}/verify-email?token=${token}`;
    // await this.mailService.sendVerificationEmail(user.email, verificationUrl);

    return { message: 'Verification email sent!' };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.verifyEmail(token);
    return {
      message: 'Email verified successfully!',
      user: { id: user.id, email: user.email },
    };
  }

  // ─── Password Reset ──────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user)
      return { message: 'If that email exists, a reset link has been sent.' };

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await this.usersService.setResetToken(dto.email, token, expiry);
    await this.mailService.sendPasswordResetEmail(dto.email, token);

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(dto.token);
    if (!user) throw new BadRequestException('Invalid or expired reset token');

    const passwordHash = await hash(dto.password, 10);
    await this.usersService.update(user.id, { passwordHash });
    await this.usersService.clearResetToken(user.id);

    return { message: 'Password reset successfully. You can now log in.' };
  }

  // ─── Validate token (used by /auth/validate) ────────────────────

  async validateToken(userId: number) {
    return this.usersService.findById(userId);
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  private async generateTokens(id: number, email: string, role: string) {
    const payload = { sub: id, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    await this.usersService.setRefreshToken(id, refreshToken);

    return { accessToken, refreshToken };
  }
}
