import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICE } from '@project-pc/common';

import { Guest } from 'decorators/customize';

@Controller('client/account-guest')
export class AccountGuestController {
  constructor(
    @Inject(MICROSERVICE.AUTH_SERVICE)
    private readonly accountGuestService: ClientProxy,
  ) {}

  @Get('profile-detail')
  getProfileDetail(@Guest() guest: any) {
    return this.accountGuestService.send('account_guest.findOne', {
      id: guest._id,
    });
  }

  @Patch('profile')
  updateProfile(@Guest() guest: any, @Body() body: any) {
    return this.accountGuestService.send('account_guest.update', {
      id: guest._id,
      updateAccountGuestDto: body,
    });
  }

  // ============== ADDRESS MANAGEMENT ==============

  @Get('addresses')
  getAddresses(@Guest() guest: any) {
    return this.accountGuestService.send('account_guest.getAddresses', {
      guestId: guest._id,
    });
  }

  @Post('addresses')
  addAddress(@Guest() guest: any, @Body() addressData: any) {
    return this.accountGuestService.send('account_guest.addAddress', {
      guestId: guest._id,
      address: addressData,
    });
  }

  @Patch('addresses/:addressId')
  updateAddress(
    @Guest() guest: any,
    @Param('addressId') addressId: string,
    @Body() addressData: any,
  ) {
    return this.accountGuestService.send('account_guest.updateAddress', {
      guestId: guest._id,
      addressId,
      address: addressData,
    });
  }

  @Delete('addresses/:addressId')
  deleteAddress(@Guest() guest: any, @Param('addressId') addressId: string) {
    return this.accountGuestService.send('account_guest.deleteAddress', {
      guestId: guest._id,
      addressId,
    });
  }

  @Patch('addresses/:addressId/set-default')
  setDefaultAddress(
    @Guest() guest: any,
    @Param('addressId') addressId: string,
  ) {
    return this.accountGuestService.send('account_guest.setDefaultAddress', {
      guestId: guest._id,
      addressId,
    });
  }

  // ============== FAVORITES / WISHLIST ==============

  @Get('favorites')
  getFavorites(@Guest() guest: any) {
    return this.accountGuestService.send('account_guest.getFavorites', {
      guestId: guest._id,
    });
  }

  @Post('favorites/:productId')
  addToFavorites(@Guest() guest: any, @Param('productId') productId: string) {
    return this.accountGuestService.send('account_guest.addToFavorites', {
      guestId: guest._id,
      productId,
    });
  }

  @Delete('favorites/:productId')
  removeFromFavorites(
    @Guest() guest: any,
    @Param('productId') productId: string,
  ) {
    return this.accountGuestService.send('account_guest.removeFromFavorites', {
      guestId: guest._id,
      productId,
    });
  }

  @Get('favorites/check/:productId')
  isFavorite(@Guest() guest: any, @Param('productId') productId: string) {
    return this.accountGuestService.send('account_guest.isFavorite', {
      guestId: guest._id,
      productId,
    });
  }
}
