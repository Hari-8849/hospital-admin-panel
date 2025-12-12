import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantsService } from '../../modules/tenants/tenants.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tenantsService: TenantsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'];

    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    const tenant = await this.tenantsService.findByIdentifier(tenantId);
    if (!tenant || !tenant.isActive) {
      throw new BadRequestException('Invalid or inactive tenant');
    }

    request.tenant = tenant;
    return true;
  }
}