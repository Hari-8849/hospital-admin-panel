import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from './entities/user.entity';
import { UserStatus } from './entities/user.entity';
import { UserRole } from '../../shared/enums/user-role.enum';
import { DefaultPermissions } from '../../shared/enums/user-role.enum';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }

    // Set default permissions based on role
    if (userData.role && !userData.permissions) {
      userData.permissions = DefaultPermissions[userData.role] || [];
    }

    const user = this.userRepository.create({
      ...userData,
      emailVerificationToken: uuidv4(),
      status: UserStatus.PENDING_VERIFICATION,
    });

    return this.userRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findByEmailAndTenant(email: string, tenantId: string): Promise<User | null> {
    return this.userRepository.findByEmailAndTenant(email, tenantId);
  }

  async findAll(tenantId?: string): Promise<User[]> {
    if (tenantId) {
      return this.userRepository.findByTenant(tenantId);
    }
    return this.userRepository.findAll();
  }

  async findByRole(tenantId: string, role: UserRole): Promise<User[]> {
    return this.userRepository.findByRole(tenantId, role);
  }

  async search(tenantId: string, query: string): Promise<User[]> {
    return this.userRepository.search(tenantId, query);
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
      updateData.mustChangePassword = false;
    }

    // Update permissions if role is changed
    if (updateData.role && updateData.role !== user.role) {
      updateData.permissions = DefaultPermissions[updateData.role] || [];
    }

    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async activate(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = UserStatus.ACTIVE;
    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationToken = null;

    return this.userRepository.save(user);
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = UserStatus.INACTIVE;
    return this.userRepository.save(user);
  }

  async suspend(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = UserStatus.SUSPENDED;
    return this.userRepository.save(user);
  }

  async changeRole(id: string, newRole: UserRole): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = newRole;
    user.permissions = DefaultPermissions[newRole] || [];

    return this.userRepository.save(user);
  }

  async updatePermissions(id: string, permissions: string[]): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.permissions = permissions;
    return this.userRepository.save(user);
  }

  async enableTwoFactor(id: string, secret: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorSettings) {
      user.twoFactorSettings = {
        enabled: false,
        backupCodes: [],
      };
    }

    user.twoFactorSettings.secret = secret;
    return this.userRepository.save(user);
  }

  async confirmTwoFactor(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user || !user.twoFactorSettings?.secret) {
      throw new BadRequestException('Two-factor setup not initiated');
    }

    user.twoFactorSettings.enabled = true;
    user.twoFactorSettings.backupCodes = this.generateBackupCodes();

    return this.userRepository.save(user);
  }

  async disableTwoFactor(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.twoFactorSettings) {
      user.twoFactorSettings.enabled = false;
      user.twoFactorSettings.secret = undefined;
      user.twoFactorSettings.backupCodes = [];
    }

    return this.userRepository.save(user);
  }

  async forcePasswordChange(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.mustChangePassword = true;
    return this.userRepository.save(user);
  }

  async updateProfile(id: string, profileData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update allowed profile fields
    const allowedFields = [
      'firstName',
      'lastName',
      'phone',
      'avatar',
      'profile',
      'preferences',
    ];

    const updates: Partial<User> = {};
    allowedFields.forEach(field => {
      if (profileData[field as keyof User] !== undefined) {
        updates[field as keyof User] = profileData[field as keyof User];
      }
    });

    Object.assign(user, updates);
    return this.userRepository.save(user);
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.userRepository.countByTenant(tenantId);
  }

  async countByRole(tenantId: string, role: UserRole): Promise<number> {
    return this.userRepository.countByRole(tenantId, role);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete(id);
  }

  private generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }
}