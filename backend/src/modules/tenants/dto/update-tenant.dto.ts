import { IsString, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateTenantDto } from './create-tenant.dto';

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  @ApiProperty({ example: 'City General Hospital', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 'admin@cityhospital.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  @MinLength(10)
  phone?: string;

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

  @ApiProperty({ type: 'object', required: false })
  @IsOptional()
  settings?: Record<string, any>;
}