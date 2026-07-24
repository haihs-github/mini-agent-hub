import React, { useState, useRef } from "react";
import { FiInfo, FiUsers, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext"; // BKAV HaiHS: Import hook ngôn ngữ

// Helper component to conditionally show title on hover only when text overflows (is truncated)
const TruncatedText = ({
  text,
  className,
  maxWClass,
  onClick,
  showUnderline = true,
}) => {
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
      onClick={onClick}
      className={`truncate block cursor-pointer ${showUnderline ? "hover:underline" : ""} ${maxWClass} ${className || ""}`}
    >
      {text}
    </span>
  );
};

// BKAV HaiHS: Component bảng hiển thị danh sách nhóm - start
const GroupTable = ({
  groups,
  isLoading,
  onViewClick,
  onMembersClick,
  onEditClick,
  onDeleteClick,
  canRead,
  canUpdate,
  canDelete,
}) => {
  const { t } = useLanguage(); // BKAV HaiHS: Khai báo hàm dịch thuật

  return (
    <div className="w-full bg-white border border-gray-200 dark:bg-[#161b26]/60 dark:border-[#232d42] rounded-2xl overflow-hidden shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-[#232d42] text-[11px] font-bold tracking-widest text-gray-500 uppercase select-none transition-colors duration-300">
              <th className="py-4 px-6">{t("group_name") || "Group Name"}</th>
              <th className="py-4 px-6">
                {t("member_count") || "Member Count"}
              </th>
              {(canRead || canUpdate || canDelete) && (
                <th className="py-4 px-6 text-right pr-8">
                  {t("actions") || "Actions"}
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-[#232d42]/40 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-5 px-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-44"></div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                  </td>
                  <td className="py-5 px-6 text-right pr-8">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24 ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : !canRead ? (
              <tr>
                <td
                  colSpan={3}
                  className="py-12 text-center text-amber-600 dark:text-amber-500/80 italic font-medium bg-amber-50 dark:bg-[#111622]/20 transition-colors"
                >
                  {t("group_no_permission") ||
                    "Tài khoản của bạn không có quyền xem danh sách nhóm."}
                </td>
              </tr>
            ) : groups.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="py-12 text-center text-gray-500 italic transition-colors"
                >
                  {t("group_empty") || "Không tìm thấy nhóm quyền nào."}
                </td>
              </tr>
            ) : (
              groups.map((group) => {
                const memberCount =
                  group.memberCount || group._count?.users || 0;
                return (
                  <tr
                    key={group.id}
                    className="transition-colors hover:bg-gray-100 dark:hover:bg-[#1e2533]/40"
                  >
                    <td
                      onClick={() => onViewClick(group)}
                      className="py-4 px-6 font-semibold text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      <TruncatedText
                        text={group.name}
                        maxWClass="max-w-[200px] sm:max-w-[300px]"
                        showUnderline={false}
                      />
                    </td>
                    <td
                      onClick={() => onMembersClick(group)}
                      className="py-4 px-6 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors select-none"
                    >
                      {memberCount} {t("members") || "members"}
                    </td>

                    {(canRead || canUpdate || canDelete) && (
                      <td className="py-4 px-6 text-right pr-8">
                        <div className="flex items-center justify-end gap-1">
                          {canRead && (
                            <button
                              title={t("view_details")}
                              onClick={() => onViewClick(group)}
                              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-all cursor-pointer"
                            >
                              <FiInfo size={15} />
                            </button>
                          )}
                          {(canUpdate || canRead) && (
                            <button
                              title={canUpdate ? t("manage_members") : t("view_members") || "Xem thành viên"}
                              onClick={() => onMembersClick(group)}
                              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-all cursor-pointer"
                            >
                              <FiUsers size={15} />
                            </button>
                          )}
                          {canUpdate && (
                            <button
                              title={t("edit_settings")}
                              onClick={() => onEditClick(group)}
                              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-all cursor-pointer"
                            >
                              <FiEdit2 size={14} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              title={t("delete_group")}
                              onClick={() => onDeleteClick(group)}
                              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer"
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
// BKAV HaiHS: Component bảng hiển thị danh sách nhóm - end

export default GroupTable;
