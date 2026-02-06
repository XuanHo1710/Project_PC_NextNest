import axiosClient from "@/config/axiosClient";
import { IClientUser } from "@/types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullname: string;
  phone: string;
}

class ClientAuthService {
  async login(
    credentials: LoginRequest,
  ): Promise<{ access_token: string; user: IClientUser }> {
    const response = await axiosClient.post("/client/auth/login", credentials);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<{ message: string }> {
    const response = await axiosClient.post("/client/auth/register", userData);
    return response.data;
  }

  async logout(): Promise<{ message: string }> {
    const response = await axiosClient.post("/client/auth/logout");
    return response.data;
  }

  async getProfile(): Promise<IClientUser> {
    const response = await axiosClient.get("/client/account-guest/profile");
    return response.data;
  }

  googleLogin(): void {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/client/auth/google`;
  }
}

export const clientAuthService = new ClientAuthService();
