import { Controller, Post, Body, UseGuards, Get, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedRequest } from './types/auth.types';


@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginUserDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginUserDto.identifier,
      loginUserDto.password,
    );
    return this.authService.login(user);
  }


  @Post('Refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async refreshToken(@Req() req: AuthenticatedRequest) {
    const authHeaders = req.headers.authorization?.split(' ')[1];
    if (!authHeaders) {
      throw new UnauthorizedException('No token provided');
    }

    return this.authService.refreshToken(authHeaders);

  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Token is invalid' })
  validateToken(@Body() body: { token: string }) {
    const decoded = this.authService.validateToken(body.token);
    return { valid: true, decoded };
  }

}