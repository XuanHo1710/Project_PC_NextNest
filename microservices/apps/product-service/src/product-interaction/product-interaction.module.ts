import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductInteractionService } from './product-interaction.service';
import { ProductInteractionController } from './product-interaction.controller';
import {
  ProductComment,
  ProductCommentSchema,
} from './entities/product-comment.entity';
import {
  ProductReaction,
  ProductReactionSchema,
} from './entities/product-reaction.entity';

import {
  Product,
  AccountGuest,
  AccountGuestSchema,
  ProductSchema,
} from '@project-pc/common';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductComment.name, schema: ProductCommentSchema },
      { name: ProductReaction.name, schema: ProductReactionSchema },
      { name: AccountGuest.name, schema: AccountGuestSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [ProductInteractionController],
  providers: [ProductInteractionService],
})
export class ProductInteractionModule {}
