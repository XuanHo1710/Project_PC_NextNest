import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountGuest, AccountGuestDocument } from './entities/account-guest.entity';
import { Guest, GuestDocument } from '../guest/entities/guest.entity';
import { CreateAccountGuestDto } from './dto/create-account-guest.dto';
import { UpdateAccountGuestDto } from './dto/update-account-guest.dto';
import { QueryAccountGuestDto } from './dto/query-account-guest.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AccountGuestService {
    constructor(
        @InjectModel(AccountGuest.name) private accountGuestModel: Model<AccountGuestDocument>,
        @InjectModel(Guest.name) private guestModel: Model<GuestDocument>,
    ) { }

    async create(createAccountGuestDto: CreateAccountGuestDto): Promise<AccountGuest> {
        // Check if email already exists
        const existingAccount = await this.accountGuestModel.findOne({
            email: createAccountGuestDto.email,
            deletedAt: { $exists: false }
        });

        if (existingAccount) {
            throw new ConflictException('Email already exists');
        }

        // Check if guestId exists
        const existingGuest = await this.guestModel.findById(createAccountGuestDto.guestId);
        if (!existingGuest) {
            throw new NotFoundException('Guest not found');
        }

        // Check if this guest already has an account
        const existingGuestAccount = await this.accountGuestModel.findOne({
            guestId: createAccountGuestDto.guestId,
            deletedAt: { $exists: false }
        });

        if (existingGuestAccount) {
            throw new ConflictException('Guest already has an account');
        }

        // Hash password if provided
        let hashedPassword: string | undefined;
        if (createAccountGuestDto.password) {
            hashedPassword = await bcrypt.hash(createAccountGuestDto.password, 10);
        }

        // Generate email verification token
        const emailVerificationToken = crypto.randomUUID();
        const emailVerificationExpires = new Date();
        emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24); // 24 hours

        const accountData = {
            ...createAccountGuestDto,
            password: hashedPassword,
            emailVerificationToken,
            emailVerificationExpires,
            accountStatus: 'PENDING',
            termsAcceptedAt: createAccountGuestDto.termsAccepted ? new Date() : undefined,
            privacyPolicyAcceptedAt: createAccountGuestDto.privacyPolicyAccepted ? new Date() : undefined,
        };

        const createdAccount = new this.accountGuestModel(accountData);
        return createdAccount.save();
    }

    // Helper method to create Guest and AccountGuest together
    async createGuestWithAccount(guestData: {
        fullname: string;
        email: string;
        phone?: string;
        avatar?: string;
        gender?: string;
        birthday?: Date;
    }, accountData: {
        password?: string;
        googleId?: string;
        authProvider?: string;
        registrationSource?: string;
        termsAccepted?: boolean;
        privacyPolicyAccepted?: boolean;
        emailNotifications?: boolean;
        smsNotifications?: boolean;
        marketingEmails?: boolean;
    }) {
        // Create Guest first
        const guest = new this.guestModel(guestData);
        const savedGuest = await guest.save();

        // Create AccountGuest
        const accountGuest = await this.create({
            guestId: savedGuest._id.toString(),
            email: guestData.email,
            ...accountData
        });

        return {
            guest: savedGuest,
            account: accountGuest
        };
    }

    async findAll(query: QueryAccountGuestDto) {
        const {
            page = 1,
            limit = 10,
            search,
            accountStatus,
            authProvider,
            isActive,
            isVerified,
            isEmailVerified,
            gender,
            registrationSource,
            createdFrom,
            createdTo,
            lastLoginFrom,
            lastLoginTo,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = query;

        // Build search filter
        const filter: any = { deletedAt: { $exists: false } };

        if (search) {
            filter.$or = [
                { fullname: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        if (accountStatus) filter.accountStatus = accountStatus;
        if (authProvider) filter.authProvider = authProvider;
        if (isActive !== undefined) filter.isActive = isActive;
        if (isVerified !== undefined) filter.isVerified = isVerified;
        if (isEmailVerified !== undefined) filter.isEmailVerified = isEmailVerified;
        if (gender) filter.gender = gender;
        if (registrationSource) filter.registrationSource = registrationSource;

        // Date filters
        if (createdFrom || createdTo) {
            filter.createdAt = {};
            if (createdFrom) filter.createdAt.$gte = new Date(createdFrom);
            if (createdTo) filter.createdAt.$lte = new Date(createdTo);
        }

        if (lastLoginFrom || lastLoginTo) {
            filter.lastLoginAt = {};
            if (lastLoginFrom) filter.lastLoginAt.$gte = new Date(lastLoginFrom);
            if (lastLoginTo) filter.lastLoginAt.$lte = new Date(lastLoginTo);
        }

        const skip = (page - 1) * limit;
        const sortOptions: any = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [data, total] = await Promise.all([
            this.accountGuestModel
                .find(filter)
                .select('-password -emailVerificationToken -resetPasswordToken -twoFactorSecret')
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.accountGuestModel.countDocuments(filter)
        ]);

        return {
            data,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        };
    }

    async findOne(id: string): Promise<AccountGuest> {
        const account = await this.accountGuestModel
            .findOne({ _id: id, deletedAt: { $exists: false } })
            .select('-password -emailVerificationToken -resetPasswordToken -twoFactorSecret')
            .exec();

        if (!account) {
            throw new NotFoundException('Account not found');
        }

        return account;
    }

    async findByEmail(email: string): Promise<AccountGuest | null> {
        return this.accountGuestModel
            .findOne({ email, deletedAt: { $exists: false } })
            .exec();
    }

    async findByGoogleId(googleId: string): Promise<AccountGuest | null> {
        return this.accountGuestModel
            .findOne({ googleId, deletedAt: { $exists: false } })
            .exec();
    }

    async update(id: string, updateAccountGuestDto: UpdateAccountGuestDto): Promise<AccountGuest> {
        const account = await this.accountGuestModel.findOne({
            _id: id,
            deletedAt: { $exists: false }
        });

        if (!account) {
            throw new NotFoundException('Account not found');
        }

        // Hash password if provided
        if (updateAccountGuestDto.password) {
            updateAccountGuestDto.password = await bcrypt.hash(updateAccountGuestDto.password, 10);
        }

        const updatedAccount = await this.accountGuestModel
            .findByIdAndUpdate(
                id,
                updateAccountGuestDto,
                { new: true }
            )
            .select('-password -emailVerificationToken -resetPasswordToken -twoFactorSecret')
            .exec();

        if (!updatedAccount) {
            throw new NotFoundException('Account not found');
        }

        return updatedAccount;
    }

    async verifyEmail(token: string): Promise<AccountGuest> {
        const account = await this.accountGuestModel.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: new Date() },
            deletedAt: { $exists: false }
        });

        if (!account) {
            throw new BadRequestException('Invalid or expired verification token');
        }

        account.isEmailVerified = true;
        account.accountStatus = 'ACTIVE';
        account.emailVerificationToken = undefined;
        account.emailVerificationExpires = undefined;

        return account.save();
    }

    async updateLoginInfo(id: string, loginInfo: { ip?: string; userAgent?: string }): Promise<void> {
        await this.accountGuestModel.findByIdAndUpdate(id, {
            lastLoginAt: new Date(),
            $inc: { loginCount: 1 },
            lastLoginIP: loginInfo.ip,
            userAgent: loginInfo.userAgent,
            failedLoginAttempts: 0 // Reset failed attempts on successful login
        });
    }

    async incrementFailedLoginAttempts(email: string): Promise<void> {
        const account = await this.accountGuestModel.findOne({ email });
        if (account) {
            account.failedLoginAttempts += 1;

            // Lock account after 5 failed attempts for 30 minutes
            if (account.failedLoginAttempts >= 5) {
                account.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
            }

            await account.save();
        }
    }

    async softDelete(id: string, deletedBy?: string): Promise<void> {
        const account = await this.findOne(id);

        await this.accountGuestModel.findByIdAndUpdate(id, {
            deletedAt: new Date(),
            deletedBy: deletedBy || null,
            isActive: false
        });
    }

    async getStatistics() {
        const stats = await this.accountGuestModel.aggregate([
            {
                $match: { deletedAt: { $exists: false } }
            },
            {
                $group: {
                    _id: null,
                    totalAccounts: { $sum: 1 },
                    activeAccounts: {
                        $sum: { $cond: [{ $eq: ['$accountStatus', 'ACTIVE'] }, 1, 0] }
                    },
                    pendingAccounts: {
                        $sum: { $cond: [{ $eq: ['$accountStatus', 'PENDING'] }, 1, 0] }
                    },
                    suspendedAccounts: {
                        $sum: { $cond: [{ $eq: ['$accountStatus', 'SUSPENDED'] }, 1, 0] }
                    },
                    verifiedEmails: {
                        $sum: { $cond: ['$isEmailVerified', 1, 0] }
                    },
                    googleUsers: {
                        $sum: { $cond: [{ $eq: ['$authProvider', 'google'] }, 1, 0] }
                    },
                    localUsers: {
                        $sum: { $cond: [{ $eq: ['$authProvider', 'local'] }, 1, 0] }
                    }
                }
            }
        ]);

        return stats[0] || {
            totalAccounts: 0,
            activeAccounts: 0,
            pendingAccounts: 0,
            suspendedAccounts: 0,
            verifiedEmails: 0,
            googleUsers: 0,
            localUsers: 0
        };
    }

    async findByGuestId(guestId: string): Promise<AccountGuest | null> {
        return this.accountGuestModel
            .findOne({ guestId, deletedAt: { $exists: false } })
            .exec();
    }

    async getGuestWithAccount(guestId: string) {
        const account = await this.accountGuestModel
            .findOne({ guestId, deletedAt: { $exists: false } })
            .populate('guestId')
            .select('-password -emailVerificationToken -resetPasswordToken -twoFactorSecret')
            .exec();

        return account;
    }
}