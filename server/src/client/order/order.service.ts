import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateOrderDto } from 'src/client/order/dto/create-order.dto';
import { UpdateOrderDto } from 'src/client/order/dto/update-order.dto';
import { Order } from 'src/client/order/entities/order.entity';

@Injectable()
export class OrderService {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) { }

  async createOrder(createOrderDto: CreateOrderDto) {

  }

  async updateOrderStatus(id: string, updateOrderDto: UpdateOrderDto) {

  }

  async updateOrderPayment(id: string, updateOrderDto: UpdateOrderDto) {

  }
}
