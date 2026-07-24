import axios from "axios";

// Biến lưu token tạm thời trong RAM của trình duyệt
let _accessToken = null;

export const setAccessToken = (token) => {
  _accessToken = token;
};

export const getAccessToken = () => {
  return _accessToken;
};

// BKAV HaiHS : Khởi tạo cấu hình cấu trúc Axios Instance dùng chung - start
const apiClient = axios.create({
  // Tự động bốc URL Server từ biến môi trường, fallback về localhost
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Cho phép trình duyệt tự gửi kèm Cookie (refreshToken) lên Backend
});
// BKAV HaiHS : Khởi tạo cấu hình cấu trúc Axios Instance dùng chung - end

let refreshPromise = null;

// Hàm memoized để gom các cuộc gọi /auth/refresh song song thành một promise duy nhất
export const memoizedRefresh = () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  refreshPromise = axios
    .post(
      `${baseUrl}/auth/refresh`,
      {},
      { withCredentials: true }
    )
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

// BKAV HaiHS : Tự động gài Token từ RAM vào Header - start
apiClient.interceptors.request.use(
  (config) => {
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
// BKAV HaiHS : Tự động gài Token từ RAM vào Header - end

// BKAV HaiHS : Response Interceptor tự động refresh token khi gặp lỗi 401 - start
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu gặp lỗi 401 (Access Token hết hạn) và chưa thử lại lần nào, đồng thời không phải là các request liên quan đến auth (refresh, login, logout)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes("/auth/refresh") &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/logout")
    ) {
      originalRequest._retry = true;
      try {
        // Gọi API /auth/refresh để lấy Access Token mới qua cơ chế gom cuộc gọi
        const res = await memoizedRefresh();
        const newAccessToken = res.data.data.token;

        // Lưu lại token mới vào RAM
        setAccessToken(newAccessToken);

        // Cập nhật token mới vào request và gửi lại
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Nếu gọi refresh bị lỗi (Refresh Token hết hạn) -> Xóa token và báo đăng xuất
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent("auth-logout"));
        return Promise.reject(refreshError);
      }
    }

    // BKAV HaiHS : Bắt lỗi 429 Rate Limit và phát sự kiện hiển thị toast - start
    if (error.response && error.response.status === 429) {
      const message = error.response.data?.message || "Thao tác quá nhanh, vui lòng thử lại!";
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { message, type: "error" },
        })
      );
      error._alreadyToasted = true;
    }
    // BKAV HaiHS : Bắt lỗi 429 Rate Limit và phát sự kiện hiển thị toast - end

    return Promise.reject(error);
  }
);
// BKAV HaiHS : Response Interceptor tự động refresh token khi gặp lỗi 401 - end

export default apiClient;
