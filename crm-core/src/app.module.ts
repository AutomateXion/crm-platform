import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PermissionsModule } from './permissions/permissions.module';
import { MastersModule } from './masters/masters.module';
import { SuperAdminModule } from './superadmin/superadmin.module';
import { TenantsModule } from './tenants/tenants.module';
import { AuditModule } from './audit/audit.module';
import { ContactsInlineModule } from './contacts/contacts.module';

@Module({
  imports: [
    // ─── Config ─────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ─── PostgreSQL ──────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        database: config.get('DB_NAME', 'crm_core'),
        username: config.get('DB_USER', 'crm_user'),
        password: config.get('DB_PASS', 'crm_password_2024'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: config.get('NODE_ENV') === 'development',
        ssl: config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        extra: {
          max: 20,               // connection pool size
          idleTimeoutMillis: 30000,
        },
      }),
    }),

    // ─── MongoDB (Audit Trail) ───────────────────────────────────
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get('MONGO_URI', 'mongodb://localhost:27017/crm_audit'),
        serverSelectionTimeoutMS: 5000,
        retryAttempts: 2,
        retryDelay: 2000,
        connectionFactory: (connection: any) => {
          connection.on('error', (err: any) => {
            console.warn('[Mongo] connection error (audit logging unavailable):', err?.message);
          });
          return connection;
        },
        connectionErrorFactory: (error: any) => {
          console.warn('[Mongo] could not connect (continuing without audit):', error?.message);
          return error;
        },
      }),
    }),



    // ─── Rate Limiting ───────────────────────────────────────────
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 10000, limit: 100 },
      { name: 'long', ttl: 60000, limit: 300 },
    ]),

    // ─── Feature Modules ─────────────────────────────────────────
    AuthModule,
    UsersModule,
    PermissionsModule,
    MastersModule,
    TenantsModule,
    SuperAdminModule,
    AuditModule,
    ContactsInlineModule,
  ],
})
export class AppModule {}
