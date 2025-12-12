import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../shared/enums/user-role.enum';

export class UpdateRoleDto {
  @ApiProperty({ example: UserRole.DOCTOR, enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;
}