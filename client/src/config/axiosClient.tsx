// axiosConfig.ts
import useAuthUser from '@/hooks/useAuthUser';
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { toast } from 'react-toastify';

const baseURL = 'http://localhost:8080/api/v1/'; // URL backend

// Tạo instance axios
const instance = axios.create({
  baseURL,
  timeout: 6000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log(payload);

    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true; // If can't parse token, consider it expired
  }
};

// ✅ Request interceptor: check token expiration before sending request
instance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { accessToken, user } = useAuthUser.getState();

    // If user is logged in and has token, check if it's expired
    if (user && accessToken) {
      if (isTokenExpired(accessToken)) {
        // Token is expired, try to refresh
        try {
          await refreshTokenIfNeeded();
          const newToken = useAuthUser.getState().accessToken;
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
        } catch {
          // Refresh failed, clear auth and reload page
          useAuthUser.getState().logout();
          window.location.reload();
          return Promise.reject(new Error('Token expired and refresh failed'));
        }
      } else {
        // Token is still valid
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);


let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
}[] = [];

// Function to refresh token when needed
const refreshTokenIfNeeded = async (): Promise<void> => {
  if (isRefreshing) {
    return new Promise<void>((resolve, reject) => {
      failedQueue.push({
        resolve: () => resolve(),
        reject: (error) => reject(error)
      });
    });
  }

  isRefreshing = true;

  try {
    const { setAccessToken } = useAuthUser.getState();

    // Call refresh-token API (backend handles refresh_token cookie)
    const response = await axios.post(
      `${baseURL}client/auth/refresh-token`,
      {},
      { withCredentials: true }
    );

    if (!response.data?.data?.access_token) {
      throw new Error('Không nhận được accessToken mới từ server');
    }

    const newAccessToken = response.data.data.access_token;

    // Save new token to store
    setAccessToken(newAccessToken);

    // Process queued requests
    processQueue(null, newAccessToken);
  } catch (err) {
    processQueue(err, null);
    throw err; // Re-throw to let caller handle
  } finally {
    isRefreshing = false;
  }
};



const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};



// ✅ Response interceptor: handle errors
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data; // luôn trả về data
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as {
        message: string;
        statusCode: number;
        timestamp: Date;
        data: unknown;
      };

      // 🔄 Nếu accessToken hết hạn → refresh
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true; // 👈 quan trọng: đánh dấu để không lặp vô hạn

        // ✅ Check if user is logged in and has access token
        const { user, accessToken } = useAuthUser.getState();

        // Only refresh if user was previously logged in (has user data and had access token)
        if (!user || !accessToken) {
          // User is not logged in or no previous token, don't attempt refresh
          useAuthUser.getState().logout();
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
              }
              return instance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          const { setAccessToken } = useAuthUser.getState();

          // ✅ Gọi API refresh-token (backend tự xử lý bằng cookie refresh_token)
          const response = await axios.post(
            `${baseURL}client/auth/refresh-token`,
            {},
            { withCredentials: true }
          );

          if (!response.data?.data?.access_token) {
            throw new Error('Không nhận được accessToken mới từ server');
          }

          const newAccessToken = response.data.data.access_token;

          // Lưu token mới vào store
          setAccessToken(newAccessToken);

          // Gửi lại các request đang chờ
          processQueue(null, newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          }

          return instance(originalRequest); // 👈 retry lại request ban đầu
        } catch (err) {
          // ❌ Refresh failed - probably no refresh token or it's expired
          processQueue(err, null);

          // Clear user data and redirect to login
          useAuthUser.getState().logout();

          // // Only redirect if not already on auth pages
          // if (!window.location.pathname.includes('/auth') && !window.location.pathname.includes('/home')) {
          //   window.location.href = "/home";
          // }

          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      // Xử lý các lỗi khác
      switch (status) {
        case 400:
          toast.error(
            Array.isArray(data.message) && data.message.length > 0
              ? data.message[0]
              : data.message || 'Yêu cầu không hợp lệ (400)'
          );
          break;
        case 403:
          toast.error('Không có quyền truy cập (403)');
          break;
        case 404:
          toast.info('Không tìm thấy tài nguyên (404)');
          break;
        case 500:
          toast.error('Lỗi máy chủ (500). Vui lòng thử lại sau.');
          break;
        default:
          toast.error(data.message || 'Đã xảy ra lỗi không xác định');
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
