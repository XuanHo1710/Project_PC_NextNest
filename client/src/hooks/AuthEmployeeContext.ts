// stores/authEmployeeStore.ts
import { IAccountLogin } from "@/types/account-employee";
import { create } from "zustand";

interface AuthEmployeeState {
  accountLogin: IAccountLogin | null;
  setAccountLogin: (account: IAccountLogin | null) => void;
  resetAuth: () => void;
}

const useAuthEmployee = create<AuthEmployeeState>((set) => ({
  accountLogin: null,

  setAccountLogin: (account) => set({ accountLogin: account }),

  resetAuth: () =>
    set({
      accountLogin: null,
    }),
}));

export default useAuthEmployee;
