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
    @Inject(MICROSERVICE.ACCOUNT_GUEST_SERVICE)
    private readonly accountGuestService: ClientProxy,
  ) {}

  @Post()
  create(@Body() createAccountGuestDto: CreateAccountGuestDto) {
    return this.accountGuestService.send(
      'account_guest.create',
      createAccountGuestDto,
    );
  }

  @Get()
  findAll(@Query() query: any) {
    return this.accountGuestService.send('account_guest.findAll', query);
  }

  @Get('statistics')
  getStatistics() {
    return this.accountGuestService.send('account_guest.getStatistics', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountGuestService.send('account_guest.findOne', id);
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
    return this.accountGuestService.send('account_guest.update', {
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

    return this.accountGuestService.send('account_guest.update', {
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

  @Get(':id/login-history')
  getLoginHistory(@Param('id') id: string) {
    return this.accountGuestService.send('account_guest.getLoginHistory', id);
  }
}
