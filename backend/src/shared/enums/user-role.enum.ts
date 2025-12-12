export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  HOSPITAL_ADMIN = 'HOSPITAL_ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  RECEPTIONIST = 'RECEPTIONIST',
  PHARMACIST = 'PHARMACIST',
  LAB_TECHNICIAN = 'LAB_TECHNICIAN',
  BILLING_STAFF = 'BILLING_STAFF',
  PATIENT = 'PATIENT',
}

export const RoleHierarchy = {
  [UserRole.SUPER_ADMIN]: 9,
  [UserRole.HOSPITAL_ADMIN]: 8,
  [UserRole.DOCTOR]: 7,
  [UserRole.NURSE]: 6,
  [UserRole.PHARMACIST]: 5,
  [UserRole.LAB_TECHNICIAN]: 5,
  [UserRole.RECEPTIONIST]: 4,
  [UserRole.BILLING_STAFF]: 4,
  [UserRole.PATIENT]: 1,
};

export const DefaultPermissions = {
  [UserRole.SUPER_ADMIN]: [
    'manage_tenants',
    'manage_users',
    'manage_subscriptions',
    'view_analytics',
    'system_settings',
  ],
  [UserRole.HOSPITAL_ADMIN]: [
    'manage_users',
    'manage_appointments',
    'view_reports',
    'manage_billing',
    'manage_pharmacy',
    'manage_laboratory',
  ],
  [UserRole.DOCTOR]: [
    'view_patients',
    'manage_medical_records',
    'create_prescriptions',
    'manage_appointments',
    'view_lab_results',
  ],
  [UserRole.NURSE]: [
    'view_patients',
    'manage_vitals',
    'administer_medications',
    'update_medical_records',
  ],
  [UserRole.RECEPTIONIST]: [
    'manage_appointments',
    'manage_patient_registration',
    'view_patient_info',
    'manage_billing_basic',
  ],
  [UserRole.PHARMACIST]: [
    'manage_inventory',
    'fulfill_prescriptions',
    'manage_sales',
    'view_patient_medications',
  ],
  [UserRole.LAB_TECHNICIAN]: [
    'manage_lab_tests',
    'enter_results',
    'manage_samples',
    'view_patient_tests',
  ],
  [UserRole.BILLING_STAFF]: [
    'manage_invoices',
    'process_payments',
    'manage_insurance_claims',
    'view_reports',
  ],
  [UserRole.PATIENT]: [
    'view_own_records',
    'manage_appointments',
    'view_prescriptions',
    'make_payments',
  ],
};