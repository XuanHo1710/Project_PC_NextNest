// services/base.service.ts
import axiosInstance from "@/config/axios"
import { AxiosRequestConfig } from "axios"

export class BaseService<T> {
  protected baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async getAll(queryParams = ""): Promise<T[]> {
    const response = await axiosInstance.get(`${this.baseUrl}${queryParams}`)
    return response.data
  }

  async getById(id: string, config?: AxiosRequestConfig): Promise<T> {
    console.log(id)
    const response = await axiosInstance.get(`${this.baseUrl}/${id}`, config)
    return response.data
  }

  async create(data: Omit<T, "_id">): Promise<{ data: T; status: number }> {
    const response = await axiosInstance.post(this.baseUrl, data)
    return { data: response.data, status: response.status }
  }

  async update(id: string, data: Partial<T>): Promise<{ data: T; status: number }> {
    const response = await axiosInstance.patch(`${this.baseUrl}/${id}`, data)
    return { data: response.data, status: response.status }
  }

  async delete(id: string): Promise<{ status: number }> {
    const response = await axiosInstance.delete(`${this.baseUrl}/${id}`)
    return { status: response.status }
  }

  async updateMany(ids: string[], typeUpdate: string): Promise<{ status: number }> {
    const response = await axiosInstance.patch(`${this.baseUrl}/updateMany`, {
      ids,
      typeUpdate,
    })
    return { status: response.status }
  }
}
