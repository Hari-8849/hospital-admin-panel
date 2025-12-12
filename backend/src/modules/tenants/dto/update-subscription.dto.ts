import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlan } from '../../../shared/enums/subscription-plan.enum';

export class UpdateSubscriptionDto {
  @ApiProperty({ example: 'PROFESSIONAL', enum: SubscriptionPlan })
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;
}