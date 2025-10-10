import { ILoginResponse, IRegisterDto } from '@/types/account';
import { create } from 'zustand';
import { accountService } from '@/services/client/account.client.service';
import { toast } from 'react-toastify';
import { message } from 'antd';
import useCartStore from '@/hooks/useCart';


type User = ILoginResponse['user'];


interface AuthUserState {
    user: User | null;
    accessToken: string;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (registerData: IRegisterDto) => Promise<boolean>;
    logout: () => Promise<void>;
    loginWithGoogle: () => void;
    refreshAuth: () => Promise<void>;
    setAccountLogin: (user: User | null) => void;
    setAccessToken: (token: string) => void;
}

const useAuthUser = create<AuthUserState>((set) => ({
    user: null,
    loading: false,
    accessToken: '',
    login: async (email, password) => {
        try {
            set({ loading: true });
            const response = await accountService.login({ email, password });
            set({ user: response.user, accessToken: response.access_token });
            toast.success('Đăng nhập thành công!');
            return true;
        } catch (error: unknown) {
            console.error('Login error:', error);
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Đăng nhập thất bại';
            message.error(errorMessage);
            return false;
        } finally {
            set({ loading: false });
        }
    },

    register: async (registerData) => {
        try {
            set({ loading: true });
            await accountService.register(registerData);
            toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
            return true;
        } catch (error: unknown) {
            console.error('Register error:', error);
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Đăng ký thất bại';
            message.error(errorMessage);
            return false;
        } finally {
            set({ loading: false });
        }
    },

    logout: async () => {
        try {
            await accountService.logout();
            set({ user: null, accessToken: '' });
            toast.success('Đăng xuất thành công!');
            const setCart = useCartStore.getState().setCart;
            setCart({
                _id: '',
                cartItems: [],
                total: 0,
                guestId: '',
            });
        } catch (error) {
            message.error('Logout error:' + error);
            set({ user: null, accessToken: '' });
        }
    },

    loginWithGoogle: () => {
        accountService.googleLogin();
    },
    refreshAuth: async () => {
        set({ user: null, accessToken: '' });
    },
    setAccountLogin: (user) => set({ user }),
    setAccessToken: (token) => set({ accessToken: token })
}));

export default useAuthUser;
