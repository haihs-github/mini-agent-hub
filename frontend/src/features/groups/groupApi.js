import apiClient from "@/services/apiClient";

// BKAV HaiHS: Goi API Lấy danh sách nhóm - start
export const getGroupsListApi = async (page = 1, limit = 10) => {
  const response = await apiClient.get(`/groups?page=${page}&limit=${limit}`);
  return response.data;
};
// BKAV HaiHS: Goi API Lấy danh sách nhóm - end

// BKAV HaiHS: Thuc thi gui payload tao moi mot nhom quyen han vao he thong - start
export const createGroupApi = async (groupData) => {
  const response = await apiClient.post("/groups/create", groupData);
  return response.data;
};
// BKAV HaiHS: Thuc thi gui payload tao moi mot nhom quyen han vao he thong - end

// BKAV HaiHS: API cap nhat thong tin nhom da co san trong co so du lieu - start
export const updateGroupApi = async (groupId, groupData) => {
  const response = await apiClient.put(`/groups/${groupId}`, groupData);
  return response.data;
};
// BKAV HaiHS: API cap nhat thong tin nhom da co san trong co so du lieu - end

// BKAV HaiHS: API quet tim kiem nhan su phan trang theo tu khoa de gan vao nhom - start
export const searchUsersApi = async (keyword, page = 1, limit = 10) => {
  const response = await apiClient.get(
    `/users/search?keyword=${keyword}&page=${page}&limit=${limit}`,
  );
  return response.data;
};
// BKAV HaiHS: API quet tim kiem nhan su phan trang theo tu khoa de gan vao nhom - end

// BKAV HaiHS: Thực hiện gửi yêu cầu xóa vĩnh viễn một nhóm quyền khỏi cơ sở dữ liệu
export const deleteGroupApi = async (groupId) => {
  const response = await apiClient.delete(`/groups/${groupId}`);
  return response.data;
};
// BKAV HaiHS: Thực hiện gửi yêu cầu xóa vĩnh viễn một nhóm quyền khỏi cơ sở dữ liệu - end

// BKAV HaiHS: Gọi API lấy thông tin chi tiết một nhóm bao gồm danh sách toàn bộ thành viên hiện tại - start
export const getGroupDetailsApi = async (groupId) => {
  const response = await apiClient.get(`/groups/${groupId}`);
  return response.data;
};
// BKAV HaiHS: Gọi API lấy thông tin chi tiết một nhóm bao gồm danh sách toàn bộ thành viên hiện tại - start

// BKAV HaiHS: api delete thành viên ra khỏi nhóm quyền - start
export const removeUserFromGroupApi = async (groupId, userId) => {
  const response = await apiClient.delete(`/groups/${groupId}/users`, {
    data: { userIds: [userId] },
  });
  return response.data;
};
// BKAV HaiHS: api delete thành viên ra khỏi nhóm quyền - end

// BKAV HaiHS: API quét tìm kiếm nhóm phân trang theo từ khóa - start
export const searchGroupsApi = async (keyword, page = 1, limit = 10) => {
  const response = await apiClient.get(
    `/groups/search?keyword=${keyword}&page=${page}&limit=${limit}`,
  );
  return response.data;
};
// BKAV HaiHS: API quét tìm kiếm nhóm phân trang theo từ khóa - end
