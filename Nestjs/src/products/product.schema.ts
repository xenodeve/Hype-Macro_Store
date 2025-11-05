import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Product Document Type
 * รวม Product class และ Mongoose Document methods
 */
export type ProductDocument = Product & Document;

/**
 * Product Schema
 * กำหนดโครงสร้างข้อมูลสินค้าใน MongoDB
 * - timestamps: true = เพิ่ม createdAt, updatedAt อัตโนมัติ
 */
@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  id: string; // Product ID (custom, ไม่ใช่ MongoDB _id)

  @Prop({ required: true })
  name: string; // ชื่อสินค้า

  @Prop({ required: true })
  price: number; // ราคา (บาท)

  @Prop({ required: true })
  image: string; // URL รูปภาพ

  @Prop({ default: '' })
  description: string; // รายละเอียดสินค้า

  @Prop({ default: 0 })
  stock: number; // จำนวนคงเหลือ

  @Prop({ default: 'mouse' })
  category: string; // หมวดหมู่ (mouse, keyboard, headset, etc.)

  @Prop({ default: true })
  isActive: boolean; // สถานะเปิด/ปิดการขาย
}

/**
 * สร้าง Mongoose Schema จาก Product class
 * ใช้สำหรับ CRUD operations ใน MongoDB
 */
export const ProductSchema = SchemaFactory.createForClass(Product);
