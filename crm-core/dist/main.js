"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const helmet_1 = require("helmet");
const compression = require("compression");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
    });
    app.use((0, helmet_1.default)());
    app.use(compression());
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.setGlobalPrefix('api/v1');
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('CRM Platform API')
            .setDescription('CRM Platform - Core Service API Documentation')
            .setVersion('1.0')
            .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
            .addTag('Authentication', 'Login, logout, token management')
            .addTag('Users', 'User management')
            .addTag('User Groups', 'Role management')
            .addTag('Permissions', 'Permission matrix')
            .addTag('Masters', 'Master data management')
            .addTag('Tenants', 'Tenant configuration')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
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
//# sourceMappingURL=main.js.map