import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ProductSeeder } from './database/seeders/product.seeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for React frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Run database seeder
  const productSeeder = app.get(ProductSeeder);
  await productSeeder.seed();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
