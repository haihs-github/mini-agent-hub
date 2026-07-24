import apiClient from "@/services/apiClient";

// BKAV HaiHS : gọi API Đăng nhập - start
export const loginApi = async (email, password) => {
  const response = await apiClient.post("/auth/login", { email, password });
  return response.data;
};
// BKAV HaiHS : gọi API Đăng nhập - end

// BKAV HaiHS : API đổi mật khẩu - start
export const changePasswordApi = async (passwordData) => {
  const response = await apiClient.put("/auth/change-password", passwordData);
  return response.data;
};
// BKAV HaiHS : API đổi mật khẩu - end
