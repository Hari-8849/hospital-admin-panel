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

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../shared/guards/tenant.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { User } from '../../shared/decorators/user.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
  })
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
  })
  async findAll(@Tenant() tenant: any) {
    return this.usersService.findAll(tenant.id);
  }

  @Get('search')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Search users' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
  })
  async search(@Query('q') query: string, @Tenant() tenant: any) {
    return this.usersService.search(tenant.id, query);
  }

  @Get('role/:role')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Get users by role' })
  @ApiResponse({
    status: 200,
    description: 'Users with specified role',
  })
  async findByRole(@Param('role') role: UserRole, @Tenant() tenant: any) {
    return this.usersService.findByRole(tenant.id, role);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile',
  })
  async getProfile(@User() user: any) {
    return this.usersService.findById(user.id);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User details',
  })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  async updateProfile(@User() user: any, @Body(ValidationPipe) updateProfileDto: Partial<UpdateUserDto>) {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id/role')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
  })
  async updateRole(
    @Param('id') id: string,
    @Body(ValidationPipe) updateRoleDto: UpdateRoleDto,
  ) {
    return this.usersService.changeRole(id, updateRoleDto.role);
  }

  @Put(':id/permissions')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user permissions' })
  @ApiResponse({
    status: 200,
    description: 'User permissions updated successfully',
  })
  async updatePermissions(
    @Param('id') id: string,
    @Body(ValidationPipe) updatePermissionsDto: UpdatePermissionsDto,
  ) {
    return this.usersService.updatePermissions(id, updatePermissionsDto.permissions);
  }

  @Put(':id/activate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Activate user' })
  @ApiResponse({
    status: 200,
    description: 'User activated successfully',
  })
  async activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }

  @Put(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiResponse({
    status: 200,
    description: 'User deactivated successfully',
  })
  async deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Put(':id/suspend')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Suspend user' })
  @ApiResponse({
    status: 200,
    description: 'User suspended successfully',
  })
  async suspend(@Param('id') id: string) {
    return this.usersService.suspend(id);
  }

  @Put(':id/force-password-change')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Force user to change password' })
  @ApiResponse({
    status: 200,
    description: 'User must change password on next login',
  })
  async forcePasswordChange(@Param('id') id: string) {
    return this.usersService.forcePasswordChange(id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  async remove(@Param('id') id: string) {
    await this.usersService.delete(id);
    return { message: 'User deleted successfully' };
  }

  @Get('stats/counts')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Get user count statistics' })
  @ApiResponse({
    status: 200,
    description: 'User statistics',
  })
  async getStats(@Tenant() tenant: any) {
    const totalCount = await this.usersService.countByTenant(tenant.id);
    const doctorCount = await this.usersService.countByRole(tenant.id, UserRole.DOCTOR);
    const nurseCount = await this.usersService.countByRole(tenant.id, UserRole.NURSE);
    const pharmacistCount = await this.usersService.countByRole(tenant.id, UserRole.PHARMACIST);
    const labTechCount = await this.usersService.countByRole(tenant.id, UserRole.LAB_TECHNICIAN);
    const receptionistCount = await this.usersService.countByRole(tenant.id, UserRole.RECEPTIONIST);

    return {
      total: totalCount,
      doctors: doctorCount,
      nurses: nurseCount,
      pharmacists: pharmacistCount,
      labTechnicians: labTechCount,
      receptionists: receptionistCount,
    };
  }
}