import React, { useState, useRef } from "react";
import { FiInfo, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext"; // BKAV HaiHS: Import hook ngôn ngữ

// Helper component to conditionally show title on hover only when text overflows (is truncated)
const TruncatedText = ({ text, className, maxWClass }) => {
  const [showTitle, setShowTitle] = useState(false);
  const textRef = useRef(null);

  const handleMouseEnter = () => {
    const el = textRef.current;
    if (el) {
      const isOverflowing = el.scrollWidth > el.clientWidth;
      setShowTitle(isOverflowing);
    }
  };

  return (
    <span
      ref={textRef}
      onMouseEnter={handleMouseEnter}
      title={showTitle ? text : undefined}
      className={`truncate block ${maxWClass} ${className || ""}`}
    >
      {text}
    </span>
  );
};

// BKAV HaiHS: Component bang hien thi nhan su don nhan cac trang thai chon tu Bo chi huy trung tam - start
const UserTable = ({
  users,
  isLoading,
  onEditClick,
  onViewClick,
  onDeleteClick,
  onBulkDeleteClick,
  selectedUsers,
  setSelectedUsers,
  canRead,
  canUpdate,
  canDelete,
  onBulkGroupClick,
}) => {
  const { t } = useLanguage(); // BKAV HaiHS: Khai báo hàm dịch thuật

  const handleSelectAllToggle = (e) => {
    if (e.target.checked) {
      setSelectedUsers((prev) => {
        const usersToAdd = users.filter((user) => !prev.some((u) => u.id === user.id));
        return [...prev, ...usersToAdd];
      });
    } else {
      const currentIds = users.map((user) => user.id);
      setSelectedUsers((prev) => prev.filter((u) => !currentIds.includes(u.id)));
    }
  };

  const handleSelectRowToggle = (user) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user],
    );
  };

  const isAllSelectedOnPage =
    users.length > 0 && users.every((user) => selectedUsers.some((u) => u.id === user.id));

  return (
    <div className="w-full bg-white dark:bg-[#161b26]/60 border border-gray-200 dark:border-[#232d42] rounded-2xl overflow-hidden shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-300">
      {/* THANH TAC VU HANG LOAT */}
      {canRead && (
        <div className="px-6 h-[52px] bg-gray-50 dark:bg-[#111622]/90 border-b border-gray-200 dark:border-[#232d42] flex items-center justify-between text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 select-none transition-colors duration-300">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isAllSelectedOnPage}
              onChange={handleSelectAllToggle}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <span
              className={
                selectedUsers.length > 0
                  ? "text-blue-600 dark:text-blue-400 font-bold"
                  : ""
              }
            >
              {selectedUsers.length} {t("users_selected") || "Users selected"}
            </span>
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-4 animate-fade-in">
              <button
                type="button"
                onClick={() => setSelectedUsers([])}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white font-semibold text-[10px] tracking-wider uppercase cursor-pointer transition-all"
              >
                {t("deselect_all") || "Bỏ chọn tất cả"}
              </button>
              <button
                type="button"
                onClick={onBulkGroupClick}
                className="bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl font-bold text-[10px] tracking-wider uppercase hover:bg-blue-100 dark:hover:bg-blue-600/20 transition-all cursor-pointer"
              >
                + {t("add_to_group") || "Add to Group"}
              </button>
              {canDelete && (
                <button
                  type="button"
                  onClick={onBulkDeleteClick}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 font-bold text-[10px] tracking-wider uppercase cursor-pointer transition-all"
                >
                  {t("delete_selected") || "Delete Selected"}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-[#232d42] text-[11px] font-bold tracking-widest text-gray-500 uppercase select-none transition-colors duration-300">
              <th className="py-4 px-6 w-12"></th>
              <th className="py-4 px-6">{t("name") || "Name"}</th>
              <th className="py-4 px-6">{t("email") || "Email"}</th>
              {(canRead || canUpdate || canDelete) && (
                <th className="py-4 px-6 text-right pr-8">
                  {t("action") || "Actions"}
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-[#232d42]/40 text-sm text-gray-900 dark:text-gray-300 transition-colors duration-300">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-5 px-6">
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </td>
                  <td className="py-5 px-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-28"></div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-44"></div>
                  </td>
                  <td className="py-5 px-6 text-right pr-8">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16 ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : !canRead ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-12 text-center text-amber-600 dark:text-amber-500/80 italic font-medium bg-amber-50 dark:bg-[#111622]/20"
                >
                  {t("user_no_permission")}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-12 text-center text-gray-500 italic"
                >
                  {t("user_empty")}
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const nameDisplay =
                  user.fullname || user.email?.split("@")[0] || "Unknown";
                const avatarCode = user.email
                  ? user.email.substring(0, 2).toUpperCase()
                  : "US";
                const isRowChecked = selectedUsers.some((u) => u.id === user.id);

                return (
                  <tr
                    key={user.id}
                    onClick={() => canRead && onViewClick(user)}
                    className={`transition-colors group cursor-pointer ${isRowChecked ? "bg-blue-50 dark:bg-blue-500/5" : "hover:bg-gray-100 dark:hover:bg-[#1e2533]/40"}`}
                  >
                    <td
                      className="py-4 px-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canRead && (
                        <input
                          type="checkbox"
                          checked={isRowChecked}
                          onChange={() => handleSelectRowToggle(user)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white flex items-center gap-3 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-blue-600/20 dark:to-indigo-600/20 border border-gray-200 dark:border-blue-500/20 flex justify-center items-center text-xs font-bold text-blue-600 dark:text-blue-400">
                        {avatarCode}
                      </div>
                      <TruncatedText
                        text={nameDisplay}
                        className="capitalize"
                        maxWClass="max-w-[150px] sm:max-w-[200px]"
                      />
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-mono text-xs transition-colors">
                      <TruncatedText
                        text={user.email}
                        maxWClass="max-w-[180px] sm:max-w-[240px]"
                      />
                    </td>
                    {(canRead || canUpdate || canDelete) && (
                      <td
                        className="py-4 px-6 text-right pr-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {canRead && (
                            <button
                              title={t("view_details")}
                              onClick={() => onViewClick(user)}
                              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
                            >
                              <FiInfo size={15} />
                            </button>
                          )}
                          {canUpdate && (
                            <button
                              title={t("edit_info")}
                              onClick={() => onEditClick(user)}
                              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-blue-500/10 transition-all"
                            >
                              <FiEdit2 size={14} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              title={t("delete_account")}
                              onClick={() => onDeleteClick(user)}
                              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-red-500/10 transition-all"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
// BKAV HaiHS: Component bang hien thi nhan su don nhan cac trang thai chon tu Bo chi huy trung tam - end

export default UserTable;
