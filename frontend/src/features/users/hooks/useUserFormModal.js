import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useToast } from "@/components/Toast";
import { createUserApi, updateUserApi } from "@/features/users/userApi";
import { searchGroupsApi } from "@/features/groups/groupApi";
import { useLanguage } from "@/context/LanguageContext";
import { useOutsideClick } from "@/hooks/useOutsideClick";

// BKAV HaiHS : Custom Hook quản lý toàn bộ state và logic nghiệp vụ form người dùng - start
export const useUserFormModal = ({
  isOpen,
  onClose,
  userToEdit,
  isViewMode = false,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const { t, tError } = useLanguage();
  const isEditMode = !!userToEdit;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [groupPage, setGroupPage] = useState(1);
  const [groupHasMore, setGroupHasMore] = useState(true);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  const [groupSearchKeyword, setGroupSearchKeyword] = useState("");
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  const fullNameInputRef = useRef(null);
  const groupSearchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // BKAV HaiHS : Tự động focus vào ô họ tên khi mở modal ở chế độ chỉnh sửa/tạo mới - start
  useEffect(() => {
    if (isOpen && !isViewMode && fullNameInputRef.current) {
      fullNameInputRef.current.focus();
    }
  }, [isOpen, isViewMode]);
  // BKAV HaiHS : Tự động focus vào ô họ tên khi mở modal ở chế độ chỉnh sửa/tạo mới - end

  // BKAV HaiHS : Đóng gói kiểm tra thay đổi dữ liệu form (dirty check) bằng useMemo - start
  const hasChanges = useMemo(() => {
    if (!isEditMode) {
      return fullName.trim() !== "" || email.trim() !== "" || selectedGroups.length > 0;
    }
    const originalGroups = userToEdit?.groups || [];
    return (
      fullName.trim() !== (userToEdit?.fullname || "") ||
      email.trim() !== (userToEdit?.email || "") ||
      selectedGroups.length !== originalGroups.length ||
      selectedGroups.some((g) => !originalGroups.some((ug) => ug.id === g.id))
    );
  }, [isEditMode, fullName, email, selectedGroups, userToEdit]);
  // BKAV HaiHS : Đóng gói kiểm tra thay đổi dữ liệu form (dirty check) bằng useMemo - end

  // BKAV HaiHS : Cập nhật thông tin người dùng và tính toán quyền tổng hợp khi xem/chỉnh sửa - start
  useEffect(() => {
    if ((isEditMode || isViewMode) && userToEdit) {
      setFullName(userToEdit.fullname || "");
      setEmail(userToEdit.email || "");
      setSelectedGroups(userToEdit.groups || []);

      const directPermissions = userToEdit.permissions || [];
      const inheritedPermissions =
        userToEdit.groups?.flatMap((group) => group.permissions || []) || [];
      const totalCombinedPermissions = Array.from(
        new Set([...directPermissions, ...inheritedPermissions]),
      );

      setPermissions(totalCombinedPermissions);
    } else {
      setFullName("");
      setEmail("");
      setSelectedGroups([]);
      setPermissions([]);
    }
  }, [userToEdit, isEditMode, isViewMode, isOpen]);
  // BKAV HaiHS : Cập nhật thông tin người dùng và tính toán quyền tổng hợp khi xem/chỉnh sửa - end

  // BKAV HaiHS : Reset trạng thái khi đóng modal để không bị lưu dữ liệu cũ - start
  useEffect(() => {
    if (!isOpen) {
      setIsConfirmCancelOpen(false);
      setIsDropdownOpen(false);
    }
  }, [isOpen]);
  // BKAV HaiHS : Reset trạng thái khi đóng modal để không bị lưu dữ liệu cũ - end

  // BKAV HaiHS : Tự động đóng dropdown chọn nhóm khi nhấp chuột ra ngoài - start
  useOutsideClick(dropdownRef, () => {
    if (!isViewMode) setIsDropdownOpen(false);
  });
  // BKAV HaiHS : Tự động đóng dropdown chọn nhóm khi nhấp chuột ra ngoài - end

  // BKAV HaiHS : Tải danh sách nhóm quyền từ API hỗ trợ tìm kiếm và phân trang - start
  const fetchGroups = useCallback(
    async (page = 1, isLoadMore = false) => {
      if (isLoadingGroups || (!groupHasMore && isLoadMore)) return;
      setIsLoadingGroups(true);
      try {
        const res = await searchGroupsApi(groupSearchKeyword, page, 10);
        const fetchedList = res?.data || (Array.isArray(res) ? res : []);

        if (isLoadMore) {
          setGroups((prev) => [...prev, ...fetchedList]);
        } else {
          setGroups(fetchedList);
        }

        if (fetchedList.length < 10) setGroupHasMore(false);
        setGroupPage(page);
      } catch (err) {
        console.error("Lỗi fetchGroups:", err);
      } finally {
        setIsLoadingGroups(false);
      }
    },
    [groupSearchKeyword, groupHasMore, isLoadingGroups],
  );
  // BKAV HaiHS : Tải danh sách nhóm quyền từ API hỗ trợ tìm kiếm và phân trang - end

  // BKAV HaiHS : Kích hoạt tìm kiếm nhóm tự động với kỹ thuật debounce 500ms - start
  useEffect(() => {
    if (isViewMode) return;
    if (groupSearchTimeoutRef.current) clearTimeout(groupSearchTimeoutRef.current);

    groupSearchTimeoutRef.current = setTimeout(() => {
      setGroupHasMore(true);
      fetchGroups(1, false);
    }, 500);

    return () => clearTimeout(groupSearchTimeoutRef.current);
  }, [groupSearchKeyword, isViewMode, fetchGroups]);
  // BKAV HaiHS : Kích hoạt tìm kiếm nhóm tự động với kỹ thuật debounce 500ms - end

  // BKAV HaiHS : Bật/tắt dropdown chọn nhóm và nạp danh sách ban đầu nếu trống - start
  const toggleDropdown = () => {
    if (isViewMode) return;
    if (!isDropdownOpen && groups.length === 0) {
      setGroupHasMore(true);
      fetchGroups(1, false);
    }
    setIsDropdownOpen(!isDropdownOpen);
  };
  // BKAV HaiHS : Bật/tắt dropdown chọn nhóm và nạp danh sách ban đầu nếu trống - end

  // BKAV HaiHS : Xử lý cuộn danh sách nhóm để tải thêm dữ liệu trang tiếp theo - start
  const handleDropdownScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 10) {
      fetchGroups(groupPage + 1, true);
    }
  };
  // BKAV HaiHS : Xử lý cuộn danh sách nhóm để tải thêm dữ liệu trang tiếp theo - end

  // BKAV HaiHS : Bật/tắt việc gán một nhóm quyền cho người dùng - start
  const handleSelectGroup = (group) => {
    if (isViewMode) return;
    if (selectedGroups.some((g) => g.id === group.id)) {
      setSelectedGroups((prev) => prev.filter((g) => g.id !== group.id));
    } else {
      setSelectedGroups((prev) => [
        ...prev,
        { id: group.id, name: group.name },
      ]);
    }
  };
  // BKAV HaiHS : Bật/tắt việc gán một nhóm quyền cho người dùng - end

  // BKAV HaiHS : Xóa chip nhóm đã chọn khỏi danh sách - start
  const removeGroupChip = (groupId, e) => {
    e.stopPropagation();
    if (isViewMode) return;
    setSelectedGroups((prev) => prev.filter((g) => g.id !== groupId));
  };
  // BKAV HaiHS : Xóa chip nhóm đã chọn khỏi danh sách - end

  // BKAV HaiHS : Kiểm tra thay đổi dữ liệu trước khi hủy thao tác - start
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
  // BKAV HaiHS : Kiểm tra thay đổi dữ liệu trước khi hủy thao tác - end

  // BKAV HaiHS : Thực thi tạo mới hoặc cập nhật thông tin người dùng - start
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode || !email.trim() || !fullName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const payload = {
      fullname: fullName.trim(),
      email: email.trim(),
      groupIds: selectedGroups.map((g) => g.id),
    };

    try {
      if (isEditMode) {
        await updateUserApi(userToEdit.id, payload);
        showToast(t("toast_user_update_success"), "success");
      } else {
        await createUserApi(payload);
        showToast(t("toast_user_create_success"), "success");
      }
      onSuccess();
      onClose();
    } catch (err) {
      showToast(tError(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  // BKAV HaiHS : Thực thi tạo mới hoặc cập nhật thông tin người dùng - end

  const modalTitle = isViewMode
    ? t("modal_title_view")
    : isEditMode
      ? t("modal_title_edit")
      : t("modal_title_create");

  return {
    // state
    fullName,
    setFullName,
    email,
    setEmail,
    selectedGroups,
    permissions,
    isSubmitting,
    isDropdownOpen,
    groups,
    isLoadingGroups,
    groupSearchKeyword,
    setGroupSearchKeyword,
    isConfirmCancelOpen,
    setIsConfirmCancelOpen,
    // refs
    fullNameInputRef,
    dropdownRef,
    // derived
    isEditMode,
    hasChanges,
    modalTitle,
    // handlers
    toggleDropdown,
    handleDropdownScroll,
    handleSelectGroup,
    removeGroupChip,
    handleCancelWithCheck,
    handleSubmit,
  };
};
// BKAV HaiHS : Custom Hook quản lý toàn bộ state và logic nghiệp vụ form người dùng - end
