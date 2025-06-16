import { Module } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { DiscountController } from './discount.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Discount, DiscountSchema } from './entities/discount.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Discount.name, schema: DiscountSchema }])],
  controllers: [DiscountController],
  providers: [DiscountService],
})
export class DiscountModule { }
