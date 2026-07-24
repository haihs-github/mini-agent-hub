import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

// BKAV HaiHS: Provider đổi theme cho giao điện - start
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const root = window.document.documentElement;
    // Thực hiện thêm hoặc xóa class "dark" ở thẻ html để kích hoạt biến Tailwind
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark"; // BKAV HaiHS: Đồng bộ scrollbar và element hệ thống sang giao diện tối
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light"; // BKAV HaiHS: Đồng bộ scrollbar và element hệ thống sang giao diện sáng
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
// BKAV HaiHS: Provider đổi theme cho giao điện - end

export const useTheme = () => useContext(ThemeContext);
