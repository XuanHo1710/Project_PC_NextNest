// axiosClient.tsx - Client-side axios instance for calling backend directly
import useAuthUser from '@/hooks/useAuthUser';
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { toast } from 'react-toastify';

const baseURL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1') + '/client';

// Track if refresh is in progress to prevent multiple refresh calls
let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

function subscribeTokenRefresh(cb: () => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

// Create axios instance
const axiosClient = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access_token from Zustand store as Bearer token
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthUser.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle errors and token refresh
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

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
              resolve(axiosClient(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Call Next.js API refresh route — it reads client_refresh_token cookie,
          // calls backend, and sets new client_access_token cookie
          const refreshResponse = await axios.post(
            '/api/client/auth/refresh',
            {},
          );

          if (refreshResponse.data.success && refreshResponse.data.data?.access_token) {
            // Update Zustand store with new access_token
            const { setAccessToken } = useAuthUser.getState();
            setAccessToken(refreshResponse.data.data.access_token);
          }

          // Refresh succeeded — notify queued requests
          onRefreshed();

          // Retry original request with new token (interceptor will read from Zustand)
          return axiosClient(originalRequest);
        } catch {
          // Refresh failed — clear auth state and redirect
          const { resetAuth } = useAuthUser.getState();
          resetAuth();

          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');

          if (typeof window !== 'undefined') {
            window.location.href = '/home?login=required';
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

export default axiosClient;
export { axiosClient as axiosInstance };
