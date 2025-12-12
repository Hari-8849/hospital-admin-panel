import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['tenant'],
    });
  }

  async findByEmailAndTenant(email: string, tenantId: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email, tenantId },
      relations: ['tenant'],
    });
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.repository.findOne({
      where: { emailVerificationToken: token },
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.repository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() } as any,
      },
    });
  }

  async findByTenant(tenantId: string, includeInactive: boolean = false): Promise<User[]> {
    const whereClause: any = { tenantId };
    if (!includeInactive) {
      whereClause.status = 'ACTIVE';
    }

    return this.repository.find({
      where: whereClause,
      relations: ['tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByRole(tenantId: string, role: string): Promise<User[]> {
    return this.repository.find({
      where: { tenantId, role, status: 'ACTIVE' },
      relations: ['tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async update(id: string, updateData: Partial<User>): Promise<void> {
    await this.repository.update(id, updateData);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.repository.update(id, { lastLoginAt: new Date() });
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.repository.count({
      where: { tenantId, status: 'ACTIVE' },
    });
  }

  async countByRole(tenantId: string, role: string): Promise<number> {
    return this.repository.count({
      where: { tenantId, role, status: 'ACTIVE' },
    });
  }

  async findAll(): Promise<User[]> {
    return this.repository.find({
      relations: ['tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  async search(tenantId: string, query: string): Promise<User[]> {
    return this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.tenant', 'tenant')
      .where('user.tenantId = :tenantId', { tenantId })
      .andWhere(
        '(user.firstName ILIKE :query OR user.lastName ILIKE :query OR user.email ILIKE :query)',
        { query: `%${query}%` }
      )
      .andWhere('user.status = :status', { status: 'ACTIVE' })
      .orderBy('user.firstName', 'ASC')
      .getMany();
  }
}