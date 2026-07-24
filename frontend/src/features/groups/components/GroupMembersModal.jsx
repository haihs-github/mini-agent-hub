import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiX, FiLoader, FiSearch, FiTrash2 } from "react-icons/fi";
import { useAuth } from "@/features/auth/AuthContext";
import { useToast } from "@/components/Toast";
import {
  getGroupDetailsApi,
  searchUsersApi,
  removeUserFromGroupApi,
} from "@/features/groups/groupApi";
import ConfirmModal from "@/components/ConfirmModal";
import { bulkAddUsersToGroupApi } from "@/features/users/userApi";
import { useLanguage } from "@/context/LanguageContext"; // BKAV HaiHS: Import hook ngôn ngữ

// BKAV HaiHS: Component quản lý thành viên nhóm - start
const GroupMembersModal = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  onRefreshTotal,
}) => {
  if (!isOpen) return null;

  const { permissions } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage(); // BKAV HaiHS: Khai báo hàm dịch thuật
  const userPermissions = permissions || [];

  const hasAddPermission = userPermissions.includes("GROUP_ADD_USER");
  const hasDeletePermission = userPermissions.includes("GROUP_DELETE_USER");

  const [members, setMembers] = useState([]);
  const [localFilter, setLocalFilter] = useState("");
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingUsers, setPendingUsers] = useState([]);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  const handleCloseWithCheck = () => {
    if (pendingUsers.length > 0) {
      setIsConfirmCancelOpen(true);
    } else {
      onClose();
    }
  };



  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const loadCurrentMembers = useCallback(async () => {
    setIsLoadingMembers(true);
    try {
      const res = await getGroupDetailsApi(groupId);
      setMembers(res?.data?.users || res?.data?.members || []);
    } catch (err) {
      showToast(t("toast_load_members_fail"), "error");
    } finally {
      setIsLoadingMembers(false);
    }
  }, [groupId, showToast, t]);

  useEffect(() => {
    loadCurrentMembers();
    setPendingUsers([]);
    setSearchKeyword("");
    setLocalFilter("");
    setIsConfirmCancelOpen(false);
  }, [groupId, loadCurrentMembers, isOpen]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const executeSearch = useCallback(
    async (keyword, pageNum = 1, isLoadMore = false) => {
      if (!keyword.trim()) {
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
        console.error("Loi:", err);
      } finally {
        setIsSearching(false);
      }
    },
    [],
  );

  useEffect(() => {
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
  }, [searchKeyword, executeSearch]);

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

  const handleSelectUserPending = (user) => {
    if (
      members.some((m) => m.id === user.id) ||
      pendingUsers.some((p) => p.id === user.id)
    ) {
      showToast(t("toast_user_already_in_group"), "warning");
    } else {
      setPendingUsers((prev) => [
        ...prev,
        { id: user.id, fullname: user.fullname, email: user.email },
      ]);
    }
    setSearchKeyword("");
    setSearchResults([]);
    setIsDropdownOpen(false);
  };

  const handleRemovePendingChip = (userId) => {
    setPendingUsers((prev) => prev.filter((p) => p.id !== userId));
  };

  const handleExecuteAddMembers = async () => {
    if (pendingUsers.length === 0 || isProcessingAction) return;
    setIsProcessingAction(true);
    try {
      await bulkAddUsersToGroupApi(
        groupId,
        pendingUsers.map((p) => p.id),
      );
      showToast(t("toast_add_success"), "success");
      setPendingUsers([]);
      loadCurrentMembers();
      onRefreshTotal();
    } catch (err) {
      showToast(t("toast_action_fail"), "error");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleOpenRemoveConfirm = (user) => {
    if (!hasDeletePermission) {
      showToast(t("toast_no_delete_perm"), "warning");
      return;
    }
    setUserToRemove(user);
    setIsConfirmDeleteOpen(true);
  };

  const handleExecuteRemoveMember = async () => {
    if (!userToRemove || isProcessingAction) return;
    setIsProcessingAction(true);
    try {
      await removeUserFromGroupApi(groupId, userToRemove.id);
      showToast(t("toast_remove_success"), "success");
      setIsConfirmDeleteOpen(false);
      loadCurrentMembers();
      onRefreshTotal();
    } catch (err) {
      showToast(t("toast_remove_fail"), "error");
    } finally {
      setIsProcessingAction(false);
      setUserToRemove(null);
    }
  };

  const filteredMembers = members.filter((m) => {
    const searchString = localFilter.toLowerCase();
    return (
      (m.fullname || "").toLowerCase().includes(searchString) ||
      (m.email || "").toLowerCase().includes(searchString)
    );
  });

  return (
    <>
      <style>{`
        .cyber-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .cyber-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .cyber-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
        .dark .cyber-scrollbar::-webkit-scrollbar-thumb { background: #232d42; }
        .cyber-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>

      <div
        onClick={(e) => e.target === e.currentTarget && handleCloseWithCheck()}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none animate-fade-in"
      >
        <div className="w-full max-w-md bg-white dark:bg-[#161b26] border border-gray-200 dark:border-[#232d42] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden max-h-[90vh] transition-colors duration-300">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-[#232d42] flex justify-between items-center bg-gray-50 dark:bg-[#111622]/30 rounded-t-2xl shrink-0 transition-colors">
            <h3 className="text-md font-bold text-gray-900 dark:text-white tracking-wide truncate pr-4 transition-colors">
              {t("group_members_title")}: {groupName}
            </h3>
            <button
              type="button"
              onClick={handleCloseWithCheck}
              className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-all cursor-pointer"
            >
              <FiX size={18} />
            </button>
          </div>

          <div className="p-6 flex-1 flex flex-col min-h-0 space-y-5 overflow-y-auto cyber-scrollbar">
            <div className="space-y-1.5 shrink-0">
              <div className="w-full relative">
                <input
                  type="text"
                  value={localFilter}
                  onChange={(e) => setLocalFilter(e.target.value)}
                  placeholder={t("search_placeholder") || "Search..."}
                  className="w-full bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-[#232d42] text-xs text-gray-900 dark:text-gray-100 rounded-xl pl-11 pr-4 py-2.5 transition-colors"
                />
                <FiSearch
                  size={14}
                  className="absolute left-4 top-3.5 text-gray-400 dark:text-gray-500 transition-colors"
                />
              </div>
            </div>

            {hasAddPermission ? (
              <div
                className="space-y-2 shrink-0 border-t border-gray-200 dark:border-[#232d42]/40 pt-4 relative overflow-visible transition-colors"
                ref={searchRef}
              >
                <label className="text-[10px] font-mono font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase transition-colors">
                  {t("add_new_member")}
                </label>
                <div className="flex gap-2 w-full relative">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      placeholder={t("search_add_placeholder")}
                      className="w-full bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-[#232d42] text-xs text-gray-900 dark:text-gray-100 rounded-xl pl-11 pr-10 py-2.5 transition-colors"
                    />
                    <FiSearch
                      size={14}
                      className="absolute left-4 top-3.5 text-gray-400 dark:text-gray-500 transition-colors"
                    />
                    {isSearching && (
                      <FiLoader
                        size={13}
                        className="absolute right-4 top-3.5 text-blue-500 animate-spin"
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleExecuteAddMembers}
                    disabled={pendingUsers.length === 0 || isProcessingAction}
                    className="px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-xs font-bold text-white rounded-xl transition-all cursor-pointer shadow-md shrink-0"
                  >
                    {t("add_btn")}
                  </button>
                  {isDropdownOpen && searchResults.length > 0 && (() => {
                    const filteredResults = searchResults.filter(
                      (u) =>
                        !members.some((m) => m.id === u.id) &&
                        !pendingUsers.some((p) => p.id === u.id)
                    );
                    if (filteredResults.length === 0) return null;
                    return (
                      <div
                        onScroll={handleSearchScroll}
                        className="cyber-scrollbar absolute left-0 right-0 mt-11 max-h-[140px] overflow-y-auto bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-[#232d42] rounded-xl shadow-2xl z-[110] transition-colors"
                      >
                        {filteredResults.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => handleSelectUserPending(user)}
                            className="px-4 py-2 text-xs cursor-pointer flex flex-col text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <span className="font-bold text-gray-900 dark:text-white">
                              {user.fullname}
                            </span>
                            <span className="text-[10px] font-mono">
                              {user.email}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                {pendingUsers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 animate-fade-in">
                    {pendingUsers.map((pUser) => (
                      <div
                        key={pUser.id}
                        className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 text-[11px] font-semibold text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg transition-colors"
                      >
                        <span>
                          {pUser.fullname || pUser.email?.split("@")[0]}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePendingChip(pUser.id)}
                          className="text-blue-400/60 hover:text-red-500"
                        >
                          <FiX size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[10px] text-gray-400 dark:text-gray-600 italic transition-colors">
                {t("no_add_perm")}
              </div>
            )}

            <div className="space-y-2 border-t border-gray-200 dark:border-[#232d42]/40 pt-4 shrink-0 transition-colors">
              <label className="text-[10px] font-mono font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase transition-colors">
                {t("users_label")} ({filteredMembers.length})
              </label>
              <div className="h-[270px] overflow-y-auto space-y-1.5 pr-1 cyber-scrollbar">
                {isLoadingMembers ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 animate-pulse bg-gray-100 dark:bg-[#111622]/20 rounded-xl"
                    />
                  ))
                ) : filteredMembers.length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-400 dark:text-gray-600 italic">
                    {t("no_members_found")}
                  </div>
                ) : (
                  filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1e2533]/30 border border-transparent dark:border-[#232d42]/40 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#111622] flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          {member.fullname?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-900 dark:text-white capitalize">
                            {member.fullname}
                          </span>
                          <span className="text-[10px] font-mono text-gray-500">
                            {member.email}
                          </span>
                        </div>
                      </div>
                      {hasDeletePermission && (
                        <button
                          type="button"
                          onClick={() => handleOpenRemoveConfirm(member)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-[#232d42] flex justify-end items-center bg-white dark:bg-[#161b26] shrink-0 transition-colors">
              <button
                type="button"
                onClick={handleCloseWithCheck}
                className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition-all shadow-md cursor-pointer"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleExecuteRemoveMember}
        title={t("confirm_remove_title")}
        message={t("confirm_remove_msg")}
        confirmText={t("agree_remove")}
        cancelText={t("keep_member")}
        type="danger"
      />

      <ConfirmModal
        isOpen={isConfirmCancelOpen}
        onClose={() => setIsConfirmCancelOpen(false)}
        onConfirm={() => {
          setIsConfirmCancelOpen(false);
          onClose();
        }}
        title={t("confirm_cancel")}
        message={t("confirm_cancel_msg")}
        confirmText={t("agree_cancel")}
        cancelText={t("keep_editing")}
        type="warning"
      />
    </>
  );
};
// BKAV HaiHS: Component quản lý thành viên nhóm - end

export default GroupMembersModal;
