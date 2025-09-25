// axiosConfig.ts
import axios, {
  AxiosError,
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

// ✅ Request interceptor: luôn set accessToken từ store
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);



// ✅ Response interceptor: handle refresh token + lỗi
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data; // luôn trả về data
  },
  async (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as {
        message: string;
        statusCode: number;
        timestamp: Date;
        data: unknown;
      };

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
