import { useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { useToast } from "@/components/Toast";
import {
  getUsersApi,
  deleteUserApi,
  searchUsersApi,
} from "@/features/users/userApi";
import { useLanguage } from "@/context/LanguageContext";
import { useUserSearch } from "@/features/users/hooks/useUserSearch";
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

// BKAV HaiHS : Custom Hook quản lý toàn bộ state, quyền hạn và logic điều phối của trang UserWindow - start
export const useUserWindow = () => {
  const { permissions } = useAuth();
  const { showToast } = useToast();
  const { t, tError } = useLanguage();
  const userPermissions = permissions || [];

  const hasAnyUserPermission = userPermissions.some((p) =>
    p.startsWith("USER_"),
  );
  const canCreate = userPermissions.includes("USER_C");
  const canRead = userPermissions.includes("USER_R");
  const canUpdate = userPermissions.includes("USER_U");
  const canDelete = userPermissions.includes("USER_D");
  const canAddToGroup = userPermissions.includes("GROUP_ADD_USER");

  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isConfirmBulkDeleteOpen, setIsConfirmBulkDeleteOpen] = useState(false);
  const [isBulkGroupOpen, setIsBulkGroupOpen] = useState(false);

  // BKAV HaiHS : Khởi tạo hook tìm kiếm người dùng nâng cao Autocomplete - start
  const searchHook = useUserSearch({
    onSearchChange: ({ page }) => setCurrentPage(page),
  });
  // BKAV HaiHS : Khởi tạo hook tìm kiếm người dùng nâng cao Autocomplete - end

  const { selectedDropdownUser, activeSearchQuery } = searchHook;

  // BKAV HaiHS : Dùng useQuery để cache phân trang và lấy danh sách người dùng - start
  const {
    data,
    isLoading: isQueryLoading,
    isFetching,
  } = useQuery({
    queryKey: selectedDropdownUser
      ? ["users", "single", selectedDropdownUser.id]
      : activeSearchQuery
        ? ["users", "search", activeSearchQuery, currentPage, 10]
        : ["users", "list", currentPage, 10],
    queryFn: async () => {
      if (!canRead)
        return { data: [], pagination: { totalPages: 1, totalItems: 0 } };

      if (selectedDropdownUser) {
        try {
          return await searchUsersApi(selectedDropdownUser.email, 1, 1);
        } catch (err) {
          return {
            data: [],
            pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
          };
        }
      }

      if (activeSearchQuery) {
        return await searchUsersApi(activeSearchQuery, currentPage, 10);
      }

      return await getUsersApi(currentPage, 10);
    },
    placeholderData: keepPreviousData,
    staleTime: activeSearchQuery ? 10000 : undefined,
  });

  const users = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const totalItems = data?.pagination?.totalItems || 0;
  const isLoading = isQueryLoading;

  const loadUsers = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };
  // BKAV HaiHS : Dùng useQuery để cache phân trang và lấy danh sách người dùng - end

  // BKAV HaiHS : Mở modal tạo mới người dùng - start
  const handleOpenAddModal = () => {
    setUserToEdit(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };
  // BKAV HaiHS : Mở modal tạo mới người dùng - end

  // BKAV HaiHS : Mở modal chỉnh sửa thông tin người dùng - start
  const handleOpenEditModal = (user) => {
    setUserToEdit(user);
    setIsViewMode(false);
    setIsModalOpen(true);
  };
  // BKAV HaiHS : Mở modal chỉnh sửa thông tin người dùng - end

  // BKAV HaiHS : Mở modal xem chi tiết thông tin người dùng (chỉ đọc) - start
  const handleOpenViewModal = (user) => {
    setUserToEdit(user);
    setIsViewMode(true);
    setIsModalOpen(true);
  };
  // BKAV HaiHS : Mở modal xem chi tiết thông tin người dùng (chỉ đọc) - end

  // BKAV HaiHS : Mở modal xác nhận trước khi xóa một người dùng - start
  const handleOpenDeleteConfirm = (user) => {
    if (!canDelete) {
      showToast(t("toast_no_delete_perm"), "warning");
      return;
    }
    setUserToDelete(user);
    setIsConfirmDeleteOpen(true);
  };
  // BKAV HaiHS : Mở modal xác nhận trước khi xóa một người dùng - end

  // BKAV HaiHS : Thực thi xóa người dùng đơn lẻ qua API - start
  const handleExecuteDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUserApi(userToDelete.id);
      showToast(t("toast_delete_success"), "success");
      loadUsers();
    } catch (err) {
      showToast(tError(err), "error");
    } finally {
      setUserToDelete(null);
      setIsConfirmDeleteOpen(false);
    }
  };
  // BKAV HaiHS : Thực thi xóa người dùng đơn lẻ qua API - end

  // BKAV HaiHS : Thực thi xóa hàng loạt người dùng đã chọn qua API - start
  const handleExecuteBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    try {
      const userIds = selectedUsers.map((u) => u.id);
      await Promise.all(userIds.map((id) => deleteUserApi(id)));
      showToast(
        t("toast_bulk_delete_success") +
          ` ${selectedUsers.length} ` +
          t("users_selected"),
        "success",
      );
      setSelectedUsers([]);
      loadUsers();
    } catch (err) {
      showToast(t("toast_bulk_delete_fail"), "error");
    } finally {
      setIsConfirmBulkDeleteOpen(false);
    }
  };
  // BKAV HaiHS : Thực thi xóa hàng loạt người dùng đã chọn qua API - end

  // BKAV HaiHS : Mở modal thêm hàng loạt người dùng vào nhóm quyền - start
  const handleOpenBulkGroupModal = () => {
    if (!canAddToGroup) {
      showToast(t("toast_no_add_group_perm"), "warning");
      return;
    }
    setIsBulkGroupOpen(true);
  };
  // BKAV HaiHS : Mở modal thêm hàng loạt người dùng vào nhóm quyền - end

  // BKAV HaiHS : Cập nhật lại danh sách và xóa danh sách đã chọn sau khi gộp nhóm thành công - start
  const handleBulkGroupSuccess = () => {
    setSelectedUsers([]);
    loadUsers();
  };
  // BKAV HaiHS : Cập nhật lại danh sách và xóa danh sách đã chọn sau khi gộp nhóm thành công - end

  return {
    // permissions
    hasAnyUserPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    // query & data
    users,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    isLoading,
    isFetching,
    loadUsers,
    // search hook
    searchHook,
    // modal states
    isModalOpen,
    setIsModalOpen,
    userToEdit,
    isViewMode,
    isConfirmDeleteOpen,
    setIsConfirmDeleteOpen,
    selectedUsers,
    setSelectedUsers,
    isConfirmBulkDeleteOpen,
    setIsConfirmBulkDeleteOpen,
    isBulkGroupOpen,
    setIsBulkGroupOpen,
    // handlers
    handleOpenAddModal,
    handleOpenEditModal,
    handleOpenViewModal,
    handleOpenDeleteConfirm,
    handleExecuteDelete,
    handleExecuteBulkDelete,
    handleOpenBulkGroupModal,
    handleBulkGroupSuccess,
    t,
  };
};
// BKAV HaiHS : Custom Hook quản lý toàn bộ state, quyền hạn và logic điều phối của trang UserWindow - end
