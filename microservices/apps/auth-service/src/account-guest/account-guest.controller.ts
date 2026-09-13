import { Controller, BadRequestException } from '@nestjs/common';
import { AccountGuestService } from './account-guest.service';
import {
  CreateAccountGuestDto,
  UpdateAccountGuestDto,
} from '@project-pc/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('account-guest')
export class AccountGuestController {
  constructor(private readonly accountGuestService: AccountGuestService) {}

  @MessagePattern('account_guest.create')
  create(@Payload() data: { createAccountGuestDto: CreateAccountGuestDto }) {
    return this.accountGuestService.create(data.createAccountGuestDto);
  }

  @MessagePattern('account_guest.findAll')
  findAll(@Payload() data: { query: any }) {
    return this.accountGuestService.findAll(data.query);
  }

  @MessagePattern('account_guest.getStatistics')
  getStatistics() {
    return this.accountGuestService.getStatistics();
  }

  @MessagePattern('account_guest.findOne')
  findOne(@Payload() data: { id: string }) {
    return this.accountGuestService.findOne(data.id);
  }

  @MessagePattern('account_guest.update')
  update(
    @Payload()
    data: {
      id: string;
      updateAccountGuestDto: UpdateAccountGuestDto;
    },
  ) {
    return this.accountGuestService.update(data.id, data.updateAccountGuestDto);
  }

  @MessagePattern('account_guest.updateMany')
  updateMany(@Payload() data: { dataUpdate: any }) {
    return this.accountGuestService.updateMany(data.dataUpdate);
  }

  @MessagePattern('account_guest.verifyEmail')
  verifyEmail(@Payload() data: { id: string; token: string }) {
    if (!data.token) {
      throw new BadRequestException('Verification token is required');
    }

    return this.accountGuestService.verifyEmail(data.token);
  }

  @MessagePattern('account_guest.activate')
  activate(@Payload() data: { id: string }) {
    return this.accountGuestService.updateAuthState(data.id, {
      accountStatus: 'ACTIVE',
      isActive: true,
    });
  }

  @MessagePattern('account_guest.suspend')
  suspend(@Payload() data: { id: string; reason?: string }) {
    return this.accountGuestService.updateAuthState(data.id, {
      accountStatus: 'SUSPENDED',
      isActive: false,
      ...(data.reason ? { adminNotes: data.reason } : {}),
    });
  }

  // ============== ADDRESS MANAGEMENT ==============

  @MessagePattern('account_guest.getAddresses')
  getAddresses(@Payload() data: { guestId: string }) {
    return this.accountGuestService.getAddresses(data.guestId);
  }

  @MessagePattern('account_guest.addAddress')
  addAddress(@Payload() data: { guestId: string; address: any }) {
    return this.accountGuestService.addAddress(data.guestId, data.address);
  }

  @MessagePattern('account_guest.updateAddress')
  updateAddress(
    @Payload()
    data: {
      guestId: string;
      addressId: string;
      address: any;
    },
  ) {
    return this.accountGuestService.updateAddress(
      data.guestId,
      data.addressId,
      data.address,
    );
  }

  @MessagePattern('account_guest.deleteAddress')
  deleteAddress(@Payload() data: { guestId: string; addressId: string }) {
    return this.accountGuestService.deleteAddress(data.guestId, data.addressId);
  }

  @MessagePattern('account_guest.setDefaultAddress')
  setDefaultAddress(@Payload() data: { guestId: string; addressId: string }) {
    return this.accountGuestService.setDefaultAddress(
      data.guestId,
      data.addressId,
    );
  }

  // ============== FAVORITES / WISHLIST ==============

  @MessagePattern('account_guest.getFavorites')
  getFavorites(@Payload() data: { guestId: string }) {
    return this.accountGuestService.getFavorites(data.guestId);
  }

  @MessagePattern('account_guest.addToFavorites')
  addToFavorites(@Payload() data: { guestId: string; productId: string }) {
    return this.accountGuestService.addToFavorites(
      data.guestId,
      data.productId,
    );
  }

  @MessagePattern('account_guest.removeFromFavorites')
  removeFromFavorites(@Payload() data: { guestId: string; productId: string }) {
    return this.accountGuestService.removeFromFavorites(
      data.guestId,
      data.productId,
    );
  }

  @MessagePattern('account_guest.isFavorite')
  isFavorite(@Payload() data: { guestId: string; productId: string }) {
    return this.accountGuestService.isFavorite(data.guestId, data.productId);
  }
}
