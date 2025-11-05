import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * User Document Type
 * รวม User class และ Mongoose Document methods
 */
export type UserDocument = User & Document;

/**
 * User Schema
 * กำหนดโครงสร้างข้อมูลผู้ใช้ใน MongoDB
 * - timestamps: true = เพิ่ม createdAt, updatedAt อัตโนมัติ
 */
@Schema({ timestamps: true })
export class User {
  // ข้อมูลพื้นฐาน (Basic Info)
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string; // เก็บเป็น hash (bcrypt)

  @Prop({ default: 'user' })
  role: string; // 'user' หรือ 'admin'

  // ที่อยู่จัดส่ง (Shipping Address)
  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  district?: string; // แขวง/ตำบล

  @Prop()
  city?: string; // เขต/อำเภอ

  @Prop()
  province?: string; // จังหวัด

  @Prop()
  postalCode?: string; // รหัสไปรษณีย์

  // ข้อมูลบัตรเครดิต/เดบิต (Payment Card Info)
  // เก็บเฉพาะ 4 หลักท้ายเพื่อความปลอดภัย
  @Prop()
  cardName?: string; // ชื่อบนบัตร

  @Prop()
  cardLast4?: string; // 4 หลักท้าย (เช่น "1234")

  @Prop()
  cardExpiry?: string; // วันหมดอายุ รูปแบบ MM/YY
}

/**
 * สร้าง Mongoose Schema จาก User class
 * ใช้สำหรับ CRUD operations ใน MongoDB
 */
export const UserSchema = SchemaFactory.createForClass(User);
