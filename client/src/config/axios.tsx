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

const baseURL = 'http://localhost:8080/api/v1/admin/';

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
  withCredentials: true, // Important for cookies (backend reads refresh_token from cookie)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: cookies are sent automatically via withCredentials
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
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
          // Call backend refresh endpoint — it reads refresh_token from cookie, no Bearer needed
          await axios.post(
            `${baseURL}auth/refresh-token`,
            {},
            { withCredentials: true }
          );

          // Refresh succeeded — backend renewed the cookie
          onRefreshed();

          // Retry original request (cookie is automatically attached)
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
