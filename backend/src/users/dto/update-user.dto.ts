import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: 'About me' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ example: "John Doe's Shop" })
  @IsOptional()
  @IsString()
  shopName?: string;

  @ApiProperty({ example: '1234567890123' })
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
  @IsString()
  experience?: string;

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

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'password123' })
  @IsOptional()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  passwordHash?: string;
}
