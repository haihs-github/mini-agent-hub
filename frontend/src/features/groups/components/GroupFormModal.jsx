import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiX, FiCpu, FiLoader } from "react-icons/fi";
import { useToast } from "@/components/Toast";
import { createGroupApi, updateGroupApi, searchUsersApi } from "@/features/groups/groupApi";
import ConfirmModal from "@/components/ConfirmModal";
import { useLanguage } from "@/context/LanguageContext";

// BKAV HaiHS: Component Tạo mới, Sửa đổi và Xem chi tiết nhóm quyền - start
const GroupFormModal = ({
  isOpen,
  onClose,
  groupToEdit,
  isViewMode = false,
  onSuccess,
}) => {
  if (!isOpen) return null;

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

  const userMatrix = [
    { id: "USER_C", action: t("act_create"), desc: t("desc_new_res") },
    { id: "USER_R", action: t("act_read"), desc: t("desc_res_data") },
    { id: "USER_U", action: t("act_update"), desc: t("desc_edit_content") },
    { id: "USER_D", action: t("act_delete"), desc: t("desc_remove_assets") },
  ];

  const groupMatrix = [
    { id: "GROUP_C", action: t("act_create"), desc: t("desc_new_groups") },
    { id: "GROUP_R", action: t("act_read"), desc: t("desc_group_data") },
    { id: "GROUP_U", action: t("act_update"), desc: t("desc_edit_group") },
    { id: "GROUP_D", action: t("act_delete"), desc: t("desc_delete_group") },
    {
      id: "GROUP_ADD_USER",
      action: t("act_add_user"),
      desc: t("desc_add_bulk"),
    },
    {
      id: "GROUP_DELETE_USER",
      action: t("act_del_user"),
      desc: t("desc_del_bulk"),
    },
  ];

  // Kiểm tra xem dữ liệu trong form có thay đổi so với ban đầu không (dirty check)
  const originalMembers = groupToEdit?.users || groupToEdit?.members || [];
  const hasChanges = isEditMode
    ? name.trim() !== (groupToEdit?.name || "") ||
      selectedPermissions.length !== (groupToEdit?.permissions?.length || 0) ||
      selectedPermissions.some((p) => !groupToEdit?.permissions?.includes(p)) ||
      members.length !== originalMembers.length ||
      members.some((m) => !originalMembers.some((om) => om.id === m.id))
    : name.trim() || selectedPermissions.length > 0 || members.length > 0;



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
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isViewMode]);

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

  const handleSearchScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight + 5 &&
      searchHasMore &&
      !isSearching
    ) {
      executeSearch(searchKeyword, searchPage + 1, true);
    }
  };

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

  const handleRemoveMember = (userId) => {
    if (isViewMode) return;
    setMembers((prev) => prev.filter((m) => m.id !== userId));
  };

  const handleTogglePermission = (permId) => {
    if (isViewMode) return;
    setSelectedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((p) => p !== permId)
        : [...prev, permId],
    );
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

  const currentMatrix = activeTab === "user" ? userMatrix : groupMatrix;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && handleCancelWithCheck()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none animate-fade-in"
    >
      <div className="w-full max-w-xl max-h-[90vh] bg-white dark:bg-[#161b26] border border-gray-200 dark:border-[#232d42] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden transition-colors">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-[#232d42] flex justify-between items-start bg-gray-50 dark:bg-[#111622]/30 rounded-t-2xl relative transition-colors">
          <div className="space-y-1">
            <h3 className="text-md font-bold text-gray-900 dark:text-white tracking-wide">
              {t("group_modal_title")}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {t("group_modal_subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancelWithCheck}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800/60 transition-all absolute right-5 top-5"
          >
            <FiX size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 flex-1 overflow-y-auto cyber-scrollbar"
        >
          <div className="space-y-2.5">
            <label className="text-[10px] font-mono font-bold tracking-widest text-blue-600 dark:text-blue-400/90 uppercase">
              {t("identity")}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {t("group_name")}
                </label>
                <input
                  type="text"
                  required
                  disabled={isViewMode}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Research Team"
                  className="w-full bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-[#232d42] focus:border-blue-500/40 text-sm text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {t("entity_type")}
                </label>
                <div className="flex bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-[#232d42] p-1 rounded-xl h-[44px] items-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab("user")}
                    className={`flex-1 h-full rounded-lg text-xs font-bold ${activeTab === "user" ? "bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white shadow-sm" : "text-gray-500"}`}
                  >
                    {t("users")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("group")}
                    className={`flex-1 h-full rounded-lg text-xs font-bold ${activeTab === "group" ? "bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white shadow-sm" : "text-gray-500"}`}
                  >
                    {t("groups")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-mono font-bold tracking-widest text-blue-600 dark:text-blue-400/90 uppercase">
              {t("rbac_matrix")}
            </label>
            <div className="w-full bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-[#232d42] rounded-xl overflow-y-auto h-[330px] cyber-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-[#232d42] text-[10px] font-bold text-gray-500 bg-gray-100/50 dark:bg-[#111622]/40">
                    <th className="py-3 px-4">{t("action")}</th>
                    <th className="py-3 px-4">{t("desc")}</th>
                    <th className="py-3 px-4 text-center">{t("grant")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#232d42]/40 text-xs">
                  {currentMatrix.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => !isViewMode && handleTogglePermission(row.id)}
                      className={`transition-colors ${isViewMode ? "" : "cursor-pointer hover:bg-gray-100 dark:hover:bg-[#1e2533]/20"}`}
                    >
                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-gray-200">
                        {row.action}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 select-none">
                        {row.desc}
                      </td>
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          disabled={isViewMode}
                          checked={selectedPermissions.includes(row.id)}
                          onChange={() => handleTogglePermission(row.id)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-5 mt-6 border-t border-gray-200 dark:border-[#232d42] flex justify-end gap-4 bg-white dark:bg-[#161b26]">
            {isViewMode ? (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-full transition-all duration-200 shadow-lg shadow-blue-600/10 cursor-pointer"
              >
                {t("close")}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancelWithCheck}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-[#232d42] bg-gray-50 dark:bg-[#111622] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("cancel_btn")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim() || (isEditMode && !hasChanges)}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed disabled:active:scale-100 rounded-full transition-all shadow-lg shadow-blue-600/10 cursor-pointer flex items-center gap-2 min-w-[110px] justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <FiLoader size={14} className="animate-spin" />
                      <span>{t("processing") || "Đang xử lý..."}</span>
                    </>
                  ) : (
                    <span>{isEditMode ? t("update") : t("initialize")}</span>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
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
    </div>
  );
};

// BKAV HaiHS: Component Tạo mới, Sửa đổi và Xem chi tiết nhóm quyền - end
export default GroupFormModal;
