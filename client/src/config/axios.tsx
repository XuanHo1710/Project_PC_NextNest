// axios.tsx - Admin-side axios instance for calling backend directly
import { pathAdminRoutes } from '@/config/route';
import useAuthEmployee from '@/hooks/AuthEmployeeContext';
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { toast } from 'react-toastify';

const baseURL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1') + '/admin/';

// Track refresh state to prevent multiple refresh calls
let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

function subscribeTokenRefresh(cb: () => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

// Create admin axios instance
const instance = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access_token from Zustand store as Bearer token
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthEmployee.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle errors and token refresh
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as {
        message: string;
        statusCode: number;
      };

      // Handle 401 - Unauthorized (token expired)
      if (status === 401 && !originalRequest._retry) {
        // Don't retry refresh/login endpoints
        if (originalRequest.url?.includes('/auth/refresh') ||
          originalRequest.url?.includes('/auth/login')) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh(() => {
              resolve(instance(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Call Next.js API refresh route — it reads admin_refresh_token cookie,
          // calls backend, and sets new admin_access_token cookie
          const refreshResponse = await axios.post(
            '/api/admin/auth/refresh',
            {},
          );

          if (refreshResponse.data.success && refreshResponse.data.data?.access_token) {
            // Update Zustand store with new access_token
            const { setAccessToken } = useAuthEmployee.getState();
            setAccessToken(refreshResponse.data.data.access_token);
          }

          // Refresh succeeded — notify queued requests
          onRefreshed();

          // Retry original request with new token (interceptor will read from Zustand)
          return instance(originalRequest);
        } catch {
          // Refresh failed — clear auth state and redirect to login
          useAuthEmployee.getState().resetAuth();
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');

          if (typeof window !== 'undefined') {
            window.location.href = pathAdminRoutes.login;
          }

          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      }

      // Handle other errors
      switch (status) {
        case 400:
          toast.error(
            Array.isArray(data.message)
              ? data.message[0]
              : data.message || 'Yêu cầu không hợp lệ (400)'
          );
          break;
        case 403:
          toast.error('Không có quyền truy cập (403)');
          break;
        case 404:
          break;
        case 500:
          toast.error(data.message || 'Lỗi máy chủ (500). Vui lòng thử lại sau.');
          break;
        default:
          if (data.message) {
            toast.error(data.message);
          }
      }
    } else if (error.request) {
      toast.error('Không thể kết nối đến máy chủ.');
    } else {
      toast.error('Lỗi khi gửi yêu cầu: ' + error.message);
    }

    return Promise.reject(error);
  }
);

export default instance;
export { instance as axiosInstance };
