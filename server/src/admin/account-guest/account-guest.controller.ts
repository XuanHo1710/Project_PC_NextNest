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
    HttpStatus,
    HttpCode,
    Request,
    BadRequestException
} from '@nestjs/common';
import { AccountGuestService } from './account-guest.service';
import { CreateAccountGuestDto } from './dto/create-account-guest.dto';
import { UpdateAccountGuestDto } from './dto/update-account-guest.dto';
import { QueryAccountGuestDto } from './dto/query-account-guest.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('account-guest')
@UseGuards(JwtAuthGuard)
export class AccountGuestController {
    constructor(private readonly accountGuestService: AccountGuestService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createAccountGuestDto: CreateAccountGuestDto) {
        const account = await this.accountGuestService.create(createAccountGuestDto);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Account created successfully',
            data: account,
            timestamp: new Date().toISOString()
        };
    }

    @Get()
    async findAll(@Query() query: QueryAccountGuestDto) {
        const result = await this.accountGuestService.findAll(query);
        return {
            statusCode: HttpStatus.OK,
            message: 'Accounts retrieved successfully',
            data: result.data,
            pagination: result.pagination,
            timestamp: new Date().toISOString()
        };
    }

    @Get('statistics')
    async getStatistics() {
        const stats = await this.accountGuestService.getStatistics();
        return {
            statusCode: HttpStatus.OK,
            message: 'Statistics retrieved successfully',
            data: stats,
            timestamp: new Date().toISOString()
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const account = await this.accountGuestService.findOne(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Account retrieved successfully',
            data: account,
            timestamp: new Date().toISOString()
        };
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateAccountGuestDto: UpdateAccountGuestDto,
        @Request() req: any
    ) {
        const account = await this.accountGuestService.update(id, updateAccountGuestDto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Account updated successfully',
            data: account,
            timestamp: new Date().toISOString()
        };
    }

    @Patch(':id/verify-email')
    async verifyEmail(@Param('id') id: string, @Body('token') token: string) {
        if (!token) {
            throw new BadRequestException('Verification token is required');
        }

        const account = await this.accountGuestService.verifyEmail(token);
        return {
            statusCode: HttpStatus.OK,
            message: 'Email verified successfully',
            data: account,
            timestamp: new Date().toISOString()
        };
    }

    @Patch(':id/activate')
    async activate(@Param('id') id: string) {
        const account = await this.accountGuestService.update(id, {
            accountStatus: 'ACTIVE',
            isActive: true
        });
        return {
            statusCode: HttpStatus.OK,
            message: 'Account activated successfully',
            data: account,
            timestamp: new Date().toISOString()
        };
    }

    @Patch(':id/suspend')
    async suspend(@Param('id') id: string, @Body('reason') reason?: string) {
        const updateData: UpdateAccountGuestDto = {
            accountStatus: 'SUSPENDED',
            isActive: false
        };

        if (reason) {
            updateData.adminNotes = reason;
        }

        const account = await this.accountGuestService.update(id, updateData);
        return {
            statusCode: HttpStatus.OK,
            message: 'Account suspended successfully',
            data: account,
            timestamp: new Date().toISOString()
        };
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req: any) {
        await this.accountGuestService.softDelete(id, req.user?.id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Account deleted successfully',
            timestamp: new Date().toISOString()
        };
    }

    @Post(':id/unlock')
    async unlockAccount(@Param('id') id: string) {
        const account = await this.accountGuestService.update(id, {
            failedLoginAttempts: 0,
            lockedUntil: undefined
        });
        return {
            statusCode: HttpStatus.OK,
            message: 'Account unlocked successfully',
            data: account,
            timestamp: new Date().toISOString()
        };
    }

    @Get(':id/login-history')
    async getLoginHistory(@Param('id') id: string) {
        const account = await this.accountGuestService.findOne(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Login history retrieved successfully',
            data: {
                lastLoginAt: account.lastLoginAt,
                loginCount: account.loginCount,
                lastLoginIP: account.lastLoginIP,
                userAgent: account.userAgent,
                failedLoginAttempts: account.failedLoginAttempts,
                lockedUntil: account.lockedUntil
            },
            timestamp: new Date().toISOString()
        };
    }
}