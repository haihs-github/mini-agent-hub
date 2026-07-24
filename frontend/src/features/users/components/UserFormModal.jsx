import React from "react";
import { FiX, FiChevronDown, FiLoader } from "react-icons/fi";
import ConfirmModal from "@/components/ConfirmModal";
import { useLanguage } from "@/context/LanguageContext";
import { useUserFormModal } from "@/features/users/hooks/useUserFormModal";

// BKAV HaiHS: Component Modal đa năng hợp nhất chức năng quản lý thành viên - start
const UserFormModal = ({
  isOpen,
  onClose,
  userToEdit,
  isViewMode = false,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const { t } = useLanguage();

  const {
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
    fullNameInputRef,
    dropdownRef,
    isEditMode,
    hasChanges,
    modalTitle,
    toggleDropdown,
    handleDropdownScroll,
    handleSelectGroup,
    removeGroupChip,
    handleCancelWithCheck,
    handleSubmit,
  } = useUserFormModal({ isOpen, onClose, userToEdit, isViewMode, onSuccess });

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && handleCancelWithCheck()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none animate-fade-in"
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#161b26] border border-gray-200 dark:border-[#232d42] rounded-2xl shadow-2xl flex flex-col relative overflow-visible transition-colors duration-300">
        {/* header modal */}
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
          {/* ô nhập họ và tên */}
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

          {/* ô nhập email */}
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

          {/* dropdown gán nhóm quyền */}
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
                {/* ô tìm kiếm nhóm */}
                <div className="p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111622]/50">
                  <input
                    type="text"
                    value={groupSearchKeyword}
                    onChange={(e) => setGroupSearchKeyword(e.target.value)}
                    placeholder={t("group_search_placeholder")}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#161b26] border border-gray-200 dark:border-[#232d42] rounded-lg outline-none focus:border-blue-500 text-gray-800 dark:text-gray-200 transition-colors"
                    onClick={(e) => e.stopPropagation()}
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

          {/* danh sách quyền hệ thống ở chế độ xem */}
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

          {/* footer nút hành động */}
          <div className="pt-6 mt-8 border-t border-gray-200 dark:border-[#232d42] flex justify-end items-center gap-3 bg-white dark:bg-[#161b26] relative z-10 transition-colors">
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
// BKAV HaiHS: Component Modal đa năng hợp nhất chức năng quản lý thành viên - end

export default UserFormModal;
