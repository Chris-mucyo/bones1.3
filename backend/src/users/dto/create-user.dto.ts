import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '../../../generated/prisma/client.js';

export class CreateUserDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'Unique username (no spaces)',
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '0787709760',
    description: 'User phone number (optional)',
  })
  @IsOptional()
  @IsNumber()
  phoneNumber?: number;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Password (minimum 8 characters)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    example: 'Chez Ktty',
    description: 'Full shop name',
  })
  @IsOptional()
  @IsString()
  shopName?: string;

  @ApiPropertyOptional({
    example: 'author',
    enum: Role,
    description: 'User role — only changeable by admin',
  })
  @IsEnum(Role)
  role: Role;


  @ApiPropertyOptional({
    example: 'Passionate tech journalist and blogger.',
    description: 'Short user bio',
  })
  @IsOptional()
  @IsString()
  bio?: string;

}
