import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { ClientJwtAuthGuard } from '../auth/client-jwt-auth.guard';
import { Guest } from 'src/admin/guest/entities/guest.entity';
import { GuestService } from 'src/client/guest/guest.service';

@Controller('guest')
@UseGuards(ClientJwtAuthGuard)
export class GuestController {
    constructor(private readonly guestService: GuestService) { }
    @Get('/profile/:id')
    findOne(@Param('id') id: string) {
        return this.guestService.findOne(id);
    }

    @Patch('/profile/:id')
    updateProfile(@Param('id') id: string, @Body() updateData: Partial<Guest>) {
        return this.guestService.updateProfile(id, updateData);
    }

    // Address Management Routes
    @Post('/profile/:id/addresses')
    addAddress(@Param('id') guestId: string, @Body() addressData: any) {
        return this.guestService.addAddress(guestId, addressData);
    }

    @Patch('/profile/:id/addresses/:addressId')
    updateAddress(
        @Param('id') guestId: string,
        @Param('addressId') addressId: string,
        @Body() updateData: any
    ) {
        return this.guestService.updateAddress(guestId, addressId, updateData);
    }

    @Delete('/profile/:id/addresses/:addressId')
    deleteAddress(
        @Param('id') guestId: string,
        @Param('addressId') addressId: string
    ) {
        return this.guestService.deleteAddress(guestId, addressId);
    }

    @Patch('/profile/:id/addresses/:addressId/default')
    setDefaultAddress(
        @Param('id') guestId: string,
        @Param('addressId') addressId: string
    ) {
        return this.guestService.setDefaultAddress(guestId, addressId);
    }

    // Password Management Route
    @Patch('/profile/:id/password')
    changePassword(
        @Param('id') guestId: string,
        @Body() passwordData: { currentPassword: string; newPassword: string }
    ) {
        return this.guestService.changePassword(
            guestId,
            passwordData.currentPassword,
            passwordData.newPassword
        );
    }
}