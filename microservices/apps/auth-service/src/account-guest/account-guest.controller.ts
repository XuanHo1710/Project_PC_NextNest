import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AccountGuestService } from './account-guest.service';
import { CreateAccountGuestDto } from './dto/create-account-guest.dto';
import { UpdateAccountGuestDto } from './dto/update-account-guest.dto';
import { QueryAccountGuestDto } from './dto/query-account-guest.dto';

@Controller('account-guest')
export class AccountGuestController {
  constructor(private readonly accountGuestService: AccountGuestService) {}

  @Post()
  create(@Body() createAccountGuestDto: CreateAccountGuestDto) {
    return this.accountGuestService.create(createAccountGuestDto);
  }

  @Patch('/update-token')
  updateAccountEmployeeToken(token: string, id: string) {
    return this.accountGuestService.updateAccountUserToken(token, id);
  }

  @Get()
  findAll(@Query() query: QueryAccountGuestDto) {
    return this.accountGuestService.findAll(query);
  }

  @Get('statistics')
  getStatistics() {
    return this.accountGuestService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountGuestService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccountGuestDto: UpdateAccountGuestDto,
    @Request() req: any,
  ) {
    return this.accountGuestService.update(id, updateAccountGuestDto);
  }

  @Patch(':id/verify-email')
  verifyEmail(@Param('id') id: string, @Body('token') token: string) {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }

    return this.accountGuestService.verifyEmail(token);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.accountGuestService.update(id, {
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

    return this.accountGuestService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.accountGuestService.softDelete(id, req.user?.id);
  }

  @Get(':id/login-history')
  getLoginHistory(@Param('id') id: string) {
    return this.accountGuestService.findOne(id);
  }
}
