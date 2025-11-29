import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ProductSeeder } from './database/seeders/product.seeder';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

// Export createApp for serverless deployment
export async function createApp() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
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

  // Serve static files (uploaded slips) - only for standalone mode
  if (process.env.NODE_ENV !== 'production') {
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
      prefix: '/uploads/',
    });
  }

  return app;
}

async function bootstrap() {
  const app = await createApp();

  // Run database seeder only in development
  if (process.env.NODE_ENV !== 'production') {
    const productSeeder = app.get(ProductSeeder);
    await productSeeder.seed();
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}

// Only run bootstrap if this file is executed directly
if (require.main === module) {
  bootstrap();
}

