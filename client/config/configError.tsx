// axiosConfig.js
import axios from 'axios';
import { toast } from 'react-toastify';

const instance = axios.create({
  baseURL: 'http://localhost:8080/api/v1/admin/', // Thay bằng URL backend của bạn
  timeout: 5000, // timeout sau 5s
  headers: {
    'Content-Type': 'application/json',
    // Authorization: `Bearer ${token}`, // nếu cần token có thể set ở đây hoặc trong interceptor
  },
});

// Thêm interceptor nếu muốn tự động thêm token hoặc xử lý lỗi
// instance.interceptors.request.use(
//   config => {
//     // const token = localStorage.getItem('accessToken');
//     // if (token) {
//     //   config.headers.Authorization = `Bearer ${token}`;
//     // }
//     return config;
//   },
//   error => Promise.reject(error)
// );

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          if (data.message.length > 0) {
            toast.error(data.message[0] || 'Yêu cầu không hợp lệ (400)');
          } else toast.error(data.message || 'Yêu cầu không hợp lệ (400)');
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

// instance.interceptors.response.use(
//   response => response,
//   error => {
//     // Xử lý lỗi chung ở đây (ví dụ: hết hạn token)
//     if (error.response && error.response.status === 401) {
//       // Logout hoặc chuyển hướng tới trang đăng nhập
//       console.error('Unauthorized - hãy đăng nhập lại.');
//     }
//     return Promise.reject(error);
//   }
// );

export default instance;
