import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Role {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  WHOLESALER = 'WHOLESALER',
  ADMIN = 'ADMIN',
}

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: Role.BUYER, enum: Role })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  // Seller / Wholesaler fields
  @ApiProperty({ example: 'John Doe\'s Shop' })
  @IsOptional()
  @IsString()
  shopName?: string;

  @ApiProperty({ example: '1234567890123' })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiProperty({ example: 'We sell the best products!' })
  @IsOptional()
  @IsString()
  shopDescription?: string;

  @ApiProperty({ example: '123 Main St, City, State 12345' })
  @IsOptional()
  @IsString()
  shopAddress?: string;

  @ApiProperty({ example: ['Electronics', 'Clothing'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productTypes?: string[];

  @ApiProperty({ example: ['Experience 1', 'Experience 2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  experiences?: string[];

  @ApiProperty({ example: 'Experience 1' })
  @IsOptional()
  @IsString()
  experience?: string;

  // Buyer fields
  @ApiProperty({ example: ['Sports', 'Music'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiProperty({ example: 'Weekly' })
  @IsOptional()
  @IsString()
  shoppingFrequency?: string;

  @ApiProperty({ example: 'Budget' })
  @IsOptional()
  @IsString()
  budget?: string;
}