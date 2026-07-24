import React, { useState, useEffect, useRef } from "react";
import { FiX, FiChevronDown, FiLoader } from "react-icons/fi";
import { useToast } from "@/components/Toast";
import { bulkAddUsersToGroupApi } from "@/features/users/userApi";
import { searchGroupsApi } from "@/features/groups/groupApi";
import { useLanguage } from "@/context/LanguageContext"; // BKAV HaiHS: Import hook ngôn ngữ

// BKAV HaiHS: Component cua so dung chung de gop nhanh hang loat nhan su vao nhom quyen chi dinh - start
const BulkAddToGroupModal = ({ isOpen, onClose, selectedUsers, onSuccess }) => {
  if (!isOpen) return null;

  const { showToast } = useToast();
  const { t, tError } = useLanguage(); // BKAV HaiHS: Khai báo hàm dịch thuật
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [groupPage, setGroupPage] = useState(1);
  const [groupHasMore, setGroupHasMore] = useState(true);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  const [groupSearchKeyword, setGroupSearchKeyword] = useState("");
  const groupSearchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSelectedGroup(null);
    setGroupSearchKeyword("");
    setIsDropdownOpen(false);
  }, [isOpen]);

  // Bộ lọc chống rung cho Dropdown tìm kiếm nhóm
  useEffect(() => {
    if (!isOpen) return;
    if (groupSearchTimeoutRef.current) clearTimeout(groupSearchTimeoutRef.current);

    groupSearchTimeoutRef.current = setTimeout(() => {
      setGroupHasMore(true);
      fetchGroups(1, false);
    }, 500);

    return () => clearTimeout(groupSearchTimeoutRef.current);
  }, [groupSearchKeyword, isOpen]);




  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGroup || isSubmitting) return;

    setIsSubmitting(true);
    const userIds = selectedUsers.map((u) => u.id);

    try {
      await bulkAddUsersToGroupApi(selectedGroup.id, userIds);
      showToast(
        t("toast_bulk_add_success") +
          ` ${userIds.length} ` +
          t("members") +
          ` [${selectedGroup.name}]`,
        "success",
      );
      onSuccess();
      onClose();
    } catch (err) {
      showToast(tError(err, "toast_bulk_add_fail"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        onClick={(e) => e.target === e.currentTarget && onClose()}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none animate-fade-in"
      >
        <div className="w-full max-w-lg bg-white dark:bg-[#161b26] border border-gray-200 dark:border-[#232d42] rounded-2xl shadow-2xl flex flex-col relative overflow-visible transition-colors duration-300">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-[#232d42] flex justify-between items-center bg-gray-50 dark:bg-[#111622]/50 rounded-t-2xl shrink-0 transition-colors duration-300">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide transition-colors">
              {t("bulk_add_title")}
            </h3>
            <button
              type="button"
              onClick={onClose}
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
                {t("user_selected")} ({selectedUsers.length})
              </label>
              <div className="cyber-scrollbar w-full bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-[#232d42] rounded-xl px-3 py-3 flex flex-wrap gap-2 min-h-[46px] max-h-32 overflow-y-auto cursor-not-allowed opacity-80 transition-colors">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 text-xs font-bold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg transition-colors"
                  >{`${user.fullname} (${user.email})`}</div>
                ))}
              </div>
            </div>

            <div
              className="space-y-2 relative overflow-visible"
              ref={dropdownRef}
            >
              <label className="text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase transition-colors">
                {t("target_group")}
              </label>
              <div
                onClick={toggleDropdown}
                className="w-full bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-[#232d42] hover:border-gray-400 dark:hover:border-gray-700 rounded-xl px-3 py-2.5 flex items-center justify-between min-h-[46px] cursor-pointer transition-all"
              >
                <span
                  className={`text-sm ${selectedGroup ? "text-gray-900 dark:text-white font-semibold" : "text-gray-400 pl-1"}`}
                >
                  {selectedGroup ? selectedGroup.name : t("select_group")}
                </span>
                <div className="flex items-center gap-2">
                  {selectedGroup && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGroup(null);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                  <FiChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-blue-500" : ""}`}
                  />
                </div>
              </div>

              {isDropdownOpen && (
                <div
                  className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-[#232d42] rounded-xl shadow-2xl z-[100] animate-fade-in transition-colors overflow-hidden flex flex-col max-h-[280px]"
                >
                  {/* Ô SEARCH TRONG DROPDOWN NHÓM HÀNG LOẠT */}
                  <div className="p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111622]/50">
                    <input
                      type="text"
                      value={groupSearchKeyword}
                      onChange={(e) => setGroupSearchKeyword(e.target.value)}
                      placeholder={t("group_search_placeholder") || "Tìm kiếm nhóm..."}
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
                        const isSelected = selectedGroup?.id === group.id;
                        return (
                          <div
                            key={group.id}
                            onClick={() => {
                              setSelectedGroup(group);
                              setIsDropdownOpen(false);
                            }}
                            className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors ${isSelected ? "bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                          >
                            <span>{group.name}</span>
                            {isSelected && (
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

            <div className="pt-6 mt-8 border-t border-gray-200 dark:border-[#232d42] flex justify-end items-center gap-3 bg-white dark:bg-[#161b26] relative z-10 transition-colors">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-[#232d42] bg-gray-50 dark:bg-[#111622] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all disabled:opacity-30 cursor-pointer"
              >
                {t("cancel_btn")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedGroup}
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-600/10 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 cursor-pointer flex items-center gap-2 min-w-[130px] justify-center"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader size={14} className="animate-spin" />{" "}
                    <span>{t("processing")}</span>
                  </>
                ) : (
                  <span>{t("add_to_group")}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
// BKAV HaiHS: Component cua so dung chung de gop nhanh hang loat nhan su vao nhom quyen chi dinh - end

export default BulkAddToGroupModal;
