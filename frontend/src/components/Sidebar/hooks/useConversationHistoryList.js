import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/Toast";
import {
  updateConversationTitleApi,
  deleteConversationApi,
} from "@/features/chat/chatApi";

// BKAV HaiHS : Custom hook quản lý logic danh sách hội thoại và tương tác sửa/xóa - start
export function useConversationHistoryList({
  conversations,
  setConversations,
  activeId,
  selectConversation,
  hasMore,
  isLoadingHistory,
  fetchConversations,
  page,
}) {
  const { showToast } = useToast();

  // BKAV HaiHS : Định nghĩa các state quản lý dữ liệu modal và trạng thái API - start
  const [targetConv, setTargetConv] = useState(null);
  const [modalType, setModalType] = useState(null); // 'rename' hoặc 'delete'
  const [newTitle, setNewTitle] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  // BKAV HaiHS : Định nghĩa các state quản lý dữ liệu modal và trạng thái API - end

  // Ref cắm ở cuối danh sách để theo dõi vị trí cuộn trang
  const loadMoreRef = useRef(null);

  // BKAV HaiHS : Đóng mở modal có kiểm tra dữ liệu thay đổi để cảnh báo - start
  const handleCloseModalWithCheck = () => {
    if (modalType === "rename" && newTitle.trim() !== targetConv?.title) {
      setIsConfirmCancelOpen(true);
    } else {
      setModalType(null);
    }
  };
  // BKAV HaiHS : Đóng mở modal có kiểm tra dữ liệu thay đổi để cảnh báo - end

  // BKAV HaiHS : Thiết lập Intersection Observer bẫy sự kiện cuộn chuột để tự động phân trang - start
  useEffect(() => {
    if (!hasMore || isLoadingHistory) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchConversations(page + 1, true);
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingHistory, page, fetchConversations]);
  // BKAV HaiHS : Thiết lập Intersection Observer bẫy sự kiện cuộn chuột để tự động phân trang - end

  // BKAV HaiHS : Xử lý gọi API cập nhật tên mới cho phòng chat - start
  const handleRenameSubmit = async () => {
    if (!newTitle.trim() || newTitle === targetConv.title) return;
    setIsActionLoading(true);
    try {
      await updateConversationTitleApi(targetConv.id, newTitle.trim());
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConv.id ? { ...c, title: newTitle.trim() } : c,
        ),
      );
      showToast("Đã đổi tên hội thoại thành công!", "success");
      setModalType(null);
    } catch (err) {
      showToast("Đổi tên thất bại, vui lòng thử lại!", "error");
    } finally {
      setIsActionLoading(false);
    }
  };
  // BKAV HaiHS : Xử lý gọi API cập nhật tên mới cho phòng chat - end

  // BKAV HaiHS : Xử lý gọi API xóa cuộc hội thoại khỏi hệ thống - start
  const handleDeleteSubmit = async () => {
    setIsActionLoading(true);
    try {
      await deleteConversationApi(targetConv.id);
      setConversations((prev) => prev.filter((c) => c.id !== targetConv.id));
      showToast("Đã xóa cuộc hội thoại thành công!", "success");

      // Nếu xóa trúng phòng đang xem, tự động đá người dùng về phòng mới rỗng
      if (activeId === targetConv.id) {
        selectConversation("new-chat");
      }
      setModalType(null);
    } catch (err) {
      showToast("Không thể xóa hội thoại, lỗi hệ thống!", "error");
    } finally {
      setIsActionLoading(false);
    }
  };
  // BKAV HaiHS : Xử lý gọi API xóa cuộc hội thoại khỏi hệ thống - end

  return {
    targetConv,
    setTargetConv,
    modalType,
    setModalType,
    newTitle,
    setNewTitle,
    isActionLoading,
    isConfirmCancelOpen,
    setIsConfirmCancelOpen,
    loadMoreRef,
    handleCloseModalWithCheck,
    handleRenameSubmit,
    handleDeleteSubmit,
  };
}
// BKAV HaiHS : Custom hook quản lý logic danh sách hội thoại và tương tác sửa/xóa - end
