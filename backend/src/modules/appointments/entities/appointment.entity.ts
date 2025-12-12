import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  RESCHEDULED = 'RESCHEDULED',
}

export enum ConsultationType {
  IN_PERSON = 'IN_PERSON',
  VIDEO = 'VIDEO',
  PHONE = 'PHONE',
  CHAT = 'CHAT',
}

@Entity('appointments')
@Index(['patientId', 'dateTime'])
@Index(['doctorId', 'dateTime'])
@Index(['status'])
@Index(['dateTime'])
export class Appointment extends BaseEntity {
  @Column()
  patientId: string;

  @Column()
  doctorId: string;

  @Column({ type: 'timestamp' })
  dateTime: Date;

  @Column({ type: 'interval' })
  duration: string; // e.g., '30 minutes', '1 hour'

  @Column({ type: 'enum', enum: ConsultationType, default: ConsultationType.IN_PERSON })
  consultationType: ConsultationType;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED })
  status: AppointmentStatus;

  @Column({ nullable: true })
  reason?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  symptoms?: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  consultationFee?: number;

  @Column({ nullable: true })
  roomId?: string;

  @Column({ type: 'jsonb', nullable: true })
  telemedicineLink?: {
    joinUrl: string;
    meetingId: string;
    password?: string;
  };

  @Column({ nullable: true })
  checkedInAt?: Date;

  @Column({ nullable: true })
  startedAt?: Date;

  @Column({ nullable: true })
  completedAt?: Date;

  @Column({ nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  cancellationReason?: string;

  @Column({ type: 'jsonb', nullable: true })
  followUp?: {
    needed: boolean;
    afterDays?: number;
    notes?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  prescriptions?: Array<{
    medicationId: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  labOrders?: Array<{
    testId: string;
    testName: string;
    urgency: 'ROUTINE' | 'URGENT' | 'STAT';
    notes?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  vitals?: {
    bloodPressure?: { systolic: number; diastolic: number };
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
  };

  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true })
  paymentId?: string;

  @Column({ default: false })
  remindersSent: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  attachments?: Array<{
    type: string;
    url: string;
    uploadedAt: Date;
  }>;
}