import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('sales');
  await app.listen(process.env.PORT || 3002);
  console.log('✅ Sales Service running on port 3002');
}
bootstrap();
