import React, { useState, useCallback } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { useToast } from "@/components/Toast";
import { getGroupsListApi, deleteGroupApi, searchGroupsApi } from "@/features/groups/groupApi";
import GroupHeader from "@/features/groups/components/GroupHeader";
import GroupTable from "@/features/groups/components/GroupTable";
import GroupPagination from "@/features/groups/components/GroupPagination";
import GroupFormModal from "@/features/groups/components/GroupFormModal";
import GroupMembersModal from "@/features/groups/components/GroupMembersModal";
import ConfirmModal from "@/components/ConfirmModal";
import { FiLock } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";
import { useGroupSearch } from "@/features/groups/hooks/useGroupSearch";
// BKAV HaiHS : Import TanStack Query - start
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
// BKAV HaiHS : Import TanStack Query - end

// BKAV HaiHS: Component đại diện toàn bộ trang quản lý quyền - start
const GroupWindow = () => {
  const { permissions } = useAuth();
  const { showToast } = useToast();
  const { t, tError } = useLanguage();
  const groupPermissions = permissions || [];

  const hasAnyGroupPermission = groupPermissions.some((p) =>
    p.startsWith("GROUP_"),
  );
  const canCreate = groupPermissions.includes("GROUP_C");
  const canRead = groupPermissions.includes("GROUP_R");
  const canUpdate = groupPermissions.includes("GROUP_U");
  const canDelete = groupPermissions.includes("GROUP_D");

  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState(null);

  // BKAV HaiHS : Khởi tạo hook tìm kiếm nhóm nâng cao - start
  const {
    searchKeyword,
    activeSearchQuery,
    selectedDropdownGroup,
    isDropdownOpen,
    dropdownResults,
    isDropdownLoading,
    dropdownRef,
    handleDropdownScroll,
    handleSelectDropdownGroup,
    handleCommitSearch,
    handleClearSearch,
    handleKeywordChange,
    setIsDropdownOpen,
  } = useGroupSearch({
    onSearchChange: ({ page }) => setCurrentPage(page),
  });
  // BKAV HaiHS : Khởi tạo hook tìm kiếm nhóm nâng cao - end

  // BKAV HaiHS : Dùng useQuery để cache phân trang và lấy danh sách nhóm - start
  const { data, isLoading: isQueryLoading, isFetching } = useQuery({
    queryKey: selectedDropdownGroup
      ? ["groups", "single", selectedDropdownGroup.id]
      : activeSearchQuery
        ? ["groups", "search", activeSearchQuery, currentPage, 10]
        : ["groups", "list", currentPage, 10],
    queryFn: async () => {
      if (!canRead) return { data: [], pagination: { totalPages: 1, totalItems: 0 } };

      if (selectedDropdownGroup) {
        return {
          data: [selectedDropdownGroup],
          pagination: { currentPage: 1, totalPages: 1, totalItems: 1 },
        };
      }

      if (activeSearchQuery) {
        return await searchGroupsApi(activeSearchQuery, currentPage, 10);
      }

      return await getGroupsListApi(currentPage, 10);
    },
    placeholderData: keepPreviousData,
    staleTime: activeSearchQuery ? 10000 : undefined,
  });

  const groups = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const totalItems = data?.pagination?.totalItems || 0;
  const isLoading = isQueryLoading;

  const loadGroups = () => {
    queryClient.invalidateQueries({ queryKey: ["groups"] });
  };
  // BKAV HaiHS : Dùng useQuery để cache phân trang và lấy danh sách nhóm - end

  // BKAV HaiHS : Mở modal tạo mới nhóm quyền - start
  const handleOpenCreateModal = () => {
    setGroupToEdit(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };
  // BKAV HaiHS : Mở modal tạo mới nhóm quyền - end

  // BKAV HaiHS : Mở modal chỉnh sửa thông tin nhóm quyền - start
  const handleOpenEditModal = (group) => {
    setGroupToEdit(group);
    setIsViewMode(false);
    setIsModalOpen(true);
  };
  // BKAV HaiHS : Mở modal chỉnh sửa thông tin nhóm quyền - end

  // BKAV HaiHS : Mở modal xem chi tiết nhóm quyền (chỉ đọc) - start
  const handleOpenViewModal = (group) => {
    if (!canRead) {
      showToast(t("toast_no_read_perm"), "warning");
      return;
    }
    setGroupToEdit(group);
    setIsViewMode(true);
    setIsModalOpen(true);
  };
  // BKAV HaiHS : Mở modal xem chi tiết nhóm quyền (chỉ đọc) - end

  // BKAV HaiHS : Mở modal quản lý thành viên của nhóm - start
  const handleOpenMembersModal = (group) => {
    if (!canRead && !canUpdate) {
      showToast(t("toast_no_read_perm"), "warning");
      return;
    }
    setSelectedGroupForMembers(group);
    setIsMembersOpen(true);
  };
  // BKAV HaiHS : Mở modal quản lý thành viên của nhóm - end

  // BKAV HaiHS : Mở hộp thoại xác nhận trước khi xóa nhóm - start
  const handleOpenDeleteConfirm = (group) => {
    if (!canDelete) {
      showToast(t("toast_no_delete_perm"), "warning");
      return;
    }
    setGroupToDelete(group);
    setIsConfirmDeleteOpen(true);
  };
  // BKAV HaiHS : Mở hộp thoại xác nhận trước khi xóa nhóm - end

  // BKAV HaiHS : Gọi API xóa nhóm sau khi người dùng xác nhận - start
  const handleExecuteDelete = async () => {
    if (!groupToDelete) return;
    try {
      await deleteGroupApi(groupToDelete.id);
      showToast(
        t("toast_delete_success") + ` [${groupToDelete.name}]`,
        "success",
      );
      setIsConfirmDeleteOpen(false);
      loadGroups();
    } catch (err) {
      showToast(tError(err), "error");
    } finally {
      setGroupToDelete(null);
    }
  };
  // BKAV HaiHS : Gọi API xóa nhóm sau khi người dùng xác nhận - end

  if (!hasAnyGroupPermission) {
    return (
      <div className="flex-1 h-full flex flex-col justify-center items-center bg-gray-50 dark:bg-[#0b0f19] text-center px-6 select-none animate-fade-in transition-colors duration-300">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex justify-center items-center text-red-500 shadow-lg mb-4">
          <FiLock size={28} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">
          {t("access_denied")}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm leading-6">
          {t("access_denied_desc")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-gray-50 dark:bg-[#0b0f19] transition-colors duration-300">
      {/* sticky header */}
      <div className="w-full border-b border-gray-200 dark:border-[#232d42]/60 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md shrink-0 px-4 py-4 md:px-8 md:py-5 z-10 transition-colors duration-300">
        <div className="w-full max-w-6xl mx-auto">
          <GroupHeader
            onCreateClick={handleOpenCreateModal}
            canCreate={canCreate}
          />
        </div>
      </div>

      {/* vùng nội dung cuộn */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
        <div className="w-full max-w-6xl mx-auto space-y-6 flex flex-col">
          {/* bộ tìm kiếm nhóm nâng cao */}
          <div className="relative z-20 flex flex-col gap-3">
            <div
              className="relative z-30 w-full max-w-md bg-white dark:bg-[#161b26]/40 p-1.5 rounded-2xl border border-gray-200 dark:border-[#232d42] flex items-center gap-2 shadow-lg backdrop-blur-md transition-colors"
              ref={dropdownRef}
            >
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => handleKeywordChange(e.target.value)}
                  placeholder={t("group_search_placeholder")}
                  className="w-full pl-3 pr-8 py-2 text-sm bg-transparent border border-transparent outline-none focus:outline-none ring-0 focus:ring-0 text-gray-800 dark:text-gray-200 transition-colors"
                  onFocus={() => {
                    if (dropdownResults.length > 0 && searchKeyword.trim()) {
                      setIsDropdownOpen(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsDropdownOpen(false);
                      e.target.blur();
                      return;
                    }
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCommitSearch();
                    }
                  }}
                />
                {searchKeyword && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 text-gray-400 hover:text-red-500 transition-colors font-bold text-lg"
                  >
                    &times;
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleCommitSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer shrink-0"
              >
                {t("search_btn")}
              </button>

              {/* dropdown kết quả tìm kiếm */}
              {isDropdownOpen && dropdownResults.length > 0 && (
                <div
                  onScroll={handleDropdownScroll}
                  className="cyber-scrollbar absolute left-0 right-0 top-full mt-2 max-h-[220px] overflow-y-auto bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-[#232d42] rounded-2xl shadow-2xl z-[100] transition-colors"
                >
                  {dropdownResults.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => handleSelectDropdownGroup(g)}
                      className="px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex flex-col transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <span className="font-bold text-gray-800 dark:text-gray-200">{g.name}</span>
                      <span className="text-xs text-gray-500 mt-1">
                        {g.memberCount || 0} {t("members") || "members"}
                      </span>
                    </div>
                  ))}
                  {isDropdownLoading && (
                    <div className="py-2.5 flex justify-center text-blue-500 bg-gray-50/50 dark:bg-[#0b0f19]/20">
                      <span className="text-xs italic">{t("loading_more")}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* chỉ báo bộ lọc đang áp dụng */}
            {(activeSearchQuery || selectedDropdownGroup) && (
              <div className="flex items-center gap-2 animate-fade-in shrink-0">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {t("filtering_by")}
                </span>
                <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 text-xs font-bold text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl">
                  <span>
                    {selectedDropdownGroup
                      ? `${t("filter_group")} ${selectedDropdownGroup.name}`
                      : `${t("filter_keyword")} "${activeSearchQuery}"`}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="hover:text-red-500 transition-colors ml-1 font-bold text-sm"
                  >
                    &times;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* mờ nhẹ khi tải dữ liệu phân trang ngầm */}
          <div
            className={`transition-opacity duration-200 ${
              isFetching && !isLoading ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}
          >
            <GroupTable
              groups={groups}
              isLoading={isLoading}
              onViewClick={handleOpenViewModal}
              onMembersClick={handleOpenMembersModal}
              onEditClick={handleOpenEditModal}
              onDeleteClick={handleOpenDeleteConfirm}
              canRead={canRead}
              canUpdate={canUpdate}
              canDelete={canDelete}
            />
          </div>

          {canRead && (
            <GroupPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={(targetPage) => setCurrentPage(targetPage)}
            />
          )}
        </div>
      </div>

      <GroupFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        groupToEdit={groupToEdit}
        isViewMode={isViewMode}
        onSuccess={loadGroups}
      />

      <GroupMembersModal
        isOpen={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
        groupId={selectedGroupForMembers?.id}
        groupName={selectedGroupForMembers?.name}
        onRefreshTotal={loadGroups}
      />

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleExecuteDelete}
        title={t("confirm_delete_title")}
        message={t("confirm_delete_msg") + ` [${groupToDelete?.name}]?`}
        confirmText={t("agree_delete")}
        cancelText={t("keep_group")}
        type="danger"
      />
    </div>
  );
};
// BKAV HaiHS: Component đại diện toàn bộ trang quản lý quyền - end

export default GroupWindow;
