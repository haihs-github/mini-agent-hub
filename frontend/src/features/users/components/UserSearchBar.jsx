import React from "react";
import { useLanguage } from "@/context/LanguageContext";

// BKAV HaiHS : Component thanh tìm kiếm nhân sự nâng cao tích hợp dropdown autocomplete - start
const UserSearchBar = ({ searchHook }) => {
  const { t } = useLanguage();
  const {
    searchKeyword,
    activeSearchQuery,
    selectedDropdownUser,
    isDropdownOpen,
    dropdownResults,
    dropdownHasMore,
    isDropdownLoading,
    focusedIndex,
    dropdownRef,
    inputRef,
    dropdownListRef,
    itemRefs,
    handleDropdownScroll,
    handleSelectDropdownUser,
    handleCommitSearch,
    handleClearSearch,
    handleKeywordChange,
    handleInputKeyDown,
    setIsDropdownOpen,
  } = searchHook;

  return (
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
            onChange={(e) => handleKeywordChange(e.target.value)}
            placeholder={t("user_search_placeholder")}
            className="w-full pl-3 pr-8 py-2 text-sm bg-transparent border border-transparent outline-none focus:outline-none ring-0 focus:ring-0 text-gray-800 dark:text-gray-200 transition-colors"
            onFocus={() => {
              if (dropdownResults.length > 0 && searchKeyword.trim()) {
                setIsDropdownOpen(true);
              }
            }}
            onKeyDown={handleInputKeyDown}
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
            ref={dropdownListRef}
            onScroll={handleDropdownScroll}
            className="cyber-scrollbar absolute left-0 right-0 top-full mt-2 max-h-[220px] overflow-y-auto bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-[#232d42] rounded-2xl shadow-2xl z-[100] transition-colors"
          >
            <div className="sticky top-0 z-10 px-4 py-2 bg-gray-50/90 dark:bg-[#0f1623]/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                {t("search_results") || "search_results"}
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
                  onClick={() => handleSelectDropdownUser(u)}
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
                <span className="text-xs italic">{t("loading_more")}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* chỉ báo bộ lọc đang áp dụng */}
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
              onClick={handleClearSearch}
              className="hover:text-red-500 transition-colors ml-1 font-bold text-sm"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
// BKAV HaiHS : Component thanh tìm kiếm nhân sự nâng cao tích hợp dropdown autocomplete - end

export default UserSearchBar;
