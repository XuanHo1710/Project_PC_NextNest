import { Controller } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { Channel, ConsumeMessage } from 'amqplib';

@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @MessagePattern('category.create')
  create(
    @Payload() data: { createCategoryDto: CreateCategoryDto },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.categoryService.create(data.createCategoryDto);
    channel.ack(msg);
    return result;
  }

  @MessagePattern('category.findAll')
  findAll(@Payload() data: { filter?: any }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.categoryService.findAll(data.filter);
    channel.ack(msg);
    return result;
  }

  @MessagePattern('category.updateMany')
  updateMany(@Payload() data: { dataUpdate: any }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.categoryService.updateMany(data.dataUpdate);
    channel.ack(msg);
    return result;
  }

  @MessagePattern('category.findBySlug')
  findBySlug(@Payload() data: { slug: string }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.categoryService.findBySlug(data.slug);
    channel.ack(msg);
    return result;
  }

  @MessagePattern('category.findOne')
  findOne(@Payload() data: { id: string }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.categoryService.findOne(data.id);
    channel.ack(msg);
    return result;
  }

  @MessagePattern('category.update')
  update(
    @Payload() data: { id: string; updateCategoryDto: UpdateCategoryDto },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.categoryService.update(data.id, data.updateCategoryDto);
    channel.ack(msg);
    return result;
  }

  @MessagePattern('category.remove')
  remove(@Payload() data: { id: string }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.categoryService.remove(data.id);
    channel.ack(msg);
    return result;
  }
}
