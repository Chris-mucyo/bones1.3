import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { hash, compare } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto, Role } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

const SALT_ROUNDS = 10;

const SAFE_USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  shopName: true,
  nationalId: true,
  shopDescription: true,
  shopAddress: true,
  productTypes: true,
  experience: true,
  interests: true,
  shoppingFrequency: true,
  budget: true,
  provider: true,
  createdAt: true,
  updatedAt: true,
  avatarUrl: true,
  bio: true,
  isActive: true,
  phoneNumber: true,
  // excluded: passwordHash, refreshToken, resetToken, resetTokenExpiry, providerId
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    if (!dto.password) {
      throw new BadRequestException('Password is required');
    }

    if (
      (dto.role === Role.SELLER || dto.role === Role.WHOLESALER) &&
      !dto.shopName
    ) {
      throw new BadRequestException(
        'Shop name is required for sellers and wholesalers',
      );
    }

    const verificationToken = this.generateToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const passwordHash = await hash(dto.password, SALT_ROUNDS);

    return this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        passwordHash,
        role: dto.role,
        phoneNumber: dto.phoneNumber,
        shopName: dto.shopName,
        nationalId: dto.nationalId,
        shopDescription: dto.shopDescription,
        shopAddress: dto.shopAddress,
        productTypes: dto.productTypes ?? [],
        experience: dto.experience,
        interests: dto.interests ?? [],
        shoppingFrequency: dto.shoppingFrequency,
        budget: dto.budget,
        isActive: false,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiry: verificationExpiry,
      },
      select: SAFE_USER_SELECT,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({ select: SAFE_USER_SELECT });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });

    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findFirst({
      where: { fullName: { equals: username, mode: 'insensitive' } },
      select: SAFE_USER_SELECT,
    });

    if (!user) throw new NotFoundException(`User '${username}' not found`);
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findById(id);

    const data: Record<string, any> = { ...dto };

    if (dto.password) {
      data.passwordHash = await hash(dto.password, SALT_ROUNDS);
      delete data.password;
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: SAFE_USER_SELECT,
    });
  }

  async remove(id: number) {
    await this.findById(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: `User #${id} deleted` };
  }

  // ─── Internal methods used by AuthService ───────────────────────

  async setRefreshToken(id: number, token: string | null) {
    const hashed = token ? await hash(token, SALT_ROUNDS) : null;
    await this.prisma.user.update({
      where: { id },
      data: { refreshToken: hashed },
    });
  }

  async validateRefreshToken(id: number, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user?.refreshToken) return false;
    return compare(token, user.refreshToken);
  }

  async setResetToken(email: string, token: string, expiry: Date) {
    await this.prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });
  }

  async findByResetToken(token: string) {
    return this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });
  }

  async clearResetToken(id: number) {
    await this.prisma.user.update({
      where: { id },
      data: { resetToken: null, resetTokenExpiry: null },
    });
  }

  async activateUser(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: SAFE_USER_SELECT,
    });
  }

  async findOrCreateGoogleUser(profile: {
    providerId: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
  }) {
    const existing = await this.prisma.user.findFirst({
      where: { provider: 'GOOGLE', providerId: profile.providerId },
    });

    if (existing) return existing;

    const byEmail = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (byEmail) {
      return this.prisma.user.update({
        where: { id: byEmail.id },
        data: {
          provider: 'GOOGLE',
          providerId: profile.providerId,
          avatarUrl: profile.avatarUrl,
          isActive: true,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        email: profile.email,
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl,
        provider: 'GOOGLE',
        providerId: profile.providerId,
        role: 'BUYER',
        isActive: true,
      },
    });
  }

  private generateToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }
  async setEmailVerificationToken(id: number, token: string, expiry: Date) {
    await this.prisma.user.update({
      where: { id },
      data: {
        emailVerificationToken: token,
        emailVerificationTokenExpiry: expiry,
      },
    });
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null,
      },
      select: SAFE_USER_SELECT,
    });
  }
}
