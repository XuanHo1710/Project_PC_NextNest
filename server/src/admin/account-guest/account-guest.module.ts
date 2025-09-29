import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountGuestService } from './account-guest.service';
import { AccountGuestController } from './account-guest.controller';
import { AccountGuest, AccountGuestSchema } from './entities/account-guest.entity';
import { Guest, GuestSchema } from '../guest/entities/guest.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: AccountGuest.name, schema: AccountGuestSchema },
            { name: Guest.name, schema: GuestSchema }
        ])
    ],
    controllers: [AccountGuestController],
    providers: [AccountGuestService],
    exports: [AccountGuestService]
})
export class AccountGuestModule { }