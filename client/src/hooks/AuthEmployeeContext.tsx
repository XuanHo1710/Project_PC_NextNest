// stores/authEmployeeStore.ts
import { IAccountEmployee } from '@/stores/accountEmployeeStore';
import { create } from 'zustand';


interface AuthEmployeeState {
    accessToken: string;
    accountLogin: IAccountEmployee | null;
    setAccessToken: (token: string) => void;
    setAccountLogin: (account: IAccountEmployee | null) => void;
    resetAuth: () => void;
}

const useAuthEmployee = create<AuthEmployeeState>((set) => ({
    accessToken: '',
    accountLogin: null,

    setAccessToken: (token) => set({ accessToken: token }),

    setAccountLogin: (account) => set({ accountLogin: account }),

    resetAuth: () =>
        set({
            accessToken: '',
            accountLogin: null,
        }),
}));

export default useAuthEmployee;
