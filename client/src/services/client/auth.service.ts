import axiosClient from "@/config/axiosClient";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullname: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: {
        id: string;
        email: string;
        fullname: string;
        avatar?: string;
        authProvider: string;
    };
}

export interface User {
    id: string;
    email: string;
    fullname: string;
    avatar?: string;
    authProvider: string;
}

class ClientAuthService {

    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await axiosClient.post('/client/auth/login', credentials);
        return response.data;
    }

    async register(userData: RegisterRequest): Promise<{ message: string; user: User }> {
        const response = await axiosClient.post('/client/auth/register', userData);
        return response.data;
    }

    async logout(): Promise<{ message: string }> {
        const response = await axiosClient.post('/client/auth/logout');
        return response.data;
    }

    async refreshToken(): Promise<{ access_token: string }> {
        const response = await axiosClient.post('/client/auth/refresh');
        return response.data;
    }

    async getProfile(): Promise<User> {
        const response = await axiosClient.get('/client/auth/profile');
        return response.data;
    }

    // Google OAuth
    googleLogin(): void {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/client/auth/google`;
    }

    // Helper methods for local storage
    setUser(user: User): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
        }
    }

    getUser(): User | null {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        }
        return null;
    }

    removeUser(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
        }
    }

    isAuthenticated(): boolean {
        return this.getUser() !== null;
    }
}

export const clientAuthService = new ClientAuthService();