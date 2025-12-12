import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModuleOptions, ThrottlerOptionsFactory } from '@nestjs/throttler';
import { RedisOptions } from 'ioredis';

@Injectable()
export class RedisConfig implements ThrottlerOptionsFactory {
  constructor(private configService: ConfigService) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    const ttl = this.configService.get<number>('RATE_LIMIT_TTL', 60);
    const limit = this.configService.get<number>('RATE_LIMIT_LIMIT', 100);

    return [
      {
        ttl: ttl * 1000, // Convert to milliseconds
        limit,
        ignoreUserAgents: [/.*bot.*/gi, /.*crawler.*/gi],
      },
    ];
  }

  getRedisOptions(): RedisOptions {
    return {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      keyPrefix: 'hospital:',
      family: 4,
      keepAlive: 30000,
    };
  }
}