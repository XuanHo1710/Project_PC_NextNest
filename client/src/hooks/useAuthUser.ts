import { IClientUser, IClientRegisterDto } from "@/types/auth";
import { create } from "zustand";
import { toast } from "react-toastify";
import { message } from "antd";
import useCartStore from "@/hooks/useCart";
import axios from "axios";
import { clearSession, markSession } from "@/utils/sessionFlag";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

interface AuthUserState {
  user: IClientUser | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  register: (registerData: IClientRegisterDto) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  handleGoogleCallback: (payload: Record<string, unknown>) => Promise<boolean>;

  setUser: (user: IClientUser | null) => void;
  resetAuth: () => void;
}

const useAuthUser = create<AuthUserState>((set) => ({
  user: null,
  loading: false,
  isAuthenticated: false,

  login: async (email, password) => {
    try {
      set({ loading: true });

      // Backend sets httpOnly cookies (client_access_token + client_refresh_token).
      // Every later request carries them automatically (withCredentials).
      const response = await axios.post(
        `${API_BASE}/client/auth/login`,
        { email, password },
        { withCredentials: true },
      );

      const user = response.data?.data?.user;

      if (user?._id) {
        set({
          user: { ...user, id: user._id } as IClientUser,
          isAuthenticated: true,
        });
        markSession();
        toast.success("Đăng nhập thành công!");
        return true;
      }

      message.error(response.data?.message || "Đăng nhập thất bại");
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
        `${API_BASE}/client/auth/register`,
        registerData,
        { withCredentials: true },
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(
          "Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.",
          { autoClose: 6000 },
        );
        return true;
      }

      message.error(response.data?.message || "Đăng ký thất bại");
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
      await axios.post(`${API_BASE}/client/auth/logout`, {}, {
        withCredentials: true,
      });
      set({ user: null, isAuthenticated: false });
      clearSession();
      toast.success("Đăng xuất thành công!");

      useCartStore.getState().setCart({
        _id: "",
        cartItems: [],
        total: 0,
        guestId: "",
      });
    } catch (error) {
      console.error("Logout error:", error);
      set({ user: null, isAuthenticated: false });
      clearSession();
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

  handleGoogleCallback: async (payload) => {
    // The popup only receives the public profile; cookies were already
    // set on the API domain by the gateway callback endpoint.
    try {
      set({ loading: true });

      if (!payload?._id && !payload?.id) {
        message.error("Đăng nhập Google thất bại");
        return false;
      }

      const user = payload as unknown as IClientUser;
      set({
        user: { ...user, id: (user._id || user.id) as string },
        isAuthenticated: true,
      });
      markSession();
      toast.success("Đăng nhập Google thành công!");
      return true;
    } finally {
      set({ loading: false });
    }
  },

  setUser: (user) =>
    set({
      user: user ? { ...user, id: user._id } : null,
      isAuthenticated: !!user,
    }),

  resetAuth: () => {
    clearSession();
    set({ user: null, isAuthenticated: false });
  },
}));

export default useAuthUser;
