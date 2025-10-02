import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/admin/product/entities/product.entity';
import { ProductInteraction, ProductInteractionSchema } from 'src/admin/product/entities/product-interaction.entity';
import { ProductInteractionDetail, ProductInteractionDetailSchema } from 'src/admin/product/entities/product-interaction-detail.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: ProductInteraction.name, schema: ProductInteractionSchema }]),
    MongooseModule.forFeature([{ name: ProductInteractionDetail.name, schema: ProductInteractionDetailSchema }])
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModuleClient { }
