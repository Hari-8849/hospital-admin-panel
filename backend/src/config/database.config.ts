import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_DATABASE'),
      schema: 'public',
      synchronize: this.configService.get<string>('NODE_ENV') === 'development',
      logging: this.configService.get<string>('NODE_ENV') === 'development',
      ssl: this.configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['dist/database/migrations/*{.ts,.js}'],
      migrationsRun: true,
      retryAttempts: 3,
      retryDelay: 3000,
      connectionTimeout: 30000,
      queryTimeout: 30000,
      maxQueryExecutionTime: 1000,
      extra: {
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    };
  }

  // Multi-tenant database configuration
  createTenantTypeOrmOptions(tenantId: string): TypeOrmModuleOptions {
    const tenantSchema = `tenant_${tenantId}`;

    return {
      ...this.createTypeOrmOptions(),
      schema: tenantSchema,
      entities: ['dist/modules/**/entities/*{.ts,.js}'],
      migrations: ['dist/database/tenant-migrations/*{.ts,.js}'],
    };
  }
}