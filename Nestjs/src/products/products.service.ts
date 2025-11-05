import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { CreateProductDto, UpdateProductDto } from './product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = new this.productModel(createProductDto);
    return product.save();
  }

  async findAll(): Promise<Product[]> {
    const products = await this.productModel.find().exec();
    // Transform _id to id for frontend compatibility
    return products.map((product) => ({
      id: (product as any)._id.toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      stock: product.stock,
      category: product.category,
      isActive: product.isActive,
    }));
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    // Transform _id to id for frontend compatibility
    return {
      id: (product as any)._id.toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      stock: product.stock,
      category: product.category,
      isActive: product.isActive,
    } as Product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    // Transform _id to id for frontend compatibility
    return {
      id: (product as any)._id.toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      stock: product.stock,
      category: product.category,
      isActive: product.isActive,
    } as Product;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
  }
}
