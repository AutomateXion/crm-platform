import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';

import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // ─── Security ─────────────────────────────────────────────────
  app.use(helmet());
  app.use(compression());

  // ─── CORS ─────────────────────────────────────────────────────
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    credentials: true,
  });

  // ─── Global Validation ────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // strip unknown properties
      forbidNonWhitelisted: false,
      transform: true,           // auto-transform to DTO types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── API Prefix ───────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── Swagger Documentation ────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('CRM Platform API')
      .setDescription('CRM Platform - Core Service API Documentation')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT-auth',
      )
      .addTag('Authentication', 'Login, logout, token management')
      .addTag('Users', 'User management')
      .addTag('User Groups', 'Role management')
      .addTag('Permissions', 'Permission matrix')
      .addTag('Masters', 'Master data management')
      .addTag('Tenants', 'Tenant configuration')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════╗
  ║       CRM Platform - Core API         ║
  ║  Running on: http://localhost:${port}    ║
  ║  Docs:       http://localhost:${port}/api/docs ║
  ╚═══════════════════════════════════════╝
  `);
}

bootstrap();
