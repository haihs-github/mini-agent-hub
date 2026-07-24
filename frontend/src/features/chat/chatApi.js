// file này chứa các hàm gọi api liên quan đến Chat và hội thoại
import apiClient from "@/services/apiClient";

// BKAV HaiHS : Lấy danh sách hội thoại phân trang - start
export const getConversationsApi = async (page = 1, limit = 20) => {
  const response = await apiClient.get(
    `/conversations?page=${page}&limit=${limit}`,
  );
  return response.data;
};
// BKAV HaiHS : Lấy danh sách hội thoại phân trang - end

// BKAV HaiHS : Lấy chi tiết tin nhắn của 1 hội thoại - start
export const getConversationDetailApi = async (id) => {
  const response = await apiClient.get(`/conversations/${id}`);
  return response.data;
};
// BKAV HaiHS : Lấy chi tiết tin nhắn của 1 hội thoại - end

// BKAV HaiHS : Tạo mới một hội thoại - start
export const createConversationApi = async (payload) => {
  const body = typeof payload === "string" ? { title: payload } : payload;
  const response = await apiClient.post("/conversations", body);
  return response.data;
};
// BKAV HaiHS : Tạo mới một hội thoại - end

// BKAV HaiHS : Lấy danh sách các mô hình AI hỗ trợ - start
export const getAiModelsApi = async () => {
  const response = await apiClient.get("/ai/models");
  return response.data;
};
// BKAV HaiHS : Lấy danh sách các mô hình AI hỗ trợ - end

// BKAV HaiHS : Xóa 1 hội thoại - start
export const deleteConversationApi = async (id) => {
  const response = await apiClient.delete(`/conversations/${id}`);
  return response.data;
};
// BKAV HaiHS : Xóa 1 hội thoại - end

// BKAV HaiHS : Xóa toàn bộ lịch sử chat - start
export const clearAllChatHistoryApi = async () => {
  const response = await apiClient.delete("/conversations");
  return response.data;
};
// BKAV HaiHS : Xóa toàn bộ lịch sử chat - end

// BKAV HaiHS : Đổi tên tiêu đề hội thoại - start
export const updateConversationTitleApi = async (id, title) => {
  const response = await apiClient.patch(`/conversations/${id}`, { title });
  return response.data;
};
// BKAV HaiHS : Đổi tên tiêu đề hội thoại - end

// BKAV HaiHS : Dừng tạo phản hồi AI cho hội thoại đang phát - start
export const abortConversationApi = async (id) => {
  const response = await apiClient.post(`/conversations/${id}/abort`);
  return response.data;
};
// BKAV HaiHS : Dừng tạo phản hồi AI cho hội thoại đang phát - end
