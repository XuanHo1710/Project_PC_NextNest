import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Guest, GuestDocument } from 'src/admin/guest/entities/guest.entity';
import * as bcrypt from 'bcrypt';
import { AccountGuest, AccountGuestDocument } from 'src/admin/account-guest/entities/account-guest.entity';

@Injectable()
export class GuestService implements OnModuleInit {
    constructor(
        @InjectModel(Guest.name) private guestModel: Model<GuestDocument>,
        @InjectModel(AccountGuest.name) private accountModel: Model<AccountGuestDocument>,
    ) { }

    async onModuleInit() {
        // Run migration on service initialization
        await this.migrateGenderValues();
    }

    // Migration method to fix existing lowercase gender values
    async migrateGenderValues() {
        try {
            await this.guestModel.updateMany(
                { gender: 'male' },
                { $set: { gender: 'MALE' } }
            );
            await this.guestModel.updateMany(
                { gender: 'female' },
                { $set: { gender: 'FEMALE' } }
            );
            await this.guestModel.updateMany(
                { gender: 'other' },
                { $set: { gender: 'OTHER' } }
            );
            console.log('Gender values migration completed');
        } catch (error) {
            console.error('Error migrating gender values:', error);
        }
    }


    async findOne(id: string): Promise<Guest> {
        const guestInfo = await this.guestModel
            .findOne({ _id: id, deletedAt: { $exists: false } })
            .select('-authProvider -resetPasswordToken -resetPasswordExpires')
            .exec();

        if (!guestInfo) {
            throw new NotFoundException('Guest not found');
        }

        return guestInfo;
    }

    async updateProfile(id: string, updateData: Partial<Guest>): Promise<{ message: string }> {
        // Normalize gender value if provided
        if (updateData.gender) {
            updateData.gender = updateData.gender.toUpperCase();
        }

        const updatedGuest = await this.guestModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).select('-authProvider -resetPasswordToken -resetPasswordExpires');

        if (!updatedGuest) {
            throw new NotFoundException('Guest not found');
        }
        return {
            message: 'Profile updated successfully',
        };
    }

    // Address Management
    async addAddress(guestId: string, addressData: any): Promise<{ message: string, address: any }> {
        try {
            const guest = await this.guestModel.findById(guestId);
            if (!guest) {
                throw new NotFoundException('Guest not found');
            }

            // Initialize addresses array if it doesn't exist
            if (!guest.addresses) {
                guest.addresses = [];
            }

            const newAddress = {
                // Không cần set id, MongoDB sẽ tự tạo _id cho subdocument
                label: addressData.label,
                province: addressData.province,
                district: addressData.district,
                ward: addressData.ward,
                detailAddress: addressData.detailAddress,
                isDefault: guest.addresses.length === 0 || addressData.isDefault === true
            };

            // If this address is set as default, update all others to false
            if (newAddress.isDefault && guest.addresses.length > 0) {
                guest.addresses.forEach(addr => addr.isDefault = false);
            }

            guest.addresses.push(newAddress);
            const savedGuest = await guest.save();

            // Get the newly added address with its _id
            const addedAddress = savedGuest.addresses[savedGuest.addresses.length - 1];

            return {
                message: 'Address added successfully',
                address: addedAddress
            };
        } catch (error) {
            console.error('Error in addAddress:', error);
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to add address');
        }
    }

    async updateAddress(guestId: string, addressId: string, updateData: any): Promise<{ message: string }> {
        try {
            const guest = await this.guestModel.findById(guestId);
            if (!guest) {
                throw new NotFoundException('Guest not found');
            }

            const addressIndex = guest.addresses.findIndex(addr => addr._id?.toString() === addressId);
            if (addressIndex === -1) {
                throw new NotFoundException('Address not found');
            }

            // If setting as default, update all others to false
            if (updateData.isDefault) {
                guest.addresses.forEach(addr => addr.isDefault = false);
            }

            // Update address with proper structure
            guest.addresses[addressIndex] = {
                ...guest.addresses[addressIndex],
                label: updateData.label || guest.addresses[addressIndex].label,
                province: updateData.province || guest.addresses[addressIndex].province,
                district: updateData.district || guest.addresses[addressIndex].district,
                ward: updateData.ward || guest.addresses[addressIndex].ward,
                detailAddress: updateData.detailAddress || guest.addresses[addressIndex].detailAddress,
                isDefault: updateData.isDefault !== undefined ? updateData.isDefault : guest.addresses[addressIndex].isDefault
            };

            await guest.save();
            return { message: 'Address updated successfully' };
        } catch (error) {
            console.error('Error in updateAddress:', error);
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to update address');
        }
    }

    async deleteAddress(guestId: string, addressId: string): Promise<{ message: string }> {
        const guest = await this.guestModel.findById(guestId);
        if (!guest) {
            throw new NotFoundException('Guest not found');
        }

        const addressIndex = guest.addresses.findIndex(addr => addr._id?.toString() === addressId);
        if (addressIndex === -1) {
            throw new NotFoundException('Address not found');
        }

        const addressToDelete = guest.addresses[addressIndex];
        if (addressToDelete.isDefault && guest.addresses.length > 1) {
            throw new BadRequestException('Cannot delete default address. Please set another address as default first.');
        }

        guest.addresses.splice(addressIndex, 1);
        await guest.save();

        return { message: 'Address deleted successfully' };
    }

    async setDefaultAddress(guestId: string, addressId: string): Promise<{ message: string }> {
        const guest = await this.guestModel.findById(guestId);
        if (!guest) {
            throw new NotFoundException('Guest not found');
        }

        const addressIndex = guest.addresses.findIndex(addr => addr._id?.toString() === addressId);
        if (addressIndex === -1) {
            throw new NotFoundException('Address not found');
        }

        // Set all addresses to non-default
        guest.addresses.forEach(addr => addr.isDefault = false);

        // Set selected address as default
        guest.addresses[addressIndex].isDefault = true;
        await guest.save();

        return { message: 'Default address updated successfully' };
    }

    async changePassword(guestId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
        const accountGuest = await this.accountModel.findOne({ guestId: guestId }).select('+password').exec();
        if (!accountGuest) {
            throw new NotFoundException('accountGuest not found');
        }

        if (!accountGuest.password) {
            throw new BadRequestException('No password set for this account');
        }

        // Check if current password is correct
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, accountGuest.password);
        if (!isCurrentPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        // Validate new password (optional: add password strength validation)
        if (newPassword.length < 6) {
            throw new BadRequestException('New password must be at least 6 characters long');
        }

        // Hash new password
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        accountGuest.password = hashedNewPassword;
        await accountGuest.save();

        return { message: 'Password changed successfully' };
    }
}