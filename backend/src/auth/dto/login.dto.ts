import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmailOrPhone } from '../validators/is-email-or-phone.validator';

export class LoginDto {
  @ApiProperty({
    example: 'john@example.com or 0787709760',
    description: 'Registered email address or phone number',
  })
  @IsNotEmpty()
  @IsString()
  @Validate(IsEmailOrPhone)
  identifier: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Account password',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}