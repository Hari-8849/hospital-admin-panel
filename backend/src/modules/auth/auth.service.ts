import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../users/entities/user.entity';
import { UserStatus } from '../users/entities/user.entity';
import { UserRole } from '../../shared/enums/user-role.enum';
import { Tenant } from '../tenants/entities/tenant.entity';
import { UserRepository } from '../users/user.repository';
import { TenantRepository } from '../tenants/tenant.repository';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';

export interface LoginDto {
  email: string;
  password: string;
  tenantId: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  tenantId: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
  tenant: Tenant;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(TenantRepository)
    private tenantRepository: TenantRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Validate tenant
    const tenant = await this.tenantRepository.findByIdentifier(registerDto.tenantId);
    if (!tenant || !tenant.isActive) {
      throw new BadRequestException('Invalid or inactive tenant');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmailAndTenant(
      registerDto.email,
      tenant.id,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 12);

    // Create user
    const user = this.userRepository.create({
      ...registerDto,
      tenantId: tenant.id,
      password: passwordHash,
      emailVerificationToken: uuidv4(),
      status: UserStatus.PENDING_VERIFICATION,
    });

    const savedUser = await this.userRepository.save(user);

    // Send verification email
    await this.emailService.sendVerificationEmail(
      savedUser.email,
      savedUser.emailVerificationToken!,
    );

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);

    return {
      user: this.sanitizeUser(savedUser),
      ...tokens,
      tenant,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Validate tenant
    const tenant = await this.tenantRepository.findByIdentifier(loginDto.tenantId);
    if (!tenant || !tenant.isActive) {
      throw new BadRequestException('Invalid or inactive tenant');
    }

    // Find user
    const user = await this.userRepository.findByEmailAndTenant(
      loginDto.email,
      tenant.id,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
      tenant,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findById(payload.sub);
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        },
        {
          expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m'),
        },
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string, tenantId: string): Promise<void> {
    const tenant = await this.tenantRepository.findByIdentifier(tenantId);
    if (!tenant) {
      // Don't reveal if tenant exists
      return;
    }

    const user = await this.userRepository.findByEmailAndTenant(email, tenant.id);
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    const resetToken = uuidv4();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

    await this.userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    await this.emailService.sendPasswordResetEmail(email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findByResetToken(token);
    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.userRepository.update(user.id, {
      password: passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
      mustChangePassword: false,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findByEmailVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.userRepository.update(user.id, {
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      status: UserStatus.ACTIVE,
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await this.userRepository.update(user.id, {
      password: newPasswordHash,
      mustChangePassword: false,
    });
  }

  async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User): Omit<User, 'password'> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  async validateUser(email: string, password: string, tenantId: string): Promise<User | null> {
    const tenant = await this.tenantRepository.findByIdentifier(tenantId);
    if (!tenant || !tenant.isActive) {
      return null;
    }

    const user = await this.userRepository.findByEmailAndTenant(email, tenant.id);
    if (!user || user.status !== UserStatus.ACTIVE) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}