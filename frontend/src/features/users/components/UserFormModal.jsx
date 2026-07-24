import React, { useState, useEffect, useRef } from "react";
import { FiX, FiChevronDown, FiLoader } from "react-icons/fi";
import { useToast } from "@/components/Toast";
import { createUserApi, updateUserApi } from "@/features/users/userApi";
import { searchGroupsApi } from "@/features/groups/groupApi";
import ConfirmModal from "@/components/ConfirmModal";
import { useLanguage } from "@/context/LanguageContext"; // BKAV HaiHS: Import hook ngôn ngữ

// BKAV HaiHS: Component Modal da nang hop nhat chuc nang quan ly thanh vien - start
const UserFormModal = ({
  isOpen,
  onClose,
  userToEdit,
  isViewMode = false,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const { showToast } = useToast();
  const { t, tError } = useLanguage(); // BKAV HaiHS: Khai báo hàm dịch thuật
  const isEditMode = !!userToEdit;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const fullNameInputRef = useRef(null);

  // Tự động focus vào ô họ tên khi mở modal ở chế độ chỉnh sửa/tạo mới
  useEffect(() => {
    if (isOpen && !isViewMode && fullNameInputRef.current) {
      const timer = setTimeout(() => {
        fullNameInputRef.current.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isViewMode]);


  const [permissions, setPermissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [groupPage, setGroupPage] = useState(1);
  const [groupHasMore, setGroupHasMore] = useState(true);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  // BKAV HaiHS : Cac trang thai bo loc tim kiem nhom - start
  const [groupSearchKeyword, setGroupSearchKeyword] = useState("");
  const groupSearchTimeoutRef = useRef(null);
  // BKAV HaiHS : Cac trang thai bo loc tim kiem nhom - end

  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Kiểm tra xem dữ liệu trong form có thay đổi so với ban đầu không (dirty check)
  const hasChanges = isEditMode
    ? fullName.trim() !== (userToEdit?.fullname || "") ||
      email.trim() !== (userToEdit?.email || "") ||
      selectedGroups.length !== (userToEdit?.groups?.length || 0) ||
      selectedGroups.some((g) => !userToEdit?.groups?.some((ug) => ug.id === g.id))
    : fullName.trim() || email.trim() || selectedGroups.length > 0;


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

  // Reset trạng thái khi đóng modal để không bị lưu trạng thái cũ cho lần mở tiếp theo
  useEffect(() => {
    if (!isOpen) {
      setIsConfirmCancelOpen(false);
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isViewMode) return;
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isViewMode]);

  // BKAV HaiHS : Bộ lọc chống rung cho Dropdown tìm kiếm nhóm trong User Form - start
  useEffect(() => {
    if (isViewMode) return;
    if (groupSearchTimeoutRef.current) clearTimeout(groupSearchTimeoutRef.current);

    groupSearchTimeoutRef.current = setTimeout(() => {
      setGroupHasMore(true);
      fetchGroups(1, false);
    }, 500);

    return () => clearTimeout(groupSearchTimeoutRef.current);
  }, [groupSearchKeyword, isViewMode]);
  // BKAV HaiHS : Bộ lọc chống rung cho Dropdown tìm kiếm nhóm trong User Form - end

  const fetchGroups = async (page = 1, isLoadMore = false) => {
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
  };

  const toggleDropdown = () => {
    if (isViewMode) return;
    if (!isDropdownOpen && groups.length === 0) {
      setGroupHasMore(true);
      fetchGroups(1, false);
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 10) {
      fetchGroups(groupPage + 1, true);
    }
  };

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

  const removeGroupChip = (groupId, e) => {
    e.stopPropagation();
    if (isViewMode) return;
    setSelectedGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

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

  // Lắng nghe sự kiện phím Esc để đóng/hủy modal hoặc đóng dropdown nhóm



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

  const modalTitle = isViewMode
    ? t("modal_title_view")
    : isEditMode
      ? t("modal_title_edit")
      : t("modal_title_create");

  return (
    <>
      <style>{`
        .cyber-scrollbar::-webkit-scrollbar { width: 5px; }
        .cyber-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .cyber-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
        .dark .cyber-scrollbar::-webkit-scrollbar-thumb { background: #2d3748; }
        .cyber-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>

      <div
        onClick={(e) => e.target === e.currentTarget && handleCancelWithCheck()}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none animate-fade-in"
      >
        <div className="w-full max-w-lg bg-white dark:bg-[#161b26] border border-gray-200 dark:border-[#232d42] rounded-2xl shadow-2xl flex flex-col relative overflow-visible transition-colors duration-300">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-[#232d42] flex justify-between items-center bg-gray-50 dark:bg-[#111622]/50 rounded-t-2xl shrink-0 transition-colors">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide">
              {modalTitle}
            </h3>
            <button
              type="button"
              onClick={handleCancelWithCheck}
              className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-all cursor-pointer"
            >
              <FiX size={18} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-5 flex-1 overflow-visible"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase transition-colors">
                {t("full_name")}
              </label>
              <input
                ref={fullNameInputRef}
                type="text"
                disabled={isViewMode}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-[#232d42] focus:border-blue-500/50 text-sm text-gray-900 dark:text-gray-100 rounded-xl px-4 py-3 focus:outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase transition-colors">
                {t("email_address")}
              </label>
              <input
                type="email"
                required
                disabled={isViewMode}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-[#232d42] focus:border-blue-500/50 text-sm text-gray-900 dark:text-gray-100 rounded-xl px-4 py-3 focus:outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600 font-mono"
              />
            </div>

            <div
              className="space-y-2 relative overflow-visible"
              ref={dropdownRef}
            >
              <label className="text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase transition-colors">
                {t("groups_assignment")}
              </label>
              <div
                onClick={toggleDropdown}
                className={`w-full bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-[#232d42] rounded-xl px-3 py-2 flex items-center justify-between gap-2 min-h-[46px] transition-all ${isViewMode ? "cursor-not-allowed opacity-70" : "hover:border-gray-400 dark:hover:border-gray-700 cursor-pointer"}`}
              >
                <div className="flex flex-wrap gap-1.5 items-center flex-1 max-h-[96px] overflow-y-auto cyber-scrollbar pr-1">
                  {selectedGroups.length === 0 ? (
                    <span className="text-sm text-gray-400 pl-1">
                      {isViewMode ? t("no_group_assigned") : t("select_group")}
                    </span>
                  ) : (
                    selectedGroups.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 text-xs font-bold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <span>{g.name}</span>
                        {!isViewMode && (
                          <button
                            type="button"
                            onClick={(e) => removeGroupChip(g.id, e)}
                            className="text-blue-600/40 dark:text-blue-400/60 hover:text-red-500"
                          >
                            <FiX size={12} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {!isViewMode && (
                  <FiChevronDown
                    size={16}
                    className={`text-gray-400 shrink-0 transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-blue-500" : ""}`}
                  />
                )}
              </div>

              {isDropdownOpen && !isViewMode && (
                <div
                  className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-[#232d42] rounded-xl shadow-2xl z-[100] animate-fade-in transition-colors overflow-hidden flex flex-col max-h-[280px]"
                >
                  {/* Ô SEARCH TRONG DROPDOWN NHÓM */}
                  <div className="p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111622]/50">
                    <input
                      type="text"
                      value={groupSearchKeyword}
                      onChange={(e) => setGroupSearchKeyword(e.target.value)}
                      placeholder={t("group_search_placeholder")}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#161b26] border border-gray-200 dark:border-[#232d42] rounded-lg outline-none focus:border-blue-500 text-gray-800 dark:text-gray-200 transition-colors"
                      onClick={(e) => e.stopPropagation()} // Tránh đóng dropdown khi nhấp vào input
                    />
                  </div>

                  <div
                    onScroll={handleDropdownScroll}
                    className="cyber-scrollbar flex-1 overflow-y-auto max-h-[210px]"
                  >
                    {groups.length === 0 && !isLoadingGroups ? (
                      <div className="p-4 text-xs text-gray-500 italic text-center">
                        {t("no_group_found")}
                      </div>
                    ) : (
                      groups.map((group) => {
                        const isChecked = selectedGroups.some(
                          (g) => g.id === group.id,
                        );
                        return (
                          <div
                            key={group.id}
                            onClick={() => handleSelectGroup(group)}
                            className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors ${isChecked ? "bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                          >
                            <span>{group.name}</span>
                            {isChecked && (
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            )}
                          </div>
                        );
                      })
                    )}
                    {isLoadingGroups && (
                      <div className="py-2.5 flex justify-center items-center text-blue-500 bg-gray-50/50 dark:bg-[#0b0f19]/20">
                        <FiLoader size={14} className="animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {isViewMode && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase transition-colors">
                  {t("system_permissions")}
                </label>
                <div className="cyber-scrollbar w-full bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-[#232d42] rounded-xl px-3 py-3 flex flex-wrap gap-2 min-h-[46px] max-h-36 overflow-y-auto cursor-not-allowed opacity-80 transition-colors">
                  {permissions.length === 0 ? (
                    <span className="text-sm text-gray-400 pl-1 italic">
                      {t("no_perms_assigned")}
                    </span>
                  ) : (
                    permissions.map((perm, idx) => (
                      <div
                        key={idx}
                        className="bg-emerald-50 dark:bg-emerald-600/10 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        {perm}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="pt-6 mt-8 border-t border-gray-200 dark:border-[#232d42] flex justify-end items-center gap-3 bg-white dark:bg-[#161b26] relative z-10 transition-colors">
              {/* BKAV HaiHS : Điều chỉnh các nút chức năng ở chế độ xem chi tiết - start */}
              {isViewMode ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-600/10 cursor-pointer"
                >
                  {t("close")}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancelWithCheck}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-[#232d42] bg-gray-50 dark:bg-[#111622] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
                  >
                    {t("cancel_btn")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !email.trim() || !fullName.trim() || (isEditMode && !hasChanges)}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-600/10 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 cursor-pointer flex items-center gap-2 min-w-[120px] justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <FiLoader size={14} className="animate-spin" />{" "}
                        <span>{t("processing")}</span>
                      </>
                    ) : (
                      <span>
                        {isEditMode ? t("update_user") : t("create_user")}
                      </span>
                    )}
                  </button>
                </>
              )}
              {/* BKAV HaiHS : Điều chỉnh các nút chức năng ở chế độ xem chi tiết - end */}
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmCancelOpen}
        onClose={() => setIsConfirmCancelOpen(false)}
        onConfirm={onClose}
        title={t("confirm_cancel")}
        message={t("confirm_cancel_msg")}
        confirmText={t("agree_cancel")}
        cancelText={t("keep_editing")}
        type="warning"
      />
    </>
  );
};
// BKAV HaiHS: Component Modal da nang hop nhat chuc nang quan ly thanh vien - end

export default UserFormModal;
