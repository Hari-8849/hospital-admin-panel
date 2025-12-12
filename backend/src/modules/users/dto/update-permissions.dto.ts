import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermissionsDto {
  @ApiProperty({
    example: ['view_patients', 'manage_medical_records', 'create_prescriptions'],
    description: 'List of permissions to assign to the user'
  })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}