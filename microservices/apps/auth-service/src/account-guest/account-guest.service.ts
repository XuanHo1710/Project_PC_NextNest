import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  BadGatewayException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AccountGuest,
  AccountGuestDocument,
} from './entities/account-guest.entity';
import {
  CreateAccountGuestDto,
  UpdateAccountGuestDto,
} from '@project-pc/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountGuestService {
  constructor(
    @InjectModel(AccountGuest.name)
    private accountGuestModel: Model<AccountGuestDocument>,
  ) { }

  async updateAccountUserToken(token: string, id: string) {
    return await this.accountGuestModel.findByIdAndUpdate(
      id,
      { verifyToken: token },
      { new: true },
    );
  }

  async create(
    createAccountGuestDto: CreateAccountGuestDto,
  ): Promise<AccountGuest> {
    // Check if email already exists

    console.log(createAccountGuestDto)
    const existingAccount = await this.accountGuestModel.findOne({
      email: createAccountGuestDto.email,
      deletedAt: { $exists: false },
    });

    if (existingAccount) {
      throw new ConflictException('Email already exists');
    }

    if (!createAccountGuestDto) {
      throw new BadRequestException('Invalid account data');
    }

    // Check if this guest already has an account
    const existingGuestAccount = await this.accountGuestModel.findOne({
      email: createAccountGuestDto.email,
      deletedAt: { $exists: false },
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
    const otpCodeForEmail = Math.floor(100000 + Math.random() * 900000);
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24); // 24 hours

    // Send mail to verify email in here (send emit comment to notification service)

    const accountData = {
      ...createAccountGuestDto,
      password: hashedPassword,
      otpCodeForEmail,
      emailVerificationExpires,
      accountStatus: 'PENDING',
    };

    const createdAccount = new this.accountGuestModel(accountData);
    return createdAccount.save();
  }

  async findAll(query: any) {
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
      sortOrder = 'desc',
    } = query;

    // Build search filter
    const filter: any = { deletedAt: { $exists: false } };

    if (search) {
      filter.$or = [
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
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
        .select(
          '-password -emailVerificationToken -resetPasswordToken -twoFactorSecret',
        )
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.accountGuestModel.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<AccountGuest> {
    const account = await this.accountGuestModel
      .findOne({ _id: id, deletedAt: { $exists: false } })
      .select(
        '-password -emailVerificationToken -resetPasswordToken -twoFactorSecret',
      )
      .exec();

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async findByEmail(email: string): Promise<AccountGuest | null> {
    return this.accountGuestModel
      .findOne({ email, deletedAt: { $exists: false } })
      .lean()
      .exec();
  }

  async findByGoogleId(googleId: string): Promise<AccountGuest | null> {
    return this.accountGuestModel
      .findOne({ googleId, deletedAt: { $exists: false } })
      .exec();
  }

  async update(
    id: string,
    updateAccountGuestDto: UpdateAccountGuestDto,
  ): Promise<AccountGuest> {
    const account = await this.accountGuestModel.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Hash password if provided
    if (updateAccountGuestDto.password) {
      updateAccountGuestDto.password = await bcrypt.hash(
        updateAccountGuestDto.password,
        10,
      );
    }

    const updatedAccount = await this.accountGuestModel
      .findByIdAndUpdate(id, updateAccountGuestDto, { new: true })
      .select(
        '-password -emailVerificationToken -resetPasswordToken -twoFactorSecret',
      )
      .exec();

    if (!updatedAccount) {
      throw new NotFoundException('Account not found');
    }

    return updatedAccount;
  }

  async updateMany(dataUpdate: any) {
    const type = dataUpdate.typeUpdate.split(':')[0];
    switch (type) {
      case 'delete': {
        return await this.accountGuestModel.updateMany(
          { _id: { $in: dataUpdate.ids } },
          {
            deletedAt: new Date(),
            isActive: false,
            accountStatus: 'DELETED'
          }
        );
      }
      case 'update': {
        const keyUpdate = dataUpdate.typeUpdate.split(':')[1].split('_')[0]; // vd: accountStatus
        const valueUpdate = dataUpdate.typeUpdate.split(':')[1].split('_')[1]; // vd: ACTIVE

        const update = {};
        update[keyUpdate] = valueUpdate;

        return await this.accountGuestModel.updateMany(
          { _id: { $in: dataUpdate.ids } },
          update,
        );
      }
    }
    return null;
  }

  async verifyEmail(token: string): Promise<AccountGuest> {
    const account = await this.accountGuestModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
      deletedAt: { $exists: false },
    });

    if (!account) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    account.isEmailVerified = true;
    account.accountStatus = 'ACTIVE';
    account.emailVerificationExpires = undefined;

    return account.save();
  }

  async updateLoginInfo(id: string): Promise<void> {
    const loginDate = new Date();
    loginDate.setHours(0, 0, 0, 0);

    const result = await this.accountGuestModel.updateOne(
      {
        id: id,
        'loginInformation.loginAt': loginDate,
      },
      {
        $inc: { 'loginInformation.$.loginCount': 1 },
      },
    );

    if (result.matchedCount === 0) {
      await this.accountGuestModel.updateOne(
        { id: id },
        {
          $push: {
            loginInformation: {
              loginAt: loginDate,
              loginCount: 1,
            },
          },
        },
      );
    }
  }

  async softDelete(id: string, deletedBy?: string): Promise<void> {
    const account = await this.findOne(id);

    await this.accountGuestModel.findByIdAndUpdate(id, {
      deletedAt: new Date(),
      deletedBy: deletedBy || null,
      isActive: false,
    });
  }

  async getStatistics() {
    const stats = await this.accountGuestModel.aggregate([
      {
        $match: { deletedAt: { $exists: false } },
      },
      {
        $group: {
          _id: null,
          totalAccounts: { $sum: 1 },
          activeAccounts: {
            $sum: { $cond: [{ $eq: ['$accountStatus', 'ACTIVE'] }, 1, 0] },
          },
          pendingAccounts: {
            $sum: { $cond: [{ $eq: ['$accountStatus', 'PENDING'] }, 1, 0] },
          },
          suspendedAccounts: {
            $sum: { $cond: [{ $eq: ['$accountStatus', 'SUSPENDED'] }, 1, 0] },
          },
          verifiedEmails: {
            $sum: { $cond: ['$isEmailVerified', 1, 0] },
          },
          googleUsers: {
            $sum: { $cond: [{ $eq: ['$authProvider', 'google'] }, 1, 0] },
          },
          localUsers: {
            $sum: { $cond: [{ $eq: ['$authProvider', 'local'] }, 1, 0] },
          },
        },
      },
    ]);

    return (
      stats[0] || {
        totalAccounts: 0,
        activeAccounts: 0,
        pendingAccounts: 0,
        suspendedAccounts: 0,
        verifiedEmails: 0,
        googleUsers: 0,
        localUsers: 0,
      }
    );
  }

  async getGuestById(guestId: string) {
    const account = await this.accountGuestModel
      .findOne({ _id: guestId, deletedAt: { $exists: false } })
      .select(
        '-password -emailVerificationToken -resetPasswordToken -twoFactorSecret',
      )
      .exec();

    return account;
  }
}
