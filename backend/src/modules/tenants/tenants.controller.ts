import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
  ValidationPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';

@ApiTags('tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({
    status: 201,
    description: 'Tenant successfully created',
  })
  async create(@Body(ValidationPipe) createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiResponse({
    status: 200,
    description: 'List of all tenants',
  })
  async findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({
    status: 200,
    description: 'Tenant details',
  })
  async findOne(@Param('id') id: string) {
    return this.tenantsService.findById(id);
  }

  @Get(':id/subscription')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Get tenant subscription' })
  @ApiResponse({
    status: 200,
    description: 'Tenant subscription details',
  })
  async getSubscription(@Param('id') id: string) {
    return this.tenantsService.getActiveSubscription(id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Update tenant' })
  @ApiResponse({
    status: 200,
    description: 'Tenant updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Put(':id/subscription')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Update tenant subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully',
  })
  async updateSubscription(
    @Param('id') id: string,
    @Body(ValidationPipe) updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.tenantsService.updateSubscription(id, updateSubscriptionDto.plan);
  }

  @Put(':id/activate')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Activate tenant' })
  @ApiResponse({
    status: 200,
    description: 'Tenant activated successfully',
  })
  async activate(@Param('id') id: string) {
    return this.tenantsService.activate(id);
  }

  @Put(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Deactivate tenant' })
  @ApiResponse({
    status: 200,
    description: 'Tenant deactivated successfully',
  })
  async deactivate(@Param('id') id: string) {
    return this.tenantsService.deactivate(id);
  }

  @Delete(':id/subscription')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Cancel tenant subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
  })
  async cancelSubscription(@Param('id') id: string) {
    return this.tenantsService.cancelSubscription(id);
  }

  @Get(':id/limits')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Check subscription limits' })
  @ApiResponse({
    status: 200,
    description: 'Subscription limits status',
  })
  async checkLimits(
    @Param('id') id: string,
    @Query('type') usageType: string,
    @Query('current') currentUsage: number,
  ) {
    const isWithinLimit = await this.tenantsService.checkSubscriptionLimits(
      id,
      usageType,
      parseInt(currentUsage.toString()),
    );

    return { isWithinLimit, usageType, currentUsage };
  }
}