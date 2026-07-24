import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext"; // BKAV HaiHS: Import hook ngôn ngữ

// BKAV HaiHS : Component Phân trang danh sách user - start
const UserPagination = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}) => {
  const { t } = useLanguage(); // BKAV HaiHS: Khai báo hàm dịch thuật

  if (totalPages <= 1) return null;

  // Hàm tính toán thu gọn các trang ở giữa bằng dấu ba chấm
  const getPageNumbers = (current, total) => {
    const pageNumbers = [];
    const maxVisiblePages = 7;

    if (total <= maxVisiblePages) {
      for (let i = 1; i <= total; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (current <= 4) {
        pageNumbers.push(1, 2, 3, 4, 5, "...", total);
      } else if (current >= total - 3) {
        pageNumbers.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pageNumbers.push(1, "...", current - 1, current, current + 1, "...", total);
      }
    }
    return pageNumbers;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 px-2 select-none">
      {/* BKAV HaiHS: Đổi màu chữ hiển thị số trang và dịch thuật */}
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">
        {t("showing_page") || "Hiển thị trang"}{" "}
        <span className="text-gray-900 dark:text-gray-300">{currentPage}</span>{" "}
        {t("of_total") || "trên tổng số"}{" "}
        <span className="text-gray-900 dark:text-gray-300">{totalPages}</span>{" "}
        {t("pages") || "trang"} ({totalItems} {t("nodes") || "nodes"})
      </div>

      <div className="flex items-center gap-1.5 text-xs font-bold">
        {/* Nút lùi trang */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2.5 rounded-xl bg-white dark:bg-[#161b26] border border-gray-200 dark:border-[#232d42] text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <FiChevronLeft size={14} />
        </button>

        {/* Vòng lặp vẽ các nút số trang */}
        {getPageNumbers(currentPage, totalPages).map((pageNum, idx) => {
          if (pageNum === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-9 h-9 flex justify-center items-center text-gray-400 dark:text-gray-600 select-none"
              >
                ...
              </span>
            );
          }

          const isCurrent = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-9 h-9 rounded-xl font-bold transition-all cursor-pointer flex justify-center items-center ${
                isCurrent
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-white dark:bg-[#161b26] border border-gray-200 dark:border-[#232d42] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Nút tiến trang */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2.5 rounded-xl bg-white dark:bg-[#161b26] border border-gray-200 dark:border-[#232d42] text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <FiChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
// BKAV HaiHS : Component Phân trang danh sách user - end

export default UserPagination;
