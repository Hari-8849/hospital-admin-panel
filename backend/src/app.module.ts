import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';

import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { PharmacyModule } from './modules/pharmacy/pharmacy.module';
import { LaboratoryModule } from './modules/laboratory/laboratory.module';
import { BillingModule } from './modules/billing/billing.module';
import { TelemedicineModule } from './modules/telemedicine/telemedicine.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

import { DatabaseConfig } from './config/database.config';
import { RedisConfig } from './config/redis.config';
import { BullConfig } from './config/bull.config';

import { HealthController } from './health/health.controller';
import { AppController } from './app.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
    }),

    // Redis
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useClass: RedisConfig,
    }),

    // Queue system
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useClass: BullConfig,
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    TenantsModule,
    UsersModule,
    PatientsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    PharmacyModule,
    LaboratoryModule,
    BillingModule,
    TelemedicineModule,
    AdminModule,
    NotificationsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [],
})
export class AppModule {
  constructor(private configService: ConfigService) {}
}