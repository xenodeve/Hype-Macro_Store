import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductSeeder } from './database/seeders/product.seeder';

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  const app = await NestFactory.create(AppModule);
  const productSeeder = app.get(ProductSeeder);

  try {
    await productSeeder.seed();
    console.log('\n✅ Seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

seed();
