// axiosConfig.ts
import { pathAdminRoutes } from '@/config/route';
import useAuthEmployee from '@/hooks/AuthEmployeeContext';
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { toast } from 'react-toastify';

const baseURL = 'http://localhost:8080/api/v1/admin/'; // URL backend

// Tạo instance axios
const instance = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request interceptor: luôn set accessToken từ store
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthEmployee.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

// ✅ Response interceptor: handle refresh token + lỗi
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
          const { setAccessToken } = useAuthEmployee.getState();

          // ✅ Gọi API refresh-token (backend tự xử lý bằng cookie refresh_token)
          const response = await axios.post(
            `${baseURL}auth/refresh-token`,
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
          processQueue(err, null);
          useAuthEmployee.getState().resetAuth();
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          window.location.href = pathAdminRoutes.login;
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
        case 401:
          toast.warning('Chưa đăng nhập hoặc phiên đã hết hạn (401)');
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
