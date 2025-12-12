import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Tenant } from './entities/tenant.entity';
import { Subscription, SubscriptionStatus, SubscriptionPlan } from './entities/subscription.entity';
import { PlanFeatures } from '../../shared/enums/subscription-plan.enum';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async create(tenantData: Partial<Tenant>, plan: SubscriptionPlan = SubscriptionPlan.STARTER): Promise<Tenant> {
    const identifier = this.generateTenantIdentifier(tenantData.name!);

    // Check if identifier already exists
    const existingTenant = await this.tenantRepository.findOne({
      where: { identifier },
    });
    if (existingTenant) {
      throw new BadRequestException('Tenant with this name already exists');
    }

    const tenant = this.tenantRepository.create({
      ...tenantData,
      identifier,
      isOnTrial: true,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      schemaName: `tenant_${identifier}`,
    });

    const savedTenant = await this.tenantRepository.save(tenant);

    // Create initial subscription
    await this.createSubscription(savedTenant.id, plan);

    return savedTenant;
  }

  async findById(id: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { id },
      relations: ['subscriptions'],
    });
  }

  async findByIdentifier(identifier: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { identifier },
      relations: ['subscriptions'],
    });
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      relations: ['subscriptions'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateData: Partial<Tenant>): Promise<Tenant> {
    const tenant = await this.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // If name is being updated, regenerate identifier
    if (updateData.name && updateData.name !== tenant.name) {
      updateData.identifier = this.generateTenantIdentifier(updateData.name);
    }

    Object.assign(tenant, updateData);
    return this.tenantRepository.save(tenant);
  }

  async activate(id: string): Promise<Tenant> {
    const tenant = await this.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    tenant.isActive = true;
    return this.tenantRepository.save(tenant);
  }

  async deactivate(id: string): Promise<Tenant> {
    const tenant = await this.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    tenant.isActive = false;
    return this.tenantRepository.save(tenant);
  }

  async createSubscription(tenantId: string, plan: SubscriptionPlan): Promise<Subscription> {
    const features = PlanFeatures[plan];

    const subscription = this.subscriptionRepository.create({
      tenantId,
      plan,
      status: SubscriptionStatus.ACTIVE,
      features,
      price: features.price,
      billingCycle: 1, // Monthly by default
      startedAt: new Date(),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      nextBillingAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isAutoRenew: true,
      usageStats: {
        users: 0,
        patients: 0,
        appointments: 0,
        storage: 0,
      },
    });

    return this.subscriptionRepository.save(subscription);
  }

  async getActiveSubscription(tenantId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: {
        tenantId,
        status: SubscriptionStatus.ACTIVE,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async updateSubscription(tenantId: string, plan: SubscriptionPlan): Promise<Subscription> {
    const currentSubscription = await this.getActiveSubscription(tenantId);
    if (!currentSubscription) {
      return this.createSubscription(tenantId, plan);
    }

    const features = PlanFeatures[plan];

    // Update current subscription
    Object.assign(currentSubscription, {
      plan,
      features,
      price: features.price,
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      nextBillingAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return this.subscriptionRepository.save(currentSubscription);
  }

  async cancelSubscription(tenantId: string): Promise<Subscription> {
    const subscription = await this.getActiveSubscription(tenantId);
    if (!subscription) {
      throw new NotFoundException('Active subscription not found');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    subscription.isAutoRenew = false;

    return this.subscriptionRepository.save(subscription);
  }

  async checkSubscriptionLimits(tenantId: string, usageType: string, currentUsage: number): Promise<boolean> {
    const subscription = await this.getActiveSubscription(tenantId);
    if (!subscription) {
      return false;
    }

    const limits = PlanFeatures[subscription.plan];

    switch (usageType) {
      case 'users':
        return limits.maxUsers === -1 || currentUsage < limits.maxUsers;
      case 'patients':
        return limits.maxPatients === -1 || currentUsage < limits.maxPatients;
      case 'appointments':
        return limits.appointments === -1 || currentUsage < limits.appointments;
      case 'storage':
        return limits.storage === -1 || currentUsage < limits.storage;
      default:
        return true;
    }
  }

  async updateUsageStats(tenantId: string, stats: Partial<Record<string, number>>): Promise<void> {
    const subscription = await this.getActiveSubscription(tenantId);
    if (!subscription) {
      return;
    }

    if (!subscription.usageStats) {
      subscription.usageStats = {};
    }

    Object.assign(subscription.usageStats, stats);

    // Check if over limits
    const features = subscription.features as any;
    let isOverLimit = false;

    if (features.maxUsers !== -1 && subscription.usageStats.users > features.maxUsers) {
      isOverLimit = true;
    }
    if (features.maxPatients !== -1 && subscription.usageStats.patients > features.maxPatients) {
      isOverLimit = true;
    }

    subscription.isOverLimit = isOverLimit;
    await this.subscriptionRepository.save(subscription);
  }

  private generateTenantIdentifier(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20) + '-' + Math.random().toString(36).substr(2, 6);
  }
}