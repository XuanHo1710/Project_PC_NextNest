import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateAccountGuestDto,
  MICROSERVICE,
  UpdateAccountGuestDto,
} from '@project-pc/common';

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

  @Post()
  create(@Body() createAccountGuestDto: CreateAccountGuestDto) {
    return this.accountGuestService.send(
      'account_guest.create',
      createAccountGuestDto,
    );
  }

  @Get()
  findAll(@Query() query: any) {
    return this.accountGuestService.send('account_guest.findAll', {
      query: query,
    });
  }

  @Get('statistics')
  getStatistics() {
    return this.accountGuestService.send('account_guest.getStatistics', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountGuestService.send('account_guest.findOne', { id: id });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccountGuestDto: UpdateAccountGuestDto,
  ) {
    return this.accountGuestService.send('account_guest.update', {
      id,
      ...updateAccountGuestDto,
    });
  }

  @Patch(':id/verify-email')
  verifyEmail(@Param('id') id: string, @Body('token') token: string) {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }

    return this.accountGuestService.send('account_guest.verifyEmail', {
      id,
      token,
    });
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.accountGuestService.send('account_guest.activate', {
      accountStatus: 'ACTIVE',
      isActive: true,
    });
  }

  @Patch(':id/suspend')
  suspend(@Param('id') id: string, @Body('reason') reason?: string) {
    const updateData: UpdateAccountGuestDto = {
      accountStatus: 'SUSPENDED',
      isActive: false,
    };

    if (reason) {
      updateData.adminNotes = reason;
    }

    return this.accountGuestService.send('account_guest.suspend', {
      id,
      ...updateData,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Guest() user: any) {
    return this.accountGuestService.send('account_guest.softDelete', {
      id,
      userId: user?._id,
    });
  }
}
