import React from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

// BKAV HaiHS : Component ô nhập mật khẩu có nút bật tắt ẩn hiện và biểu tượng đi kèm - start
const PasswordInputField = ({
  label,
  value,
  onChange,
  placeholder,
  showPassword,
  onToggleShow,
  disabled = false,
  Icon,
  error = "",
  autoComplete = "off",
}) => {
  // BKAV HaiHS : Tính toán ghép các class CSS Tailwind tùy thuộc trạng thái lỗi - start
  const containerClass = error
    ? "relative bg-gray-50 border border-red-500/50 dark:bg-[#0b0f19] rounded-xl flex items-center px-4 py-2.5 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/10 transition-all duration-200"
    : "relative bg-gray-50 border border-gray-200 dark:bg-[#0b0f19] dark:border-[#232d42] rounded-xl flex items-center px-4 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all duration-200";

  const fieldClass =
    "flex-1 bg-transparent border-0 focus:outline-none text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 pl-3 pr-2 transition-colors duration-300";
  // BKAV HaiHS : Tính toán ghép các class CSS Tailwind tùy thuộc trạng thái lỗi - end

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-400 block pl-1 select-none">
        {label}
      </label>
      <div className={containerClass}>
        {Icon && (
          <Icon
            className="text-gray-400 dark:text-gray-500 shrink-0"
            size={14}
          />
        )}
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={fieldClass}
          disabled={disabled}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer shrink-0"
        >
          {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
        </button>
      </div>
      {error && (
        <p className="text-[10px] text-red-500 dark:text-red-400 font-medium pl-1 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};
// BKAV HaiHS : Component ô nhập mật khẩu có nút bật tắt ẩn hiện và biểu tượng đi kèm - end

export default PasswordInputField;
