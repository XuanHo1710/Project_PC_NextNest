// axiosClient.tsx - Client-side axios instance for calling backend directly
// Auth = httpOnly cookies sent automatically via withCredentials.
import useAuthUser from '@/hooks/useAuthUser';
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { toast } from 'react-toastify';
import { clearSession, hasSessionHint, markSession } from '@/utils/sessionFlag';

const baseURL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1') + '/client';

// Track if refresh is in progress to prevent multiple refresh calls
let isRefreshing = false;
let refreshSubscribers: Array<{
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
  originalRequest: InternalAxiosRequestConfig & { _retry?: boolean };
}> = [];

function subscribeTokenRefresh(
  resolve: (v: unknown) => void,
  reject: (e: unknown) => void,
  originalRequest: InternalAxiosRequestConfig & { _retry?: boolean },
) {
  refreshSubscribers.push({ resolve, reject, originalRequest });
}

function onRefreshed() {
  refreshSubscribers.forEach((s) => s.resolve(axiosClient(s.originalRequest)));
  refreshSubscribers = [];
}

function onRefreshFailed(error: unknown) {
  refreshSubscribers.forEach((s) =>
    s.reject(axiosClient.defaults.withCredentials ? error : error),
  );
  refreshSubscribers = [];
}

// Create axios instance
const axiosClient = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

      // Handle 401 - access token expired -> rotate via backend refresh endpoint.
      // The gateway reads client_refresh_token cookie, checks the Redis session
      // and sets new cookies on the response.
      if (status === 401 && !originalRequest._retry) {
        // Don't retry auth endpoints themselves
        if (originalRequest.url?.includes('/auth/refresh') ||
          originalRequest.url?.includes('/auth/login')) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh(resolve, reject, originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshResponse = await axios.post(
            `${baseURL}/auth/refresh`,
            {},
            { withCredentials: true },
          );

          const user = refreshResponse.data?.data?.user;
          if (user?._id) {
            useAuthUser.getState().setUser(user);
            markSession();
          }

          // Refresh succeeded — notify queued requests
          onRefreshed();

          // Retry original request; browser now has fresh cookies
          return axiosClient(originalRequest);
        } catch {
          // Refresh failed — release queued requests with the failure,
          // clear auth state and redirect.
          // Only notify users who actually had a session before: a fresh
          // guest hitting a protected endpoint (401 -> refresh 400) must
          // not see "session expired".
          const hadSession = hasSessionHint();
          onRefreshFailed(error);

          const { resetAuth } = useAuthUser.getState();
          resetAuth();

          if (hadSession) {
            toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            clearSession();
          }

          if (typeof window !== undefined) {
            if (window.location.pathname === '/order'
              || window.location.pathname === '/profile'
            ) {
              window.location.href = '/home';
            }
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
