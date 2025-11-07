import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  findMyOrders(@Request() req) {
    return this.ordersService.findByUserId(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unpaid/list')
  findUnpaidOrders(@Request() req) {
    return this.ordersService.findUnpaidOrders(req.user.userId);
  }

  @Get(':orderId')
  findByOrderId(@Param('orderId') orderId: string) {
    return this.ordersService.findByOrderId(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':orderId')
  deleteOrder(@Request() req, @Param('orderId') orderId: string) {
    return this.ordersService.deleteOrder(req.user.userId, orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':orderId/confirm-payment')
  confirmPayment(@Request() req, @Param('orderId') orderId: string) {
    return this.ordersService.confirmPayment(req.user.userId, orderId);
  }
}
