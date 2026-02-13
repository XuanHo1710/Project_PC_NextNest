import axiosInstance from "@/config/axios";

export interface ISetting {
  _id: string;
  key: string;
  value: Record<string, any>;
  group: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

class SettingsService {
  private baseUrl = "settings";

  async getAll(): Promise<ISetting[]> {
    const response = await axiosInstance.get(this.baseUrl);
    return response.data;
  }

  async getByKey(key: string): Promise<ISetting> {
    const response = await axiosInstance.get(`${this.baseUrl}/${key}`);
    return response.data;
  }

  async update(key: string, value: Record<string, any>): Promise<ISetting> {
    const response = await axiosInstance.patch(`${this.baseUrl}/${key}`, {
      value,
    });
    return response.data;
  }

  async updateMany(
    settings: { key: string; value: Record<string, any> }[],
  ): Promise<ISetting[]> {
    const response = await axiosInstance.patch(this.baseUrl, { settings });
    return response.data;
  }
}

export const settingsService = new SettingsService();
