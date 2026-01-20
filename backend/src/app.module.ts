import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { StudioModule } from './modules/studio/studio.module';
import { EventsModule } from './modules/events/events.module';
import { FinanceModule } from './modules/finance/finance.module';
import { OutreachModule } from './modules/outreach/outreach.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { dataSourceOptions } from './database/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Sanctuary Gates: Rate Limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        ...dataSourceOptions,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),

    // Event Emitter for async operations
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),

    // Feature Modules
    AuthModule,
    TenantsModule,
    StudioModule,
    EventsModule,
    FinanceModule,
    OutreachModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global JWT Guard (all routes protected by default unless @Public())
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Throttler Guard (Rate Limiting)
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
