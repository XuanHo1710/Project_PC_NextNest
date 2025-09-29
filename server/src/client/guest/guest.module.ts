import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountGuest, AccountGuestSchema } from 'src/admin/account-guest/entities/account-guest.entity';
import { Guest, GuestSchema } from 'src/admin/guest/entities/guest.entity';
import { GuestController } from 'src/client/guest/guest.controller';
import { GuestService } from 'src/client/guest/guest.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Guest.name, schema: GuestSchema },
            { name: AccountGuest.name, schema: AccountGuestSchema }
        ])
    ],
    controllers: [GuestController],
    providers: [GuestService],
    exports: [GuestService]
})
export class GuestModule { }