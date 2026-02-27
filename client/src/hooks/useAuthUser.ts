import { IClientUser, IClientRegisterDto } from "@/types/auth";
import { create } from "zustand";
import { toast } from "react-toastify";
import { message } from "antd";
import useCartStore from "@/hooks/useCart";
import axios from "axios";

interface AuthUserState {
  user: IClientUser | null;
  accessToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  register: (registerData: IClientRegisterDto) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  handleGoogleCallback: (data: {
    access_token: string;
    payload: Record<string, unknown>;
  }) => Promise<boolean>;

  setUser: (user: IClientUser | null) => void;
  setAccessToken: (token: string | null) => void;
  resetAuth: () => void;
}

const useAuthUser = create<AuthUserState>((set) => ({
  user: null,
  accessToken: null,
  loading: false,
  isAuthenticated: false,

  login: async (email, password) => {
    try {
      set({ loading: true });

      // Call Next.js API route → sets httpOnly cookies (client_access_token + client_refresh_token)
      const response = await axios.post("/api/client/auth/login", {
        email,
        password,
      });

      if (response.data.success && response.data.data) {
        const { user, access_token } = response.data.data;
        set({
          user,
          accessToken: access_token,
          isAuthenticated: true,
        });
        toast.success("Đăng nhập thành công!");
        return true;
      }

      message.error(response.data.message || "Đăng nhập thất bại");
      return false;
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Đăng nhập thất bại";
      message.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  register: async (registerData) => {
    try {
      set({ loading: true });

      const response = await axios.post(
        "/api/client/auth/register",
        registerData,
      );

      if (response.data.success) {
        toast.success(
          "Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.",
          { autoClose: 6000 },
        );
        return true;
      }

      message.error(response.data.message || "Đăng ký thất bại");
      return false;
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Đăng ký thất bại";
      message.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await axios.post("/api/client/auth/logout");
      set({ user: null, accessToken: null, isAuthenticated: false });
      toast.success("Đăng xuất thành công!");

      useCartStore.getState().setCart({
        _id: "",
        cartItems: [],
        total: 0,
        guestId: "",
      });
    } catch (error) {
      console.error("Logout error:", error);
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },

  loginWithGoogle: () => {
    const width = 500;
    const height = 620;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/client/auth/google`,
      "googleLogin",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`,
    );
  },

  handleGoogleCallback: async (data) => {
    try {
      set({ loading: true });

      const response = await axios.post("/api/client/auth/google-callback", {
        access_token: data.access_token,
        payload: data.payload,
      });

      if (response.data.success && response.data.data) {
        const { user, access_token } = response.data.data;
        set({
          user,
          accessToken: access_token,
          isAuthenticated: true,
        });
        toast.success("Đăng nhập Google thành công!");
        return true;
      }

      message.error(response.data.message || "Đăng nhập Google thất bại");
      return false;
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Đăng nhập Google thất bại";
      message.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  setUser: (user) =>
    set({
      user: user ? { ...user, id: user._id } : null,
      isAuthenticated: !!user,
    }),

  setAccessToken: (token) => set({ accessToken: token }),

  resetAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),
}));

export default useAuthUser;
