// stores/authEmployeeStore.ts
import { IAccountLogin } from "@/types/account-employee";
import { create } from "zustand";

interface AuthEmployeeState {
  accountLogin: IAccountLogin | null;
  accessToken: string | null;
  setAccountLogin: (account: IAccountLogin | null) => void;
  setAccessToken: (token: string | null) => void;
  resetAuth: () => void;
}

const useAuthEmployee = create<AuthEmployeeState>((set) => ({
  accountLogin: null,
  accessToken: null,

  setAccountLogin: (account) => set({ accountLogin: account }),

  setAccessToken: (token) => set({ accessToken: token }),

  resetAuth: () =>
    set({
      accountLogin: null,
      accessToken: null,
    }),
}));

export default useAuthEmployee;
