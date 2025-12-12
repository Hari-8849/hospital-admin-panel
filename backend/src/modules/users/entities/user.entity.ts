import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

@Entity('users')
@Index(['email'])
@Index(['tenantId', 'status'])
export class User extends BaseEntity {
  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.users)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PATIENT })
  role: UserRole;

  @Column({ type: 'simple-array' })
  permissions: string[];

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerifiedAt?: Date;

  @Column({ nullable: true })
  passwordResetToken?: string;

  @Column({ nullable: true })
  passwordResetExpires?: Date;

  @Column({ nullable: true })
  emailVerificationToken?: string;

  @Column({ type: 'jsonb', nullable: true })
  profile?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  preferences?: Record<string, any>;

  @Column({ default: true })
  mustChangePassword: boolean;

  @Column({ type: 'jsonb', nullable: true })
  twoFactorSettings?: {
    enabled: boolean;
    secret?: string;
    backupCodes?: string[];
  };
}