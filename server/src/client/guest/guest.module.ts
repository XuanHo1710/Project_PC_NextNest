import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountGuest, AccountGuestSchema } from 'src/admin/account-guest/entities/account-guest.entity';
import { Guest, GuestSchema } from 'src/admin/guest/entities/guest.entity';
import { ProductInteraction, ProductInteractionSchema } from 'src/admin/product/entities/product-interaction.entity';
import { Product, ProductSchema } from 'src/admin/product/entities/product.entity';
import { GuestController } from 'src/client/guest/guest.controller';
import { GuestService } from 'src/client/guest/guest.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Guest.name, schema: GuestSchema },
            { name: AccountGuest.name, schema: AccountGuestSchema },
            { name: ProductInteraction.name, schema: ProductInteractionSchema },
            { name: Product.name, schema: ProductSchema }
        ])
    ],
    controllers: [GuestController],
    providers: [GuestService],
    exports: [GuestService]
})
export class GuestModule { }