// stores/authEmployeeStore.ts
import { IAccountLogin } from '@/types/modal.d';
import { create } from 'zustand';


interface AuthEmployeeState {
    accessToken: string;
    accountLogin: IAccountLogin | null;
    setAccessToken: (token: string) => void;
    setAccountLogin: (account: IAccountLogin | null) => void;
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
