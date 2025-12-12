import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantRepository {
  constructor(
    @InjectRepository(Tenant)
    private repository: Repository<Tenant>,
  ) {}

  async findByIdentifier(identifier: string): Promise<Tenant | null> {
    return this.repository.findOne({
      where: { identifier },
      relations: ['subscriptions'],
    });
  }

  async findById(id: string): Promise<Tenant | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['subscriptions'],
    });
  }

  async findByEmail(email: string): Promise<Tenant | null> {
    return this.repository.findOne({
      where: { email },
    });
  }

  async create(tenantData: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.repository.create(tenantData);
    return this.repository.save(tenant);
  }

  async save(tenant: Tenant): Promise<Tenant> {
    return this.repository.save(tenant);
  }

  async findAll(): Promise<Tenant[]> {
    return this.repository.find({
      relations: ['subscriptions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActive(): Promise<Tenant[]> {
    return this.repository.find({
      where: { isActive: true },
      relations: ['subscriptions'],
    });
  }
}