import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ErrorHandlerService } from '../common/error-handler.service';

type UserUpdatePayload = Omit<UpdateUserDto, 'password'> & { passwordHash?: string };

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) { }

  async create(dto: CreateUserDto) {
    try {
      const { password, ...rest } = dto;
      const passwordHash = await bcrypt.hash(password, 10);
      return await this.prisma.user.create({
        data: { ...rest, passwordHash },
        select: this.safeSelect(),
      });
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'creating user' });
    }
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: +limit,
        select: this.safeSelect(),
        orderBy: { createdAt: 'desc' },

      }),
      this.prisma.user.count(),
    ]);
    return {
      data: users,
      total,
      page: +page,
      limit: +limit,
    };
  }


  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          ...this.safeSelect(),
        }
      });
      if (!user) throw new NotFoundException(`User #${id} not found`);
      return user;
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'retrieving user' });
    }
  }

  async update(id: number, dto: UpdateUserDto) {
    try {
      await this.findOne(id);

      const { password, ...rest } = dto;
      const updatePayload: UserUpdatePayload = { ...rest };

      if (password) {
        updatePayload.passwordHash = await bcrypt.hash(password, 10);
      }

      return await this.prisma.user.update({
        where: { id },
        data: updatePayload,
        select: this.safeSelect(),
      });
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'updating user' });
    }
  }

  async findByFullname(fullName: string) {
    return this.prisma.user.findMany({
      where: { fullName },
      select: this.safeSelect(),
    });
  }


  async remove(id: number) {
    try {
      await this.findOne(id);
      await this.prisma.user.delete({ where: { id } });
      return { message: `User #${id} removed successfully` };
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'removing user' });
    }
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }


  private safeSelect() {
    return {
      id: true,
      fullname: true,
      email: true,
      fullName: true,
      bio: true,
      avatarUrl: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    } as const;
  }
}




