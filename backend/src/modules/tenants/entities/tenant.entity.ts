import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { SubscriptionPlan } from '../../../shared/enums/subscription-plan.enum';
import { User } from '../../users/entities/user.entity';
import { Subscription } from './subscription.entity';

@Entity('tenants')
@Index(['identifier'])
export class Tenant extends BaseEntity {
  @Column({ unique: true })
  identifier: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  logo?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  postalCode?: string;

  @Column({ type: 'jsonb', nullable: true })
  settings?: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isOnTrial: boolean;

  @Column({ nullable: true })
  trialEndsAt?: Date;

  @Column({ nullable: true })
  schemaName?: string;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => Subscription, (subscription) => subscription.tenant)
  subscriptions: Subscription[];
}