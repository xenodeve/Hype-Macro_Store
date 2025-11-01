import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSeeder } from './seeders/product.seeder';
import { Product, ProductSchema } from '../products/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  providers: [ProductSeeder],
  exports: [ProductSeeder],
})
export class DatabaseModule {}
