import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../products/product.schema';

@Injectable()
export class ProductSeeder {
  private readonly logger = new Logger(ProductSeeder.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async seed() {
    try {
      // Check if products already exist
      const count = await this.productModel.countDocuments().exec();
      
      if (count > 0) {
        this.logger.log(`📦 Products already exist (${count} products). Skipping seed.`);
        return;
      }

      // Mock products data
      const mockProducts = [
        {
          name: 'VXE R1 Pro Max',
          description: 'High-performance wireless gaming mouse with 8K polling rate',
          price: 2990,
          image: 'https://ik.imagekit.io/xenodev/Mini%20Project/VXE%20R1%20Pro%20Max?updatedAt=1756072064850',
          stock: 50,
          isActive: true,
        },
        {
          name: 'VXE R1 Pro',
          description: 'Professional wireless gaming mouse with precision sensor',
          price: 1990,
          image: 'https://ik.imagekit.io/xenodev/Mini%20Project/VXE%20R1%20Pro%20v2?updatedAt=1756071791492',
          stock: 100,
          isActive: true,
        },
        {
          name: 'Red Square x VXE R1 SE+',
          description: 'Limited edition collaboration gaming mouse',
          price: 990,
          image: 'https://ik.imagekit.io/xenodev/Mini%20Project/Red%20Square%20x%20VXE%20R1%20SE+%20Black%20no%20text?updatedAt=1756071241251',
          stock: 30,
          isActive: true,
        },
        {
          name: 'Dark Project x VXE R1 Pro Max',
          description: 'Premium collaboration gaming mouse with exclusive design',
          price: 3990,
          image: 'https://ik.imagekit.io/xenodev/Mini%20Project/Dark%20Project%20x%20VXE%20R1%20Pro%20Max?updatedAt=1756069833997',
          stock: 20,
          isActive: true,
        },
      ];

      // Insert mock products
      const createdProducts = await this.productModel.insertMany(mockProducts);
      
      this.logger.log(`✅ Successfully seeded ${createdProducts.length} products!`);
      
      createdProducts.forEach((product) => {
        this.logger.log(`  - ${product.name} (${product.price} THB)`);
      });
    } catch (error) {
      this.logger.error('❌ Error seeding products:', error.message);
    }
  }
}
