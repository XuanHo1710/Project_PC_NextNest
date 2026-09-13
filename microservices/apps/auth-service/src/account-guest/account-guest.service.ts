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
import * as crypto from 'crypto';

@Injectable()
export class AccountGuestService {
  constructor(
    @InjectModel(AccountGuest.name)
    private accountGuestModel: Model<AccountGuestDocument>,
  ) {}

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
    createAccountGuestDto.email = String(createAccountGuestDto.email || '')
      .trim()
      .toLowerCase();

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
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const otpCodeForEmail = crypto.randomInt(100000, 1000000);
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24); // 24 hours

    const accountData = {
      ...createAccountGuestDto,
      email: String(createAccountGuestDto.email || '')
        .trim()
        .toLowerCase(),
      password: hashedPassword,
      otpCodeForEmail,
      emailVerificationToken,
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

    // Clamp pagination to sane bounds
    const safePage = Math.min(Math.max(parseInt(page, 10) || 1, 1), 10000);
    const safeLimit = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100,
    );

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

    const skip = (safePage - 1) * safeLimit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.accountGuestModel
        .find(filter)
        .select(
          '-password -emailVerificationToken -resetPasswordToken -twoFactorSecret -otpCodeForEmail -verifyToken',
        )
        .sort(sortOptions)
        .skip(skip)
        .limit(safeLimit)
        .exec(),
      this.accountGuestModel.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        currentPage: safePage,
        totalPages: Math.ceil(total / safeLimit),
        totalItems: total,
        itemsPerPage: safeLimit,
        hasNextPage: safePage < Math.ceil(total / safeLimit),
        hasPrevPage: safePage > 1,
      },
    };
  }

  async findOne(id: string): Promise<AccountGuest> {
    const account = await this.accountGuestModel
      .findOne({ _id: id, deletedAt: { $exists: false } })
      .select(
        '-password -emailVerificationToken -resetPasswordToken -twoFactorSecret -otpCodeForEmail -verifyToken',
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

    // Mass-assignment protection: only profile fields may pass through the
    // generic update. Status/verified/points/auth fields must go through
    // dedicated flows (updateAuthState, verifyEmail, ...).
    const allowed = [
      'fullname',
      'avatar',
      'gender',
      'phone',
      'address',
      'dateOfBirth',
    ];
    const picked: Record<string, unknown> = {};
    for (const key of allowed) {
      const value = (updateAccountGuestDto as any)?.[key];
      if (value !== undefined) {
        picked[key] = value;
      }
    }

    if (Object.keys(picked).length === 0) {
      throw new BadRequestException(
        'Không có trường hợp lệ để cập nhật tài khoản',
      );
    }

    const updatedAccount = await this.accountGuestModel
      .findByIdAndUpdate(id, picked, { new: true })
      .select('-password -emailVerificationToken -resetPasswordToken -twoFactorSecret')
      .exec();

    if (!updatedAccount) {
      throw new NotFoundException('Account not found');
    }

    return updatedAccount;
  }

  /**
   * Dedicated, allowlisted state transitions used by trusted internal flows
   * (Google account linking, admin activate/suspend). Never expose this
   * directly to user-controlled payloads.
   */
  async updateAuthState(
    id: string,
    patch: {
      googleId?: string;
      authProvider?: string;
      isEmailVerified?: boolean;
      accountStatus?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
      isActive?: boolean;
      adminNotes?: string;
    },
  ): Promise<AccountGuest> {
    const allowed = [
      'googleId',
      'authProvider',
      'isEmailVerified',
      'accountStatus',
      'isActive',
      'adminNotes',
    ] as const;

    const picked: Record<string, unknown> = {};
    for (const key of allowed) {
      const value = (patch as any)?.[key];
      if (value !== undefined) {
        picked[key] = value;
      }
    }

    if (Object.keys(picked).length === 0) {
      throw new BadRequestException('Không có trường hợp lệ để cập nhật');
    }

    const updatedAccount = await this.accountGuestModel
      .findByIdAndUpdate(new Types.ObjectId(id), picked, { new: true })
      .select('-password -emailVerificationToken -resetPasswordToken -twoFactorSecret')
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
            accountStatus: 'DELETED',
          },
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
    account.emailVerificationToken = undefined;
    account.emailVerificationExpires = undefined;

    return account.save();
  }

  async regenerateVerificationToken(
    email: string,
  ): Promise<{ token: string; fullname: string }> {
    const account = await this.accountGuestModel.findOne({
      email,
      deletedAt: { $exists: false },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const newToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    account.emailVerificationToken = newToken;
    account.emailVerificationExpires = expires;
    await account.save();

    return { token: newToken, fullname: account.fullname };
  }

  async updateLoginInfo(id: string): Promise<void> {
    const loginDate = new Date();
    loginDate.setHours(0, 0, 0, 0);

    // mongoose v9 mis-types positional-array filters/updates; runtime is valid
    const result = await this.accountGuestModel.updateOne(
      {
        _id: new Types.ObjectId(id),
        'loginInformation.loginAt': loginDate,
      } as any,
      {
        $inc: { 'loginInformation.$.loginCount': 1 },
      } as any,
    );

    if (result.matchedCount === 0) {
      await this.accountGuestModel.updateOne(
        { _id: new Types.ObjectId(id) },
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

  // ============== ADDRESS MANAGEMENT ==============

  async getAddresses(guestId: string) {
    const account = await this.accountGuestModel
      .findById(new Types.ObjectId(guestId))
      .select('addresses')
      .exec();
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account.addresses || [];
  }

  async addAddress(guestId: string, address: any) {
    const account = await this.accountGuestModel.findById(guestId).exec();
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // If this is the first address, make it default
    if (!account.addresses || account.addresses.length === 0) {
      address.isDefault = true;
    }

    const result = await this.accountGuestModel
      .findByIdAndUpdate(
        new Types.ObjectId(guestId),
        { $push: { addresses: address } },
        { new: true },
      )
      .select('addresses')
      .exec();

    if (!result) {
      throw new NotFoundException('Account not found');
    }

    return result.addresses;
  }

  async updateAddress(guestId: string, addressId: string, addressData: any) {
    const updateFields = {};
    for (const [key, value] of Object.entries(addressData)) {
      updateFields[`addresses.$.${key}`] = value;
    }

    const result = await this.accountGuestModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(guestId), 'addresses._id': addressId },
        { $set: updateFields },
        { new: true },
      )
      .select('addresses')
      .exec();

    if (!result) {
      throw new NotFoundException('Address not found');
    }
    return result.addresses;
  }

  async deleteAddress(guestId: string, addressId: string) {
    const account = await this.accountGuestModel
      .findById(new Types.ObjectId(guestId))
      .exec();
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const addressToDelete = account.addresses?.find(
      (addr: any) => addr._id?.toString() === addressId,
    );
    if (addressToDelete?.isDefault) {
      throw new BadRequestException('Cannot delete default address');
    }

    const result = await this.accountGuestModel
      .findByIdAndUpdate(
        new Types.ObjectId(guestId),
        { $pull: { addresses: { _id: addressId } } },
        { new: true },
      )
      .select('addresses')
      .exec();

    if (!result) {
      throw new NotFoundException('Account not found');
    }
    return result.addresses;
  }

  async setDefaultAddress(guestId: string, addressId: string) {
    // Unset all defaults first
    await this.accountGuestModel.updateOne(
      { _id: new Types.ObjectId(guestId) },
      { $set: { 'addresses.$[].isDefault': false } },
    );

    // Set the specified address as default
    const result = await this.accountGuestModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(guestId), 'addresses._id': addressId },
        { $set: { 'addresses.$.isDefault': true } },
        { new: true },
      )
      .select('addresses')
      .exec();

    if (!result) {
      throw new NotFoundException('Address not found');
    }
    return result.addresses;
  }

  async getGuestById(guestId: string) {
    const account = await this.accountGuestModel
      .findOne({
        _id: new Types.ObjectId(guestId),
        deletedAt: { $exists: false },
      })
      .select(
        '-password -emailVerificationToken -resetPasswordToken -twoFactorSecret',
      )
      .exec();

    return account;
  }

  // ============== FAVORITES / WISHLIST ==============

  async getFavorites(guestId: string): Promise<string[]> {
    const account = await this.accountGuestModel
      .findById(new Types.ObjectId(guestId))
      .select('favoriteProducts')
      .exec();
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return (account.favoriteProducts || []).map((id) => id.toString());
  }

  async addToFavorites(guestId: string, productId: string) {
    const result = await this.accountGuestModel
      .findByIdAndUpdate(
        new Types.ObjectId(guestId),
        { $addToSet: { favoriteProducts: new Types.ObjectId(productId) } },
        { new: true },
      )
      .select('favoriteProducts')
      .exec();

    if (!result) {
      throw new NotFoundException('Account not found');
    }
    return result.favoriteProducts.map((id) => id.toString());
  }

  async removeFromFavorites(guestId: string, productId: string) {
    const result = await this.accountGuestModel
      .findByIdAndUpdate(
        new Types.ObjectId(guestId),
        { $pull: { favoriteProducts: new Types.ObjectId(productId) } },
        { new: true },
      )
      .select('favoriteProducts')
      .exec();

    if (!result) {
      throw new NotFoundException('Account not found');
    }
    return result.favoriteProducts.map((id) => id.toString());
  }

  async isFavorite(guestId: string, productId: string): Promise<boolean> {
    const account = await this.accountGuestModel
      .findOne({
        _id: new Types.ObjectId(guestId),
        favoriteProducts: { $in: [new Types.ObjectId(productId)] },
      } as any)
      .exec();
    return !!account;
  }
}
