import React, { useState, useRef } from "react";
import { FiMoon, FiSun, FiChevronDown, FiCheck } from "react-icons/fi";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { useOutsideClick } from "@/hooks/useOutsideClick";

// BKAV HaiHS : Hằng số cấu hình danh sách ngôn ngữ hỗ trợ - start
const LANGUAGES = [
  { code: "en", label: "English (US)" },
  { code: "vi", label: "Tiếng Việt (VN)" },
];
// BKAV HaiHS : Hằng số cấu hình danh sách ngôn ngữ hỗ trợ - end

// BKAV HaiHS: Component tùy chỉnh giao diện và ngôn ngữ hệ thống - start
const Personalization = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useOutsideClick(dropdownRef, () => setIsDropdownOpen(false));

  // BKAV HaiHS : Xử lý sự kiện thay đổi ngôn ngữ giao diện và đóng dropdown - start
  const handleSelectLanguage = (langCode) => {
    setLanguage(langCode);
    setIsDropdownOpen(false);
  };
  // BKAV HaiHS : Xử lý sự kiện thay đổi ngôn ngữ giao diện và đóng dropdown - end

  const currentLanguageLabel =
    LANGUAGES.find((lang) => lang.code === language)?.label || "English (US)";

  return (
    <div className="space-y-4 animate-fade-in select-none">
      <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-sm transition-colors duration-300">
        <span className="text-gray-400 text-lg">🔮</span>
        {/* tiêu đề phần cá nhân hóa */}
        <h4>{t("personalization") || "personalization"}</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* card giao diện chủ đề */}
        <div className="md:col-span-2 bg-white dark:bg-[#161b26] border border-gray-200 dark:border-[#232d42] rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl transition-colors duration-300">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold tracking-widest text-blue-600 dark:text-blue-400/80 uppercase">
              {t("visualStyle") || "visualStyle"}
            </span>
            <h5 className="text-xs font-bold text-gray-900 dark:text-white tracking-wide transition-colors">
              {t("interfaceTheme") || "interfaceTheme"}
            </h5>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium transition-colors">
              {t("themeDesc") || "themeDesc"}
            </p>
          </div>

          <div className="flex bg-gray-100 dark:bg-[#0b0f19] border border-gray-200 dark:border-[#232d42] p-1 rounded-xl h-[40px] items-center max-w-xs transition-colors">
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex-1 h-full rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                theme === "dark"
                  ? "bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <FiMoon size={13} />
              <span>{t("dark") || "dark"}</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex-1 h-full rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                theme === "light"
                  ? "bg-white dark:bg-[#e2e8f0] text-gray-900 dark:text-[#0f172a] font-black shadow-sm"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <FiSun size={13} />
              <span>{t("light") || "light"}</span>
            </button>
          </div>
        </div>

        {/* card chọn ngôn ngữ */}
        <div
          className="bg-white dark:bg-[#161b26] border border-gray-200 dark:border-[#232d42] rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl transition-colors duration-300 relative overflow-visible"
          ref={dropdownRef}
        >
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold tracking-widest text-blue-600 dark:text-blue-400/80 uppercase">
              {t("global") || "global"}
            </span>
            <h5 className="text-xs font-bold text-gray-900 dark:text-white tracking-wide transition-colors">
              {t("language") || "language"}
            </h5>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium transition-colors">
              {t("languageDesc") || "languageDesc"}
            </p>
          </div>

          <div className="w-full relative">
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-[#232d42] text-xs font-bold text-gray-900 dark:text-gray-200 px-4 py-2.5 rounded-xl flex items-center justify-between cursor-pointer hover:border-gray-400 dark:hover:border-gray-700 transition-all select-none"
            >
              <span>{currentLanguageLabel}</span>
              <FiChevronDown
                size={14}
                className={`text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-blue-500" : ""}`}
              />
            </div>

            {isDropdownOpen && (
              <div className="absolute left-0 right-0 bottom-[52px] md:bottom-auto md:top-full md:mt-1.5 overflow-hidden bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-[#232d42] rounded-xl shadow-2xl z-[100] divide-y divide-gray-100 dark:divide-[#232d42]/60 animate-fade-in">
                {LANGUAGES.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <div
                      key={lang.code}
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`px-4 py-2.5 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span>{lang.label}</span>
                      {isSelected && (
                        <FiCheck size={12} className="text-blue-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
// BKAV HaiHS: Component tùy chỉnh giao diện và ngôn ngữ hệ thống - end

export default Personalization;
