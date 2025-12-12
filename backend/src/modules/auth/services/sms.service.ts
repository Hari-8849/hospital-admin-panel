import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private twilioClient: Twilio;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (accountSid && authToken) {
      this.twilioClient = new Twilio(accountSid, authToken);
    }
  }

  async sendSms(to: string, message: string): Promise<void> {
    try {
      if (!this.twilioClient) {
        console.warn('Twilio not configured. SMS logging:', { to, message });
        return;
      }

      const from = this.configService.get<string>('TWILIO_PHONE_NUMBER');

      await this.twilioClient.messages.create({
        body: message,
        from,
        to,
      });
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }

  async sendAppointmentReminder(phone: string, patientName: string, appointmentDetails: any): Promise<void> {
    const message = `Hi ${patientName}, this is a reminder for your appointment tomorrow at ${new Date(appointmentDetails.dateTime).toLocaleTimeString()} with Dr. ${appointmentDetails.doctorName}. Please arrive 15 minutes early. Reply CANCEL to reschedule.`;

    await this.sendSms(phone, message);
  }

  async sendAppointmentConfirmation(phone: string, patientName: string, appointmentDetails: any): Promise<void> {
    const message = `Hi ${patientName}, your appointment has been confirmed for ${new Date(appointmentDetails.dateTime).toLocaleDateString()} at ${new Date(appointmentDetails.dateTime).toLocaleTimeString()} with Dr. ${appointmentDetails.doctorName}. Reply HELP for assistance.`;

    await this.sendSms(phone, message);
  }

  async sendPrescriptionReady(phone: string, patientName: string, prescriptionId: string): Promise<void> {
    const message = `Hi ${patientName}, your prescription (${prescriptionId}) is ready for collection at the pharmacy. Please bring your ID. Thank you!`;

    await this.sendSms(phone, message);
  }

  async sendVerificationCode(phone: string, code: string): Promise<void> {
    const message = `Your verification code is: ${code}. This code will expire in 10 minutes. Please do not share this code.`;

    await this.sendSms(phone, message);
  }
}