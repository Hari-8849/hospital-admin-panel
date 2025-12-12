import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { SubscriptionPlan } from '../../../shared/enums/subscription-plan.enum';
import { Tenant } from './tenant.entity';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING',
}

@Entity('subscriptions')
@Index(['tenantId', 'status'])
export class Subscription extends BaseEntity {
  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.subscriptions)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'enum', enum: SubscriptionPlan })
  plan: SubscriptionPlan;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.PENDING })
  status: SubscriptionStatus;

  @Column({ type: 'jsonb' })
  features: Record<string, any>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'integer' })
  billingCycle: number; // in months

  @Column({ default: 1 })
  isAutoRenew: boolean;

  @Column({ nullable: true })
  startedAt?: Date;

  @Column({ nullable: true })
  endsAt?: Date;

  @Column({ nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  lastBilledAt?: Date;

  @Column({ nullable: true })
  nextBillingAt?: Date;

  @Column({ nullable: true })
  paymentMethodId?: string;

  @Column({ type: 'jsonb', nullable: true })
  usageStats?: Record<string, any>;

  @Column({ default: false })
  isOverLimit: boolean;
}