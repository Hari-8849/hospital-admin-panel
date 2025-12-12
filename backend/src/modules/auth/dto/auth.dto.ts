import { IsEmail, IsString, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../shared/enums/user-role.enum';

export class LoginDto {
  @ApiProperty({ example: 'john.doe@hospital.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'hospital-123' })
  @IsString()
  tenantId: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'john.doe@hospital.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @MinLength(10)
  phone: string;

  @ApiProperty({ enum: UserRole, example: UserRole.DOCTOR })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: 'hospital-123' })
  @IsString()
  tenantId: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'john.doe@hospital.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'hospital-123' })
  @IsString()
  tenantId: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset-token-uuid' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123!' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty({ example: 'verification-token-uuid' })
  @IsString()
  token: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  refreshToken: string;
}