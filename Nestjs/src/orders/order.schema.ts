import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export class OrderItem {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  qty: number;

  @Prop()
  image: string;
}

export class Address {
  @Prop()
  fullName: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  district: string;

  @Prop()
  province: string;

  @Prop()
  postalCode: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  orderId: string;

  @Prop({ type: [Object], required: true })
  items: OrderItem[];

  @Prop({ type: Object })
  address: Address;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop({ required: true })
  subtotal: number;

  @Prop({ default: 'pending' })
  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
