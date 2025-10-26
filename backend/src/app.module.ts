import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

// Common modules
import { PrismaModule } from './common/prisma/prisma.module';
import { LoggerModule } from './common/logger/logger.module';
import { MetricsModule } from './common/metrics/metrics.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MarketModule } from './modules/market/market.module';
import { TradingModule } from './modules/trading/trading.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AiModule } from './modules/ai/ai.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';

// Guards and filters
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// Configuration
import { validationSchema } from './config/validation.schema';

@Module({
  imports: [
    // Configuration module with validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationSchema,
    }),

    // Rate limiting (DDoS protection)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('RATE_LIMIT_WINDOW_MS', 60000),
            limit: config.get<number>('RATE_LIMIT_MAX_REQUESTS', 100),
          },
        ],
      }),
    }),

    // Caching with Redis
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL', 'redis://localhost:6379');
        return {
          store: await redisStore({
            url: redisUrl,
            ttl: 60 * 1000, // 1 minute default TTL
          }),
        };
      },
    }),

    // Job queue with BullMQ
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_URL', 'redis://localhost:6379').includes('redis://')
            ? new URL(config.get<string>('REDIS_URL')).hostname
            : 'localhost',
          port: config.get<string>('REDIS_URL', 'redis://localhost:6379').includes('redis://')
            ? parseInt(new URL(config.get<string>('REDIS_URL')).port) || 6379
            : 6379,
        },
      }),
    }),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Common modules
    PrismaModule,
    LoggerModule,
    MetricsModule,

    // Feature modules
    AuthModule,
    UsersModule,
    MarketModule,
    TradingModule,
    ContractsModule,
    BlockchainModule,
    NotificationsModule,
    AiModule,
    AdminModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    // Global guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global filters
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
