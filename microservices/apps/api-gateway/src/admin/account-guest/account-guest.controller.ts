import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Types } from 'mongoose';
import {
    MICROSERVICE,
    CreateAccountGuestDto,
    UpdateAccountGuestDto,
} from '@project-pc/common';

@Controller('/admin/account-guest')
export class AccountGuestController {
    constructor(
        @Inject(MICROSERVICE.AUTH_SERVICE)
        private readonly accountGuestService: ClientProxy,
    ) { }

    @Post()
    create(@Body() createAccountGuestDto: CreateAccountGuestDto) {
        return this.accountGuestService.send('account_guest.create', {
            createAccountGuestDto: createAccountGuestDto,
        });
    }

    @Get()
    findAll(@Query() query: any) {
        return this.accountGuestService.send('account_guest.findAll', {
            query: query,
        });
    }

    @Get('/statistics')
    getStatistics() {
        return this.accountGuestService.send('account_guest.getStatistics', {});
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        if (!Types.ObjectId.isValid(id)) {
            return { error: 'ID không hợp lệ' };
        }
        return this.accountGuestService.send('account_guest.findOne', {
            id: id,
        });
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateAccountGuestDto: UpdateAccountGuestDto,
    ) {
        return this.accountGuestService.send('account_guest.update', {
            id: id,
            updateAccountGuestDto: updateAccountGuestDto,
        });
    }

    @Patch(':id/activate')
    activate(@Param('id') id: string) {
        return this.accountGuestService.send('account_guest.activate', {
            id: id,
        });
    }

    @Patch(':id/suspend')
    suspend(@Param('id') id: string, @Body() body: { reason?: string }) {
        return this.accountGuestService.send('account_guest.suspend', {
            id: id,
            reason: body.reason,
        });
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.accountGuestService.send('account_guest.softDelete', {
            id: id,
        });
    }
}
