import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, SettingsDocument } from './entities/settings.entity';

// Default settings for initialization
const DEFAULT_SETTINGS = [
  {
    key: 'general',
    group: 'general',
    description: 'Cài đặt chung',
    value: {
      siteName: 'Arisu Store',
      siteDescription: 'Cửa hàng linh kiện máy tính',
      contactEmail: 'admin@arisustore.com',
      contactPhone: '0123456789',
      address: 'TP. Hồ Chí Minh, Việt Nam',
    },
  },
  {
    key: 'appearance',
    group: 'appearance',
    description: 'Cài đặt giao diện',
    value: {
      darkMode: false,
      primaryColor: '#1890ff',
      sidebarCollapsed: false,
      pageSize: 10,
    },
  },
  {
    key: 'notification',
    group: 'notification',
    description: 'Cài đặt thông báo',
    value: {
      newOrder: true,
      lowStock: true,
      newReview: false,
      emailNotification: true,
    },
  },
  {
    key: 'email',
    group: 'email',
    description: 'Cài đặt SMTP Email',
    value: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpSecure: 'tls',
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: '',
    },
  },
  {
    key: 'security',
    group: 'security',
    description: 'Cài đặt bảo mật',
    value: {
      twoFactorAuth: false,
      autoLogout: 30,
      ipRestriction: false,
      activityLog: true,
      passwordStrength: 'medium',
    },
  },
];

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>,
  ) {
    this.initializeDefaults();
  }

  private async initializeDefaults() {
    for (const setting of DEFAULT_SETTINGS) {
      const exists = await this.settingsModel.findOne({ key: setting.key });
      if (!exists) {
        await this.settingsModel.create(setting);
      }
    }
  }

  async findAll() {
    return this.settingsModel.find().sort({ group: 1 }).lean().exec();
  }

  async findByKey(key: string) {
    const setting = await this.settingsModel.findOne({ key }).lean().exec();
    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }
    return setting;
  }

  async findByGroup(group: string) {
    return this.settingsModel.find({ group }).lean().exec();
  }

  async update(key: string, value: Record<string, any>) {
    const setting = await this.settingsModel.findOneAndUpdate(
      { key },
      { $set: { value } },
      { new: true, upsert: true },
    );
    return setting;
  }

  async updateMany(settings: { key: string; value: Record<string, any> }[]) {
    const results = await Promise.all(
      settings.map((s) => this.update(s.key, s.value)),
    );
    return results;
  }
}
