import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { useToast } from "@/components/Toast";
import { getUsersApi, deleteUserApi, searchUsersApi } from "@/features/users/userApi";
import UserHeader from "@/features/users/components/UserHeader";
import UserTable from "@/features/users/components/UserTable";
import UserPagination from "@/features/users/components/UserPagination";
import UserFormModal from "@/features/users/components/UserFormModal";
import ConfirmModal from "@/components/ConfirmModal";
import BulkAddToGroupModal from "@/features/users/components/BulkAddToGroupModal";
import { FiLock } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext"; // BKAV HaiHS: Import hook ngôn ngữ
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

// BKAV HaiHS : Component chính chứa đựng toàn bộ trang quản lý user, điều phối việc hiển thị header, bảng danh sách, phân trang và popup form - start
const UserWindow = () => {
  const { permissions } = useAuth();
  const { showToast } = useToast();
  const { t, tError } = useLanguage(); // BKAV HaiHS: Khai báo hàm dịch thuật
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

  // BKAV HaiHS : Cac trang thai cua bo tim kiem nang cao - start
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [selectedDropdownUser, setSelectedDropdownUser] = useState(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownResults, setDropdownResults] = useState([]);
  const [dropdownPage, setDropdownPage] = useState(1);
  const [dropdownHasMore, setDropdownHasMore] = useState(true);
  const [isDropdownLoading, setIsDropdownLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1); // BKAV HaiHS: chỉ số item đang được Tab focus trong dropdown
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownListRef = useRef(null); // BKAV HaiHS: ref cho container danh sách cuộn
  const itemRefs = useRef([]); // BKAV HaiHS: mảng ref cho từng item dropdown
  const searchTimeoutRef = useRef(null);
  // BKAV HaiHS : Cac trang thai cua bo tim kiem nang cao - end

  // BKAV HaiHS : Bộ lọc chống rung cho Dropdown tìm kiếm - start
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!searchKeyword.trim()) {
      setDropdownResults([]);
      setIsDropdownOpen(false);
      return;
    }

    if (
      selectedDropdownUser &&
      (searchKeyword === selectedDropdownUser.fullname ||
        searchKeyword === selectedDropdownUser.email)
    ) {
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsDropdownLoading(true);
      try {
        const res = await searchUsersApi(searchKeyword, 1, 10);
        const fetched = res?.data || [];
        const pagination = res?.pagination || {};
        setDropdownResults(fetched);
        setDropdownPage(1);
        setDropdownHasMore(1 < (pagination.totalPages || 1));
        setIsDropdownOpen(fetched.length > 0);
      } catch (err) {
        console.error("Autocomplete search error:", err);
      } finally {
        setIsDropdownLoading(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchKeyword, activeSearchQuery, selectedDropdownUser]);
  // BKAV HaiHS : Bộ lọc chống rung cho Dropdown tìm kiếm - end

  // BKAV HaiHS : Reset focusedIndex khi danh sách kết quả thay đổi - start
  useEffect(() => {
    setFocusedIndex(-1);
    itemRefs.current = [];
  }, [dropdownResults]);
  // BKAV HaiHS : Reset focusedIndex khi danh sách kết quả thay đổi - end

  // BKAV HaiHS : Auto-scroll item đang được focus vào tầm nhìn khi Tab - start
  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [focusedIndex]);
  // BKAV HaiHS : Auto-scroll item đang được focus vào tầm nhìn khi Tab - end

  // BKAV HaiHS : Tu dong dong dropdown khi click ra ngoai - start
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);
  // BKAV HaiHS : Tu dong dong dropdown khi click ra ngoai - end

  // BKAV HaiHS : Cuon vo han trong dropdown - start
  const handleDropdownScroll = async (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight + 5 &&
      dropdownHasMore &&
      !isDropdownLoading
    ) {
      setIsDropdownLoading(true);
      try {
        const nextPage = dropdownPage + 1;
        const res = await searchUsersApi(searchKeyword, nextPage, 10);
        const fetched = res?.data || [];
        const pagination = res?.pagination || {};
        setDropdownResults((prev) => [...prev, ...fetched]);
        setDropdownPage(nextPage);
        setDropdownHasMore(nextPage < (pagination.totalPages || 1));
      } catch (err) {
        console.error("Dropdown load more error:", err);
      } finally {
        setIsDropdownLoading(false);
      }
    }
  };
  // BKAV HaiHS : Cuon vo han trong dropdown - end

  // BKAV HaiHS : Dung useQuery de cache phan trang va lay danh sach nguoi dung - start
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
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalItems: 0,
            },
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
  // BKAV HaiHS : Dung useQuery de cache phan trang va lay danh sach nguoi dung - end

  // Bỏ useEffect xóa chọn khi đổi trang users để lưu trạng thái chọn xuyên trang

  const handleOpenAddModal = () => {
    setUserToEdit(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setUserToEdit(user);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (user) => {
    setUserToEdit(user);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const handleOpenDeleteConfirm = (user) => {
    if (!canDelete) {
      showToast(t("toast_no_delete_perm"), "warning");
      return;
    }
    setUserToDelete(user);
    setIsConfirmDeleteOpen(true);
  };

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

  const handleExecuteBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    setIsLoading(true);
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
      setIsLoading(false);
      setIsConfirmBulkDeleteOpen(false);
    }
  };

  const handleOpenBulkGroupModal = () => {
    if (!canAddToGroup) {
      showToast(t("toast_no_add_group_perm"), "warning");
      return;
    }
    setIsBulkGroupOpen(true);
  };

  const handleBulkGroupSuccess = () => {
    setSelectedUsers([]);
    loadUsers();
  };

  if (!hasAnyUserPermission) {
    return (
      <div className="flex-1 h-full flex flex-col justify-center items-center bg-gray-50 dark:bg-[#0b0f19] text-center px-6 select-none animate-fade-in transition-colors duration-300">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex justify-center items-center text-red-500 shadow-lg mb-4">
          <FiLock size={28} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide transition-colors">
          {t("access_denied")}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm leading-6 transition-colors">
          {t("access_denied_user_desc")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-gray-50 dark:bg-[#0b0f19] transition-colors duration-300">
      {/* BKAV HaiHS : Thanh dau trang co dinh (sticky header) - start */}
      <div className="w-full border-b border-gray-200 dark:border-[#232d42]/60 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md shrink-0 px-4 py-4 md:px-8 md:py-5 z-10 transition-colors duration-300">
        <div className="w-full max-w-6xl mx-auto">
          <UserHeader onAddClick={handleOpenAddModal} canCreate={canCreate} />
        </div>
      </div>
      {/* BKAV HaiHS : Thanh dau trang co dinh (sticky header) - end */}

      {/* BKAV HaiHS : Vung noi dung cuon phia duoi - start */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
        <div className="w-full max-w-6xl mx-auto space-y-6 flex flex-col">
          {/* BKAV HaiHS : Bộ công cụ tìm kiếm nhân sự nâng cao - start */}
          <style>{`
            .cyber-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .cyber-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .cyber-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
            .dark .cyber-scrollbar::-webkit-scrollbar-thumb { background: #232d42; }
            .cyber-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
          `}</style>
          <div className="relative z-20 flex flex-col gap-3">
            <div
              className="relative z-30 w-full max-w-md bg-white dark:bg-[#161b26]/40 p-1.5 rounded-2xl border border-gray-200 dark:border-[#232d42] flex items-center gap-2 shadow-lg backdrop-blur-md transition-colors"
              ref={dropdownRef}
            >
              <div className="relative flex-1 flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchKeyword(val);
                    if (!val.trim()) {
                      setActiveSearchQuery("");
                      setSelectedDropdownUser(null);
                      setCurrentPage(1);
                      setIsDropdownOpen(false);
                      setDropdownResults([]);
                    }
                  }}
                  placeholder={t("user_search_placeholder")}
                  className="w-full pl-3 pr-8 py-2 text-sm bg-transparent border border-transparent outline-none focus:outline-none ring-0 focus:ring-0 text-gray-800 dark:text-gray-200 transition-colors"
                  onFocus={() => {
                    if (dropdownResults.length > 0 && searchKeyword.trim()) {
                      setIsDropdownOpen(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    // Esc: đóng dropdown, giống click ra ngoài
                    if (e.key === "Escape") {
                      setIsDropdownOpen(false);
                      setFocusedIndex(-1);
                      inputRef.current?.blur();
                      return;
                    }
                    // Tab: điều hướng qua các item trong dropdown
                    if (
                      e.key === "Tab" &&
                      isDropdownOpen &&
                      dropdownResults.length > 0
                    ) {
                      e.preventDefault();
                      setFocusedIndex((prev) =>
                        e.shiftKey
                          ? prev <= 0
                            ? dropdownResults.length - 1
                            : prev - 1
                          : prev >= dropdownResults.length - 1
                            ? 0
                            : prev + 1,
                      );
                      return;
                    }
                    // Enter: nếu đang focus vào 1 item thì chọn user đó, ngược lại tìm theo keyword
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (
                        focusedIndex >= 0 &&
                        focusedIndex < dropdownResults.length
                      ) {
                        const u = dropdownResults[focusedIndex];
                        setSelectedDropdownUser(u);
                        setSearchKeyword(u.fullname || u.email);
                        setActiveSearchQuery("");
                        setIsDropdownOpen(false);
                        setDropdownResults([]);
                        setFocusedIndex(-1);
                      } else {
                        if (!searchKeyword.trim()) return;
                        setActiveSearchQuery(searchKeyword);
                        setSelectedDropdownUser(null);
                        setCurrentPage(1);
                        setIsDropdownOpen(false);
                        setDropdownResults([]);
                        setSearchKeyword("");
                      }
                    }
                  }}
                />
                {searchKeyword && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchKeyword("");
                      setActiveSearchQuery("");
                      setSelectedDropdownUser(null);
                      setCurrentPage(1);
                      setIsDropdownOpen(false);
                      setDropdownResults([]);
                    }}
                    className="absolute right-2 text-gray-400 hover:text-red-500 transition-colors font-bold text-lg"
                  >
                    &times;
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveSearchQuery(searchKeyword);
                  setSelectedDropdownUser(null);
                  setCurrentPage(1);
                  setIsDropdownOpen(false);
                  setDropdownResults([]);
                  setSearchKeyword(""); // Xóa nội dung ô nhập liệu sau khi bấm tìm kiếm
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer shrink-0"
              >
                {t("search_btn")}
              </button>

              {/* DROPDOWN KẾT QUẢ TÌM KIẾM TRÊN RAM CUỘN VÔ HẠN */}
              {isDropdownOpen && dropdownResults.length > 0 && (
                <div
                  ref={dropdownListRef}
                  onScroll={handleDropdownScroll}
                  className="cyber-scrollbar absolute left-0 right-0 top-full mt-2 max-h-[220px] overflow-y-auto bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-[#232d42] rounded-2xl shadow-2xl z-[100] transition-colors"
                >
                  {/* BKAV HaiHS: Hiển thị số lượng kết quả tìm kiếm */}
                  <div className="sticky top-0 z-10 px-4 py-2 bg-gray-50/90 dark:bg-[#0f1623]/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      {t("search_results") || "Kết quả"}
                    </span>
                    <span className="text-[11px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 px-2 py-0.5 rounded-full">
                      {dropdownResults.length}
                      {dropdownHasMore ? "+" : ""}
                    </span>
                  </div>
                  {dropdownResults.map((u, idx) => {
                    const displayName = u.fullname || u.email.split("@")[0];
                    const isFocused = focusedIndex === idx;
                    return (
                      <div
                        key={u.id}
                        ref={(el) => {
                          itemRefs.current[idx] = el;
                        }}
                        onClick={() => {
                          setSelectedDropdownUser(u);
                          setSearchKeyword(u.fullname || u.email);
                          setActiveSearchQuery("");
                          setIsDropdownOpen(false);
                          setDropdownResults([]);
                          setFocusedIndex(-1);
                        }}
                        className={`px-4 py-2.5 text-sm cursor-pointer flex flex-col transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                          isFocused
                            ? "bg-blue-50 dark:bg-blue-600/15 border-l-2 border-l-blue-500"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-800 dark:text-gray-200">
                            {displayName}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 font-mono mt-0.5">
                          {u.email}
                        </span>
                      </div>
                    );
                  })}
                  {isDropdownLoading && (
                    <div className="py-2.5 flex justify-center text-blue-500 bg-gray-50/50 dark:bg-[#0b0f19]/20">
                      <span className="text-xs italic">
                        {t("loading_more")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chỉ báo trạng thái lọc */}
            {(activeSearchQuery || selectedDropdownUser) && (
              <div className="flex items-center gap-2 animate-fade-in shrink-0">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {t("filtering_by")}
                </span>
                <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 text-xs font-bold text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl">
                  <span>
                    {selectedDropdownUser
                      ? `${t("filter_user")} ${selectedDropdownUser.fullname || selectedDropdownUser.email}`
                      : `${t("filter_keyword")} "${activeSearchQuery}"`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchKeyword("");
                      setActiveSearchQuery("");
                      setSelectedDropdownUser(null);
                      setCurrentPage(1);
                    }}
                    className="hover:text-red-500 transition-colors ml-1 font-bold text-sm"
                  >
                    &times;
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* BKAV HaiHS : Bộ công cụ tìm kiếm nhân sự nâng cao - end */}

          {/* BKAV HaiHS : Hieu ung lam mo nhe khi dang lay du lieu phan trang ngam - start */}
          <div
            className={`transition-opacity duration-200 ${
              isFetching && !isLoading
                ? "opacity-50 pointer-events-none"
                : "opacity-100"
            }`}
          >
            <UserTable
              users={users}
              isLoading={isLoading}
              onEditClick={handleOpenEditModal}
              onViewClick={handleOpenViewModal}
              onDeleteClick={handleOpenDeleteConfirm}
              onBulkDeleteClick={() => setIsConfirmBulkDeleteOpen(true)}
              onBulkGroupClick={handleOpenBulkGroupModal}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              canRead={canRead}
              canUpdate={canUpdate}
              canDelete={canDelete}
            />
          </div>
          {/* BKAV HaiHS : Hieu ung lam mo nhe khi dang lay du lieu phan trang ngam - end */}
          {canRead && (
            <UserPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={(targetPage) => setCurrentPage(targetPage)}
            />
          )}
        </div>
      </div>
      {/* BKAV HaiHS : Vung noi dung cuon phia duoi - end */}

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={userToEdit}
        isViewMode={isViewMode}
        onSuccess={loadUsers}
      />
      <BulkAddToGroupModal
        isOpen={isBulkGroupOpen}
        onClose={() => setIsBulkGroupOpen(false)}
        selectedUsers={selectedUsers}
        onSuccess={handleBulkGroupSuccess}
      />

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleExecuteDelete}
        title={t("confirm_delete_title")}
        message={t("confirm_delete_msg")}
        confirmText={t("agree_delete")}
        cancelText={t("keep_user")}
        type="danger"
      />
      <ConfirmModal
        isOpen={isConfirmBulkDeleteOpen}
        onClose={() => setIsConfirmBulkDeleteOpen(false)}
        onConfirm={handleExecuteBulkDelete}
        title={t("confirm_bulk_delete_title")}
        message={
          t("confirm_bulk_delete_msg") +
          ` ${selectedUsers.length} ` +
          t("users_selected") +
          "?"
        }
        confirmText={t("delete_all")}
        cancelText={t("cancel_btn")}
        type="danger"
      />
    </div>
  );
};
// BKAV HaiHS : Component chính chứa đựng toàn bộ trang quản lý user, điều phối việc hiển thị header, bảng danh sách, phân trang và popup form - end

export default UserWindow;
