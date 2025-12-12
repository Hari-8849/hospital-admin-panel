import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('medical_records')
@Index(['patientId', 'createdAt'])
@Index(['doctorId', 'createdAt'])
export class MedicalRecord extends BaseEntity {
  @Column()
  patientId: string;

  @Column()
  doctorId: string;

  @Column({ nullable: true })
  appointmentId?: string;

  @Column()
  recordType: string; // CONSULTATION, EMERGENCY, FOLLOW_UP, DISCHARGE_SUMMARY

  @Column({ type: 'jsonb' })
  soapNotes: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  diagnosis?: Array<{
    code: string; // ICD-10 code
    description: string;
    isPrimary: boolean;
    notes?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  procedures?: Array<{
    code: string; // CPT code
    description: string;
    performedAt?: Date;
    notes?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    prescribedAt: Date;
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

  @Column({ type: 'jsonb', nullable: true })
  allergies?: Array<{
    allergen: string;
    reaction: string;
    severity: 'MILD' | 'MODERATE' | 'SEVERE';
    notes?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  labResults?: Array<{
    testName: string;
    result: string;
    normalRange?: string;
    unit?: string;
    abnormal: boolean;
    notes?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  imagingResults?: Array<{
    modality: string; // XRAY, CT, MRI, ULTRASOUND
    studyType: string;
    findings: string;
    impression: string;
    reportUrl?: string;
    images?: string[];
  }>;

  @Column({ type: 'text', nullable: true })
  clinicalNotes?: string;

  @Column({ type: 'text', nullable: true })
  treatmentPlan?: string;

  @Column({ type: 'text', nullable: true })
  followUpInstructions?: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments?: Array<{
    type: string;
    name: string;
    url: string;
    uploadedAt: Date;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  flags?: Array<{
    type: 'ALLERGY_ALERT' | 'MEDICATION_INTERACTION' | 'CRITICAL_VALUE' | 'FOLLOW_UP_REQUIRED';
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    resolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
  }>;

  @Column({ default: false })
  isConfidential: boolean;

  @Column({ type: 'text', nullable: true })
  confidentialityReason?: string;

  @Column({ default: true })
  isAccessibleToPatient: boolean;

  @Column({ type: 'jsonb', nullable: true })
  auditTrail?: Array<{
    action: string;
    performedBy: string;
    performedAt: Date;
    changes?: Record<string, any>;
  }>;
}