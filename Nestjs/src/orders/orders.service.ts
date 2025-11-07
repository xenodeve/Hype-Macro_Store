import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { CreateOrderDto } from './order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const order = new this.orderModel({
      ...createOrderDto,
      userId,
    });
    return order.save();
  }

  async findByOrderId(orderId: string): Promise<Order> {
    const order = await this.orderModel.findOne({ orderId }).exec();
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findUnpaidOrders(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({ 
        userId, 
        paymentStatus: { $in: ['pending', null] }
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async deleteOrder(userId: string, orderId: string): Promise<void> {
    const order = await this.orderModel.findOne({ orderId }).exec();
    
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // ตรวจสอบว่าเป็น order ของ user คนนี้จริงหรือไม่
    if (order.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to delete this order');
    }

    // ลบ order
    await this.orderModel.deleteOne({ orderId }).exec();
  }

  async confirmPayment(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderModel.findOne({ orderId }).exec();
    
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // ตรวจสอบว่าเป็น order ของ user คนนี้จริงหรือไม่
    if (order.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to update this order');
    }

    // อัพเดตสถานะว่ากดยืนยันการชำระเงินแล้ว
    order.hasConfirmedPayment = true;
    return order.save();
  }
}
