import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useToast } from "@/components/Toast";
import {
  createGroupApi,
  updateGroupApi,
  searchUsersApi,
} from "@/features/groups/groupApi";
import { useLanguage } from "@/context/LanguageContext";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import {
  USER_PERMISSION_MATRIX,
  GROUP_PERMISSION_MATRIX,
} from "@/features/groups/constants/groupConstants";

// BKAV HaiHS : Custom Hook quản lý toàn bộ state và nghiệp vụ form nhóm quyền - start
export const useGroupFormModal = ({
  isOpen,
  onClose,
  groupToEdit,
  isViewMode = false,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const { t, tError } = useLanguage();
  const isEditMode = !!groupToEdit;

  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState("user");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // BKAV HaiHS : Sử dụng useMemo để đóng gói ma trận phân quyền và chỉ khởi tạo lại khi hàm dịch t thay đổi - start
  const userMatrix = useMemo(
    () =>
      USER_PERMISSION_MATRIX.map((item) => ({
        id: item.id,
        action: t(item.actionKey),
        desc: t(item.descKey),
      })),
    [t],
  );

  const groupMatrix = useMemo(
    () =>
      GROUP_PERMISSION_MATRIX.map((item) => ({
        id: item.id,
        action: t(item.actionKey),
        desc: t(item.descKey),
      })),
    [t],
  );
  // BKAV HaiHS : Sử dụng useMemo để đóng gói ma trận phân quyền và chỉ khởi tạo lại khi hàm dịch t thay đổi - end

  // BKAV HaiHS : Kiểm tra xem dữ liệu trong form có thay đổi so với ban đầu không (dirty check) - start
  const originalMembers = groupToEdit?.users || groupToEdit?.members || [];
  const hasChanges = isEditMode
    ? name.trim() !== (groupToEdit?.name || "") ||
      selectedPermissions.length !== (groupToEdit?.permissions?.length || 0) ||
      selectedPermissions.some((p) => !groupToEdit?.permissions?.includes(p)) ||
      members.length !== originalMembers.length ||
      members.some((m) => !originalMembers.some((om) => om.id === m.id))
    : name.trim() || selectedPermissions.length > 0 || members.length > 0;
  // BKAV HaiHS : Kiểm tra xem dữ liệu trong form có thay đổi so với ban đầu không (dirty check) - end

  // BKAV HaiHS : Cập nhật state dữ liệu form khi modal được mở hoặc thay đổi groupToEdit - start
  useEffect(() => {
    if ((isEditMode || isViewMode) && groupToEdit) {
      setName(groupToEdit.name || "");
      setSelectedPermissions(groupToEdit.permissions || []);
      setMembers(groupToEdit.users || groupToEdit.members || []);
    } else {
      setName("");
      setSelectedPermissions([]);
      setMembers([]);
    }
    setActiveTab("user");
    setSearchKeyword("");
    setSearchResults([]);
  }, [groupToEdit, isEditMode, isViewMode, isOpen]);
  // BKAV HaiHS : Cập nhật state dữ liệu form khi modal được mở hoặc thay đổi groupToEdit - end

  // BKAV HaiHS : Reset trạng thái khi đóng modal để không bị lưu trạng thái cũ cho lần mở tiếp theo - start
  useEffect(() => {
    if (!isOpen) {
      setIsConfirmCancelOpen(false);
      setIsDropdownOpen(false);
    }
  }, [isOpen]);
  // BKAV HaiHS : Reset trạng thái khi đóng modal để không bị lưu trạng thái cũ cho lần mở tiếp theo - end

  // BKAV HaiHS : Sử dụng useOutsideClick hook để tự động đóng dropdown tìm kiếm khi click ra ngoài - start
  useOutsideClick(searchRef, () => {
    if (!isViewMode) setIsDropdownOpen(false);
  });
  // BKAV HaiHS : Sử dụng useOutsideClick hook để tự động đóng dropdown tìm kiếm khi click ra ngoài - end

  // BKAV HaiHS : Thực thi API tìm kiếm người dùng theo từ khóa và hỗ trợ phân trang - start
  const executeSearch = useCallback(
    async (keyword, pageNum = 1, isLoadMore = false) => {
      if (!keyword.trim() || isViewMode) {
        setSearchResults([]);
        setIsDropdownOpen(false);
        return;
      }
      setIsSearching(true);
      try {
        const res = await searchUsersApi(keyword, pageNum, 10);
        const fetchedUsers = res?.data || [];
        const pagination = res?.pagination || {};

        if (isLoadMore) {
          setSearchResults((prev) => [...prev, ...fetchedUsers]);
        } else {
          setSearchResults(fetchedUsers);
          setIsDropdownOpen(true);
        }
        setSearchPage(pageNum);
        setSearchHasMore(pageNum < (pagination.totalPages || 1));
      } catch (err) {
        console.error("Lỗi search:", err);
      } finally {
        setIsSearching(false);
      }
    },
    [isViewMode],
  );
  // BKAV HaiHS : Thực thi API tìm kiếm người dùng theo từ khóa và hỗ trợ phân trang - end

  // BKAV HaiHS : Kích hoạt tìm kiếm tự động với kỹ thuật debounce 500ms - start
  useEffect(() => {
    if (isViewMode) return;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!searchKeyword.trim()) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchHasMore(true);
      executeSearch(searchKeyword, 1, false);
    }, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchKeyword, executeSearch, isViewMode]);
  // BKAV HaiHS : Kích hoạt tìm kiếm tự động với kỹ thuật debounce 500ms - end

  // BKAV HaiHS : Xử lý sự kiện cuộn danh sách kết quả tìm kiếm để tải thêm dữ liệu - start
  const handleSearchScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 5 && searchHasMore && !isSearching) {
      executeSearch(searchKeyword, searchPage + 1, true);
    }
  };
  // BKAV HaiHS : Xử lý sự kiện cuộn danh sách kết quả tìm kiếm để tải thêm dữ liệu - end

  // BKAV HaiHS : Chọn người dùng từ danh sách gợi ý để thêm vào nhóm - start
  const handleSelectUser = (user) => {
    if (isViewMode) return;
    if (members.some((m) => m.id === user.id)) {
      showToast(t("toast_user_exist"), "warning");
    } else {
      setMembers((prev) => [
        ...prev,
        { id: user.id, fullname: user.fullname, email: user.email },
      ]);
    }
    setSearchKeyword("");
    setSearchResults([]);
    setIsDropdownOpen(false);
  };
  // BKAV HaiHS : Chọn người dùng từ danh sách gợi ý để thêm vào nhóm - end

  // BKAV HaiHS : Loại bỏ người dùng khỏi danh sách thành viên nhóm - start
  const handleRemoveMember = (userId) => {
    if (isViewMode) return;
    setMembers((prev) => prev.filter((m) => m.id !== userId));
  };
  // BKAV HaiHS : Loại bỏ người dùng khỏi danh sách thành viên nhóm - end

  // BKAV HaiHS : Bật/tắt phân quyền cho nhóm theo mã quyền - start
  const handleTogglePermission = (permId) => {
    if (isViewMode) return;
    setSelectedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((p) => p !== permId)
        : [...prev, permId],
    );
  };
  // BKAV HaiHS : Bật/tắt phân quyền cho nhóm theo mã quyền - end

  // BKAV HaiHS : Kiểm tra thay đổi dữ liệu trước khi đóng modal hủy bỏ - start
  const handleCancelWithCheck = () => {
    if (isViewMode) {
      onClose();
      return;
    }
    if (hasChanges) {
      setIsConfirmCancelOpen(true);
    } else {
      onClose();
    }
  };
  // BKAV HaiHS : Kiểm tra thay đổi dữ liệu trước khi đóng modal hủy bỏ - end

  // BKAV HaiHS : Xử lý submit biểu mẫu tạo mới hoặc cập nhật nhóm quyền - start
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode || !name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      permissions: selectedPermissions,
      userIds: members.map((m) => m.id),
    };

    try {
      if (isEditMode) {
        await updateGroupApi(groupToEdit.id, payload);
        showToast(t("toast_update_success"), "success");
      } else {
        await createGroupApi(payload);
        showToast(t("toast_create_success"), "success");
      }
      onSuccess();
      onClose();
    } catch (err) {
      showToast(tError(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  // BKAV HaiHS : Xử lý submit biểu mẫu tạo mới hoặc cập nhật nhóm quyền - end

  const currentMatrix = activeTab === "user" ? userMatrix : groupMatrix;

  return {
    // state
    name,
    setName,
    selectedPermissions,
    members,
    activeTab,
    setActiveTab,
    isSubmitting,
    isConfirmCancelOpen,
    setIsConfirmCancelOpen,
    searchKeyword,
    setSearchKeyword,
    searchResults,
    isSearching,
    isDropdownOpen,
    searchHasMore,
    // refs
    searchRef,
    // derived
    isEditMode,
    hasChanges,
    currentMatrix,
    // handlers
    handleSearchScroll,
    handleSelectUser,
    handleRemoveMember,
    handleTogglePermission,
    handleCancelWithCheck,
    handleSubmit,
  };
};
// BKAV HaiHS : Custom Hook quản lý toàn bộ state và nghiệp vụ form nhóm quyền - end
