import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum BloodGroup {
  A_POSITIVE = 'A_POSITIVE',
  A_NEGATIVE = 'A_NEGATIVE',
  B_POSITIVE = 'B_POSITIVE',
  B_NEGATIVE = 'B_NEGATIVE',
  O_POSITIVE = 'O_POSITIVE',
  O_NEGATIVE = 'O_NEGATIVE',
  AB_POSITIVE = 'AB_POSITIVE',
  AB_NEGATIVE = 'AB_NEGATIVE',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

@Entity('patients')
@Index(['email'])
@Index(['phone'])
@Index(['patientId'])
export class Patient extends BaseEntity {
  @Column({ unique: true })
  patientId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ nullable: true })
  age?: number;

  @Column({ nullable: true })
  email?: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  alternatePhone?: string;

  @Column({ type: 'enum', enum: BloodGroup, nullable: true })
  bloodGroup?: BloodGroup;

  @Column({ type: 'enum', enum: MaritalStatus, nullable: true })
  maritalStatus?: MaritalStatus;

  @Column({ nullable: true })
  occupation?: string;

  @Column({ type: 'text', nullable: true })
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
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    address?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  insurance?: {
    provider: string;
    policyNumber: string;
    policyHolder: string;
    expiryDate?: Date;
    coverageDetails?: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  medicalHistory?: {
    allergies: string[];
    chronicConditions: string[];
    pastSurgeries: string[];
    currentMedications: string[];
    familyHistory: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  documents?: Array<{
    type: string;
    url: string;
    uploadedAt: Date;
    uploadedBy: string;
  }>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastVisitAt?: Date;

  @Column({ default: 0 })
  totalVisits: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  outstandingBalance: number;

  @Column({ type: 'jsonb', nullable: true })
  preferences?: {
    preferredLanguage: string;
    communicationMethod: 'EMAIL' | 'SMS' | 'WHATSAPP';
    appointmentReminders: boolean;
    billingReminders: boolean;
  };
}