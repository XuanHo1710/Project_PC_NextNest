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

  @MessagePattern('account_guest.verifyEmail')
  verifyEmail(@Payload() data: { id: string; token: string }) {
    if (!data.token) {
      throw new BadRequestException('Verification token is required');
    }

    return this.accountGuestService.verifyEmail(data.token);
  }

  @MessagePattern('account_guest.activate')
  activate(@Payload() data: { id: string }) {
    return this.accountGuestService.update(data.id, {
      accountStatus: 'ACTIVE',
      isActive: true,
    });
  }

  @MessagePattern('account_guest.suspend')
  suspend(@Payload() data: { id: string; reason?: string }) {
    const updateData: UpdateAccountGuestDto = {
      accountStatus: 'SUSPENDED',
      isActive: false,
    };

    if (data.reason) {
      updateData.adminNotes = data.reason;
    }

    return this.accountGuestService.update(data.id, updateData);
  }

  @MessagePattern('account_guest.softDelete')
  remove(@Payload() data: { id: string; userId: string }) {
    return this.accountGuestService.softDelete(data.id, data.userId);
  }
}
