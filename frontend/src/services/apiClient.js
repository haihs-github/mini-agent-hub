import axios from "axios";

// BKAV HaiHS : Hằng số URL gốc của Server API lấy từ biến môi trường - start
const API_BASE_URL = import.meta.env.VITE_API_URL;
// BKAV HaiHS : Hằng số URL gốc của Server API lấy từ biến môi trường - end

// BKAV HaiHS : Danh sách các API endpoint không kích hoạt cơ chế tự động refresh token - start
const AUTH_EXCLUDED_ENDPOINTS = [
  "/auth/refresh",
  "/auth/login",
  "/auth/logout",
];
// BKAV HaiHS : Danh sách các API endpoint không kích hoạt cơ chế tự động refresh token - end

// BKAV HaiHS : Quản lý Access Token tạm thời lưu trong RAM trình duyệt - start
let _accessToken = null;

export const setAccessToken = (token) => {
  _accessToken = token;
};

export const getAccessToken = () => {
  return _accessToken;
};
// BKAV HaiHS : Quản lý Access Token tạm thời lưu trong RAM trình duyệt - end

// BKAV HaiHS : Khởi tạo cấu hình Axios Instance dùng chung - start
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
// BKAV HaiHS : Khởi tạo cấu hình Axios Instance dùng chung - end

let refreshPromise = null;

// BKAV HaiHS : Hàm gom các yêu cầu refresh token song song thành một Promise duy nhất - start
export const memoizedRefresh = () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = axios
    .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
    .then((res) => {
      refreshPromise = null;
      return res;
    })
    .catch((err) => {
      refreshPromise = null;
      throw err;
    });

  return refreshPromise;
};
// BKAV HaiHS : Hàm gom các yêu cầu refresh token song song thành một Promise duy nhất - end

// BKAV HaiHS : Request Interceptor tự động gắn Access Token từ RAM vào Header - start
apiClient.interceptors.request.use(
  (config) => {
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
// BKAV HaiHS : Request Interceptor tự động gắn Access Token từ RAM vào Header - end

// BKAV HaiHS : Response Interceptor tự động refresh token khi gặp lỗi 401 - start
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isExcludedEndpoint = AUTH_EXCLUDED_ENDPOINTS.some((endpoint) =>
      originalRequest?.url?.includes(endpoint),
    );

    // Nếu gặp lỗi 401 (Access Token hết hạn), chưa thử lại và không thuộc danh sách endpoint loại trừ
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isExcludedEndpoint
    ) {
      originalRequest._retry = true;
      try {
        const res = await memoizedRefresh();
        const newAccessToken = res.data.data.token;

        setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent("auth-logout"));
        return Promise.reject(refreshError);
      }
    }

    // BKAV HaiHS : Bắt lỗi 429 Rate Limit và phát sự kiện hiển thị toast - start
    if (error.response && error.response.status === 429) {
      const message = error.response.data?.message || "rate_limit_exceeded";
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { message, type: "error" },
        }),
      );
      error._alreadyToasted = true;
    }
    // BKAV HaiHS : Bắt lỗi 429 Rate Limit và phát sự kiện hiển thị toast - end

    return Promise.reject(error);
  },
);
// BKAV HaiHS : Response Interceptor tự động refresh token khi gặp lỗi 401 - end

export default apiClient;
