import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Smart Axios Instance Setup for Frontend
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Allows sending cookies if API and App are on different subdomains
  withCredentials: true,
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Tự động gán token tĩnh tĩnh hoặc lấy từ nơi lưu trữ bảo mật cục bộ
    // (Bên Frontend, token thường được set bằng httpOnly cookie hoặc memory, 
    // ví dụ này chuẩn bị hook cho trường hợp cần auth token từ localStorage)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Chỉ trả về data, bỏ qua verbose axios response object
    return response.data;
  },
  (error: AxiosError) => {
    const { response } = error;
    
    if (response) {
      // Tự động xử lý khi Token hết hạn hoặc không có quyền chặn ở 401
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          console.warn('Phiên đăng nhập hết hạn. Sẽ chuyển trang...');
          // Thực hiện lệnh redirect về trang login hoặc clear token
          // window.location.href = '/login';
        }
      }
      console.error(`[API Error] Status: ${response.status}`, response.data);
    } else {
      console.error(`[Network Error] API is down or cors issue.`);
    }
    
    return Promise.reject(error);
  }
);
