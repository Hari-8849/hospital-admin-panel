import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { UserRepository } from '../users/user.repository';
import { TenantRepository } from '../tenants/tenant.repository';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { PasswordResetProcessor } from './processors/password-reset.processor';
import { EmailVerificationProcessor } from './processors/email-verification.processor';

import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '15m'),
        },
      }),
    }),
    TypeOrmModule.forFeature([UserRepository, TenantRepository]),
    BullModule.registerQueue({
      name: 'password-reset',
    },
    {
      name: 'email-verification',
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    TenantsService,
    UserRepository,
    TenantRepository,
    EmailService,
    SmsService,
    PasswordResetProcessor,
    EmailVerificationProcessor,
    JwtStrategy,
    LocalStrategy,
    JwtRefreshStrategy,
  ],
  exports: [AuthService, JwtStrategy, LocalStrategy, JwtRefreshStrategy],
})
export class AuthModule {}