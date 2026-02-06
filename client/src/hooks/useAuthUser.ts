import { IClientUser, IClientRegisterDto } from "@/types/auth";
import { create } from "zustand";
import { toast } from "react-toastify";
import { message } from "antd";
import useCartStore from "@/hooks/useCart";
import axios from "axios";

interface AuthUserState {
  user: IClientUser | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  register: (registerData: IClientRegisterDto) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;

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

      // Call Next.js API route → sets client_access_token httpOnly cookie
      const response = await axios.post("/api/client/auth/login", {
        email,
        password,
      });

      if (response.data.success && response.data.data) {
        const { user } = response.data.data;
        set({ user, isAuthenticated: true });
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
          response.data.message || "Đăng ký thành công! Vui lòng đăng nhập.",
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
      set({ user: null, isAuthenticated: false });
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
    }
  },

  loginWithGoogle: () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/client/auth/google`;
  },

  setUser: (user) =>
    set({
      user: user ? { ...user, id: user._id } : null,
      isAuthenticated: !!user,
    }),

  resetAuth: () => set({ user: null, isAuthenticated: false }),
}));

export default useAuthUser;
