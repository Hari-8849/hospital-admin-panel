export enum SubscriptionPlan {
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export const PlanFeatures = {
  [SubscriptionPlan.STARTER]: {
    maxUsers: 5,
    maxPatients: 100,
    modules: ['OPD_MANAGEMENT', 'BILLING', 'APPOINTMENTS', 'DOCTOR_DASHBOARD'],
    appointments: 100,
    storage: 5, // GB
    support: 'email',
    price: 99, // per month
  },
  [SubscriptionPlan.PROFESSIONAL]: {
    maxUsers: 25,
    maxPatients: 1000,
    modules: [
      'OPD_MANAGEMENT',
      'BILLING',
      'APPOINTMENTS',
      'DOCTOR_DASHBOARD',
      'EMR_EHR',
      'PHARMACY',
      'LABORATORY',
      'IPD_MANAGEMENT',
      'TELEMEDICINE',
    ],
    appointments: 1000,
    storage: 50, // GB
    support: 'email_phone',
    price: 499, // per month
  },
  [SubscriptionPlan.ENTERPRISE]: {
    maxUsers: -1, // unlimited
    maxPatients: -1, // unlimited
    modules: [
      'OPD_MANAGEMENT',
      'BILLING',
      'APPOINTMENTS',
      'DOCTOR_DASHBOARD',
      'EMR_EHR',
      'PHARMACY',
      'LABORATORY',
      'IPD_MANAGEMENT',
      'TELEMEDICINE',
      'INTEGRATIONS',
      'ADVANCED_ANALYTICS',
      'MULTI_BRANCH',
      'CORPORATE_BILLING',
    ],
    appointments: -1, // unlimited
    storage: 500, // GB
    support: '24x7_dedicated',
    price: 1999, // per month
  },
};