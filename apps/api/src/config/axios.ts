import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Smart Axios Instance Setup
const axiosInstance: AxiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Thêm các header tùy chọn ở đây (ví dụ Authorization token)
    
    // Đánh dấu thời gian bắt đầu
    (config as any).metadata = { startTime: new Date() };
    console.log(`[Axios Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error: AxiosError) => {
    console.error(`[Axios Request Error]`, error.message);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { config } = response;
    const startTime = (config as any).metadata?.startTime;
    const duration = startTime ? new Date().getTime() - startTime.getTime() : 'unknown';
    
    console.log(`[Axios Response] ${config.method?.toUpperCase()} ${config.url} - ${response.status} (${duration}ms)`);
    return response.data; // Trả về nội dung data mặc định cho gọn code
  },
  (error: AxiosError) => {
    const { config, response } = error;
    
    if (response) {
      console.error(
        `[Axios Response Error] ${config?.method?.toUpperCase()} ${config?.url} - Status: ${response.status}`,
        JSON.stringify(response.data)
      );
      
      // Có thể xử lý tự động khi token hết hạn
      if (response.status === 401) {
        console.warn('Unauthorized. Please handle token refresh logic here.');
      }
    } else if (error.request) {
      console.error(`[Axios Network Error] No response received for ${config?.url}`);
    } else {
      console.error(`[Axios Setup Error] ${error.message}`);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
