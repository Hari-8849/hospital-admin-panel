import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransporter({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      to: email,
      subject: 'Verify Your Email - Hospital Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0288D1;">Welcome to Hospital Management System</h2>
          <p>Thank you for registering! Please verify your email address to activate your account.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <a href="${verificationUrl}" style="background-color: #0288D1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button above doesn't work, please copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            This link will expire in 24 hours. If you didn't create this account, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      to: email,
      subject: 'Reset Your Password - Hospital Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0288D1;">Password Reset Request</h2>
          <p>You requested a password reset for your Hospital Management System account.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #F44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button above doesn't work, please copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request this password reset, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  }

  async sendAppointmentConfirmation(email: string, patientName: string, appointmentDetails: any): Promise<void> {
    await this.transporter.sendMail({
      to: email,
      subject: 'Appointment Confirmation - Hospital Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Appointment Confirmed</h2>
          <p>Hello ${patientName},</p>
          <p>Your appointment has been confirmed with the following details:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Date:</strong> ${new Date(appointmentDetails.dateTime).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(appointmentDetails.dateTime).toLocaleTimeString()}</p>
            <p><strong>Doctor:</strong> Dr. ${appointmentDetails.doctorName}</p>
            <p><strong>Consultation Type:</strong> ${appointmentDetails.consultationType}</p>
          </div>
          <p>Please arrive 15 minutes before your appointment time.</p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If you need to reschedule or cancel, please contact us at least 24 hours in advance.
          </p>
        </div>
      `,
    });
  }

  async sendAppointmentReminder(email: string, patientName: string, appointmentDetails: any): Promise<void> {
    await this.transporter.sendMail({
      to: email,
      subject: 'Appointment Reminder - Hospital Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF9800;">Appointment Reminder</h2>
          <p>Hello ${patientName},</p>
          <p>This is a friendly reminder about your upcoming appointment:</p>
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #FF9800;">
            <p><strong>Date:</strong> ${new Date(appointmentDetails.dateTime).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(appointmentDetails.dateTime).toLocaleTimeString()}</p>
            <p><strong>Doctor:</strong> Dr. ${appointmentDetails.doctorName}</p>
            <p><strong>Location:</strong> ${appointmentDetails.location || 'Main Hospital'}</p>
          </div>
          <p>Please remember to bring any necessary documents and arrive 15 minutes early.</p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If you need to make any changes to your appointment, please contact us.
          </p>
        </div>
      `,
    });
  }

  async sendPrescriptionReady(email: string, patientName: string, prescriptionDetails: any): Promise<void> {
    await this.transporter.sendMail({
      to: email,
      subject: 'Prescription Ready - Hospital Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #9C27B0;">Prescription Ready</h2>
          <p>Hello ${patientName},</p>
          <p>Your prescription is ready for collection at the pharmacy:</p>
          <div style="background-color: #f3e5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Prescription ID:</strong> ${prescriptionDetails.id}</p>
            <p><strong>Doctor:</strong> Dr. ${prescriptionDetails.doctorName}</p>
            <p><strong>Date:</strong> ${new Date(prescriptionDetails.createdAt).toLocaleDateString()}</p>
            <p><strong>Medications:</strong> ${prescriptionDetails.medications.join(', ')}</p>
          </div>
          <p>Please bring your ID and any insurance cards when collecting your prescription.</p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Pharmacy hours: Monday - Saturday, 9:00 AM - 8:00 PM
          </p>
        </div>
      `,
    });
  }
}