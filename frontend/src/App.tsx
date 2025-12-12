import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

import { useAuth } from './contexts/AuthContext'
import { Layout } from './components/layout'
import { LoadingScreen } from './components/ui/loading-screen'

// Auth pages
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './features/auth/ResetPasswordPage'
import { VerifyEmailPage } from './features/auth/VerifyEmailPage'

// Dashboard pages
import { DashboardPage } from './features/dashboard/DashboardPage'

// Patient pages
import { PatientsPage } from './features/patients/PatientsPage'
import { PatientDetailPage } from './features/patients/PatientDetailPage'
import { CreatePatientPage } from './features/patients/CreatePatientPage'

// Appointment pages
import { AppointmentsPage } from './features/appointments/AppointmentsPage'
import { AppointmentDetailPage } from './features/appointments/AppointmentDetailPage'
import { BookAppointmentPage } from './features/appointments/BookAppointmentPage'

// Medical records pages
import { MedicalRecordsPage } from './features/medical-records/MedicalRecordsPage'
import { MedicalRecordDetailPage } from './features/medical-records/MedicalRecordDetailPage'

// Pharmacy pages
import { PharmacyPage } from './features/pharmacy/PharmacyPage'
import { PrescriptionDetailPage } from './features/pharmacy/PrescriptionDetailPage'

// Laboratory pages
import { LaboratoryPage } from './features/laboratory/LaboratoryPage'
import { LabTestDetailPage } from './features/laboratory/LabTestDetailPage'

// Billing pages
import { BillingPage } from './features/billing/BillingPage'
import { InvoiceDetailPage } from './features/billing/InvoiceDetailPage'

// Telemedicine pages
import { TelemedicinePage } from './features/telemedicine/TelemedicinePage'
import { VideoConsultationPage } from './features/telemedicine/VideoConsultationPage'

// Admin pages
import { AdminDashboardPage } from './features/admin/AdminDashboardPage'
import { UsersPage } from './features/admin/UsersPage'
import { TenantsPage } from './features/admin/TenantsPage'
import { SettingsPage } from './features/admin/SettingsPage'

// Not found page
import { NotFoundPage } from './components/NotFoundPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <>
      <Helmet>
        <title>Hospital Management System</title>
        <meta name="description" content="Comprehensive Hospital & Clinic Management Platform" />
      </Helmet>

      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <PublicRoute>
              <VerifyEmailPage />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Patients */}
          <Route path="patients" element={<PatientsPage />} />
          <Route path="patients/new" element={<CreatePatientPage />} />
          <Route path="patients/:id" element={<PatientDetailPage />} />

          {/* Appointments */}
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="appointments/new" element={<BookAppointmentPage />} />
          <Route path="appointments/:id" element={<AppointmentDetailPage />} />

          {/* Medical Records */}
          <Route path="medical-records" element={<MedicalRecordsPage />} />
          <Route path="medical-records/:id" element={<MedicalRecordDetailPage />} />

          {/* Pharmacy */}
          <Route path="pharmacy" element={<PharmacyPage />} />
          <Route path="pharmacy/prescriptions/:id" element={<PrescriptionDetailPage />} />

          {/* Laboratory */}
          <Route path="laboratory" element={<LaboratoryPage />} />
          <Route path="laboratory/tests/:id" element={<LabTestDetailPage />} />

          {/* Billing */}
          <Route path="billing" element={<BillingPage />} />
          <Route path="billing/invoices/:id" element={<InvoiceDetailPage />} />

          {/* Telemedicine */}
          <Route path="telemedicine" element={<TelemedicinePage />} />
          <Route path="telemedicine/consultation/:id" element={<VideoConsultationPage />} />

          {/* Admin */}
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/users" element={<UsersPage />} />
          <Route path="admin/tenants" element={<TenantsPage />} />
          <Route path="admin/settings" element={<SettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App