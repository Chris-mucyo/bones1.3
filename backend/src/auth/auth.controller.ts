import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import {
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { GoogleAuthGuard } from './guards/google-auth.guard.js';
import { Public } from '../common/decorators/public.decorator.js';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // ─── Local auth ──────────────────────────────────────────────────

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Request() req: any) {
    return this.authService.logout(req.user.id);
  }

  // ─── Token refresh ───────────────────────────────────────────────

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto, @Request() req: any) {
    // userId comes from the expired-but-parseable access token OR body
    // For simplicity we decode the refresh token claim on the service side
    // The client should send userId + refreshToken
    return this.authService.refresh(req.body.userId, dto.refreshToken);
  }

  // ─── Email verification ──────────────────────────────────────────
  @Public()
  @Post('send-verification')
  @HttpCode(HttpStatus.OK)
  sendVerification(@Body() dto: { email: string }) {
    return this.authService.sendVerificationEmail(dto.email);
  }

  
  @Public()
  @Get('verify-email')  
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
  // ─── Password reset ──────────────────────────────────────────────

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // ─── Google OAuth ────────────────────────────────────────────────

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Initiates the Google OAuth flow — handled by Passport
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Request() req: any) {
    return this.authService.googleLogin(req.user);
  }

  // ─── Validate token ──────────────────────────────────────────────

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  validate(@Request() req: any) {
    return this.authService.validateToken(req.user.id);
  }



}