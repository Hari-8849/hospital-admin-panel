import { IsString, IsEmail, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlan } from '../../../shared/enums/subscription-plan.enum';

export class CreateTenantDto {
  @ApiProperty({ example: 'City General Hospital' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'admin@cityhospital.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @MinLength(10)
  phone: string;

  @ApiProperty({ example: 'City General Hospital', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 'https://www.cityhospital.com', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ example: '123 Main St, City, State 12345', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'STARTER', enum: SubscriptionPlan })
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @ApiProperty({ example: 'admin', required: false })
  @IsOptional()
  @IsString()
  adminFirstName?: string;

  @ApiProperty({ example: 'user', required: false })
  @IsOptional()
  @IsString()
  adminLastName?: string;

  @ApiProperty({ example: 'admin@cityhospital.com', required: false })
  @IsOptional()
  @IsEmail()
  adminEmail?: string;

  @ApiProperty({ example: 'Admin123!', required: false })
  @IsOptional()
  @IsString()
  @MinLength(8)
  adminPassword?: string;
}