import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { BrandService } from './brand.service';
import {
  CreateBrandDto,
  UpdateBrandDto,
  SearchBrandDto,
} from '@project-pc/common';
import { Channel, ConsumeMessage } from 'amqplib';

@Controller()
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @MessagePattern('brand.create')
  create(
    @Payload() data: { createBrandDto: CreateBrandDto },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.brandService.createBrand(data.createBrandDto);
    channel.ack(msg);
    return result;
  }

  @MessagePattern('brand.findAll')
  findAll(
    @Payload() data: { searchDto?: SearchBrandDto },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.brandService.findAllBrands(data?.searchDto);
    channel.ack(msg);
    return result;
  }

  @MessagePattern('brand.findBySlug')
  findBySlug(@Payload() data: { slug: string }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.brandService.findBySlug(data.slug);
    channel.ack(msg);
    return result;
  }

  @MessagePattern('brand.findOne')
  findOne(@Payload() data: { id: string }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.brandService.findOneBrand(data.id);
    channel.ack(msg);
    return result;
  }

  @MessagePattern('brand.update')
  update(
    @Payload() data: { id: string; updateBrandDto: UpdateBrandDto },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.brandService.updateBrand(data.id, data.updateBrandDto);
    channel.ack(msg);
    return result;
  }

  @MessagePattern('brand.remove')
  remove(@Payload() data: { id: string }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.brandService.removeBrand(data.id);
    channel.ack(msg);
    return result;
  }

  @MessagePattern('brand.search')
  search(
    @Payload() data: { searchDto: SearchBrandDto },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.brandService.findAllBrands(data.searchDto);
    channel.ack(msg);
    return result;
  }

  @MessagePattern('brand.updateMany')
  updateMany(
    @Payload() data: { ids: string[]; typeUpdate: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.brandService.updateManyBrands(
      data.ids,
      data.typeUpdate,
    );
    channel.ack(msg);
    return result;
  }
}
