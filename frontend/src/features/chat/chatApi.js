// file này chứa các hàm gọi api liên quan đến Chat và hội thoại
import apiClient from "@/services/apiClient";

//BKAS HaiHS : Lấy danh sách hội thoại phân trang - start
export const getConversationsApi = async (page = 1, limit = 20) => {
  const response = await apiClient.get(
    `/conversations?page=${page}&limit=${limit}`,
  );
  console.log("API Response for getConversationsApi:", response.data); // Log dữ liệu trả về từ API
  return response.data;
};
//BKAS HaiHS : Lấy danh sách hội thoại phân trang - end

//BKAS HaiHS : Lấy chi tiết tin nhắn của 1 hội thoại - start
export const getConversationDetailApi = async (id) => {
  const response = await apiClient.get(`/conversations/${id}`);
  return response.data;
};
//BKAS HaiHS : Lấy chi tiết tin nhắn của 1 hội thoại - end

// BKAV HaiHS : Tạo hội thoại mới (Khi gửi prompt đầu tiên) - start
export const createConversationApi = async (title) => {
  const response = await apiClient.post("/conversations", { title });
  return response.data;
};
// BKAV HaiHS : Tạo hội thoại mới (Khi gửi prompt đầu tiên) - end

// BKAV HaiHS : Sửa tên cuộc hội thoại - start
export const updateConversationTitleApi = async (id, title) => {
  const response = await apiClient.put(`/conversations/${id}`, { title });
  return response.data;
};
// BKAV HaiHS : Sửa tên cuộc hội thoại - end

// BKAV HaiHS : Xóa hội thoại - start
export const deleteConversationApi = async (id) => {
  const response = await apiClient.delete(`/conversations/${id}`);
  return response.data;
};
// BKAV HaiHS : Xóa hội thoại - end

// BKAV HaiHS: API xóa toàn bộ các cuộc hội thoại của tài khoản - start
export const clearAllChatHistoryApi = async () => {
  const response = await apiClient.delete("/conversations");
  return response.data;
};
// BKAV HaiHS: API xóa toàn bộ các cuộc hội thoại của tài khoản - end
