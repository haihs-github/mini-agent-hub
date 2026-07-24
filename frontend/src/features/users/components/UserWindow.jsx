import React from "react";
import UserHeader from "@/features/users/components/UserHeader";
import UserTable from "@/features/users/components/UserTable";
import UserPagination from "@/features/users/components/UserPagination";
import UserFormModal from "@/features/users/components/UserFormModal";
import ConfirmModal from "@/components/ConfirmModal";
import BulkAddToGroupModal from "@/features/users/components/BulkAddToGroupModal";
import UserSearchBar from "@/features/users/components/UserSearchBar";
import { FiLock } from "react-icons/fi";
import { useUserWindow } from "@/features/users/hooks/useUserWindow";

// BKAV HaiHS : Component chính chứa đựng toàn bộ trang quản lý người dùng - start
const UserWindow = () => {
  const {
    hasAnyUserPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    users,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    isLoading,
    isFetching,
    loadUsers,
    searchHook,
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
    handleOpenAddModal,
    handleOpenEditModal,
    handleOpenViewModal,
    handleOpenDeleteConfirm,
    handleExecuteDelete,
    handleExecuteBulkDelete,
    handleOpenBulkGroupModal,
    handleBulkGroupSuccess,
    t,
  } = useUserWindow();

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
      {/* sticky header */}
      <div className="w-full border-b border-gray-200 dark:border-[#232d42]/60 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md shrink-0 px-4 py-4 md:px-8 md:py-5 z-10 transition-colors duration-300">
        <div className="w-full max-w-6xl mx-auto">
          <UserHeader onAddClick={handleOpenAddModal} canCreate={canCreate} />
        </div>
      </div>

      {/* vùng nội dung cuộn */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
        <div className="w-full max-w-6xl mx-auto space-y-6 flex flex-col">
          {/* bộ tìm kiếm người dùng nâng cao */}
          <UserSearchBar searchHook={searchHook} />

          {/* mờ nhẹ khi tải dữ liệu phân trang ngầm */}
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
// BKAV HaiHS : Component chính chứa đựng toàn bộ trang quản lý người dùng - end

export default UserWindow;
