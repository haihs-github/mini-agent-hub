import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient, { setAccessToken, memoizedRefresh } from "@/services/apiClient";

const AuthContext = createContext(null); // khởi tạo context

// BKAV HaiHS : Tạo AuthProvider để quản lý trạng thái đăng nhập bằng 2 Token - start
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null); // Lưu trữ Token hoàn toàn trong RAM!
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true); // Trạng thái kiểm tra khôi phục đăng nhập ban đầu

  // Lắng nghe sự kiện đăng xuất từ Axios interceptor khi Refresh Token hết hạn
  useEffect(() => {
    const handleAuthLogout = () => {
      logoutStateOnly();
    };
    window.addEventListener("auth-logout", handleAuthLogout);
    return () => window.removeEventListener("auth-logout", handleAuthLogout);
  }, []);

  // Tự động kiểm tra trạng thái đăng nhập khi ứng dụng khởi chạy (F5/Reload)
  useEffect(() => {
    const initAuth = async () => {
      // Load nhanh thông tin không nhạy cảm từ LocalStorage để tối ưu UX vẽ giao diện nhanh
      const savedUser = localStorage.getItem("user");
      const savedPermissions = localStorage.getItem("permissions");
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedPermissions) setPermissions(JSON.parse(savedPermissions));

      try {
        // Thực hiện cuộc gọi gia hạn ngầm (Silent Refresh) lên Backend qua Cookie bằng hàm memoized chống gọi trùng
        const res = await memoizedRefresh();
        const { token: newAccessToken, user: userData } = res.data.data;

        // Lưu Access Token mới nhận được vào RAM (JS Memory)
        setTokenState(newAccessToken);
        setAccessToken(newAccessToken);
        setUser(userData);
        setPermissions(userData.permissions || []);

        // Đồng bộ lại thông tin không nhạy cảm vào cache LocalStorage
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem(
          "permissions",
          JSON.stringify(userData.permissions || []),
        );
      } catch (err) {
        // Nếu không có cookie hoặc hết hạn -> Dọn dẹp bộ nhớ
        logoutStateOnly();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // BKAV HaiHS : Hàm cập nhật trạng thái khi đăng xuất nhưng chỉ ở phía Client (dùng làm callback) - start
  const logoutStateOnly = () => {
    setUser(null);
    setTokenState(null);
    setAccessToken(null);
    setPermissions([]);
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");
    localStorage.removeItem("token"); // Dọn dẹp tàn dư cũ nếu có
  };
  // BKAV HaiHS : Hàm cập nhật trạng thái khi đăng xuất nhưng chỉ ở phía Client (dùng làm callback) - end

  // BKAV HaiHS : Hàm loginSuccess cập nhật trạng thái đăng nhập thành công - start
  const loginSuccess = (userData, tokenData, permissionData) => {
    setUser(userData);
    setTokenState(tokenData); // Lưu vào RAM
    setAccessToken(tokenData); // Lưu vào apiClient RAM
    setPermissions(permissionData);

    // Lưu các thông tin không nhạy cảm để vẽ UI nhanh khi tải lại trang
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("permissions", JSON.stringify(permissionData));
  };
  // BKAV HaiHS : Hàm loginSuccess cập nhật trạng thái đăng nhập thành công - end

  // BKAV HaiHS : Hàm updateUser cập nhật thông tin hồ sơ cá nhân của người dùng - start
  const updateUser = (userData, tokenData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("user");
    }
    if (tokenData) {
      setTokenState(tokenData); // Lưu vào RAM
      setAccessToken(tokenData);
    }
  };
  // BKAV HaiHS : Hàm updateUser cập nhật thông tin hồ sơ cá nhân của người dùng - end

  // BKAV HaiHS : Hàm logout xóa sạch thông tin người dùng khỏi cả Client và Backend - start
  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (e) {
      console.error("Lỗi gửi yêu cầu đăng xuất tới Backend", e);
    } finally {
      logoutStateOnly();
    }
  };
  // BKAV HaiHS : Hàm logout xóa sạch thông tin người dùng khỏi cả Client và Backend - end

  return (
    <AuthContext.Provider
      value={{ user, token, permissions, loginSuccess, logout, updateUser, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
// BKAV HaiHS : Tạo AuthProvider để quản lý trạng thái đăng nhập bằng 2 Token - end

export const useAuth = () => useContext(AuthContext); // xuất context
