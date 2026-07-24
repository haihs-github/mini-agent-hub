// file này chứa custom Hook quản lý logic chat stream và hội thoại, giúp tách biệt rõ ràng phần logic nghiệp vụ với phần UI trình bày

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getConversationsApi,
  getConversationDetailApi,
  createConversationApi,
} from "@/features/chat/chatApi";
// BKAV HaiHS : Import getAccessToken de lay token tu RAM cho fetch/SSE - start
import { getAccessToken } from "@/services/apiClient";
import { useLanguage } from "@/context/LanguageContext";
// BKAV HaiHS : Import getAccessToken de lay token tu RAM cho fetch/SSE - end

// Hàm giải mã/lọc dữ liệu SSE nếu gặp chuỗi thô từ DB cũ (legacy data)
const cleanSSEContent = (content) => {
  if (!content || !content.includes("data: ")) return content;

  let accumulated = "";
  const lines = content.split("\n");
  for (const line of lines) {
    const cleanedLine = line.trim();
    if (!cleanedLine || !cleanedLine.startsWith("data: ")) continue;

    const dataStr = cleanedLine.replace("data: ", "").trim();
    if (dataStr.startsWith("[DONE]")) continue;

    try {
      const parsed = JSON.parse(dataStr);
      if (parsed.choices?.[0]?.delta?.content !== undefined) {
        accumulated += parsed.choices[0].delta.content;
      } else if (parsed.content !== undefined) {
        if (
          typeof parsed.content === "string" &&
          parsed.content.startsWith("data: ")
        ) {
          const innerStr = parsed.content.replace("data: ", "").trim();
          const innerParsed = JSON.parse(innerStr);
          accumulated += innerParsed.choices?.[0]?.delta?.content || "";
        } else {
          accumulated += parsed.content;
        }
      }
    } catch (e) {
      // Bỏ qua dòng bị lỗi parse
    }
  }
  return accumulated || content;
};

// BKAV HaiHS : Ham trich xuat text token tu payload SSE - start
const extractTextToken = (parsed) => {
  if (!parsed) return "";
  if (parsed.content && typeof parsed.content === "string") {
    // Kịch bản A: Backend bị bọc kép dạng { content: 'data: {"choices":...}' }
    if (parsed.content.startsWith("data: ")) {
      try {
        const innerStr = parsed.content.replace("data: ", "").trim();
        const innerParsed = JSON.parse(innerStr);
        return innerParsed.choices?.[0]?.delta?.content || "";
      } catch (e) {
        return parsed.content;
      }
    }
    // Kịch bản B: Backend trả chuẩn LangChain { content: "từ_chữ" }
    return parsed.content;
  }
  // Kịch bản C: Backend bắn thẳng cấu hình thô OpenAI/Groq SDK
  if (parsed.choices?.[0]?.delta?.content !== undefined) {
    return parsed.choices[0].delta.content;
  }
  return "";
};
// BKAV HaiHS : Ham trich xuat text token tu payload SSE - end

// BKAV HaiHS : Custom Hook quản lý logic Chat Stream & Hội thoại - start
export const useChatStream = (initialActiveId = "new-chat") => {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState(initialActiveId);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);

  // Các trạng thái bổ trợ nghiệp vụ
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false); // Trạng thái AI đang nhả chữ
  const [isStopping, setIsStopping] = useState(false); // Trạng thái đang dừng luồng
  const [isWaitingSkeleton, setIsWaitingSkeleton] = useState(false); // Trạng thái AI đang suy nghĩ
  const [attachedImages, setAttachedImages] = useState([]); // Lưu ảnh preview tạm thời

  // Dùng Ref để lưu trữ AbortController, phục vụ chức năng bấm "Dừng" chat
  const abortControllerRef = useRef(null);

  // BKAV HaiHS : Luu tru ID hien tai bang Ref de tranh stale closure khi bat dong bo - start
  const activeIdRef = useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);
  // BKAV HaiHS : Luu tru ID hien tai bang Ref de tranh stale closure khi bat dong bo - end

  // 1. Hàm lấy danh sách hội thoại (Cuộn vô hạn)
  const fetchConversations = useCallback(
    async (pageNum = 1, isLoadMore = false) => {
      if (isLoadingHistory) return;
      setIsLoadingHistory(true);
      try {
        const res = await getConversationsApi(pageNum, 20);

        // Tự động dò mảng danh sách từ mọi kiểu bọc dữ liệu của BE
        const fetchedList = res?.data || (Array.isArray(res) ? res : []);

        if (isLoadMore) {
          setConversations((prev) => [...prev, ...fetchedList]);
        } else {
          setConversations(fetchedList);
        }

        if (fetchedList.length < 20) setHasMore(false);
        setPage(pageNum);
      } catch (err) {
        console.error("Không thể lấy lịch sử hội thoại", err);
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [isLoadingHistory],
  );

  // Tự động load trang đầu tiên khi mở ứng dụng
  useEffect(() => {
    fetchConversations(1, false);
  }, []);

  // 2. Hàm chuyển hội thoại & lấy tin nhắn cũ
  // BKAV HaiHS : Chuyen doi phong chat va tu dong ket noi lai neu dang streaming - start
  const selectConversation = async (id) => {
    if (isStreaming) {
      // BKAV HaiHS : Chi ngat ket noi doc SSE o FE, giu nguyen luong chay o BE - start
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsStreaming(false);
      setIsWaitingSkeleton(false);
      // BKAV HaiHS : Chi ngat ket noi doc SSE o FE, giu nguyen luong chay o BE - end
    }

    setActiveId(id);
    setAttachedImages([]);
    setMessages([]);

    if (id === "new-chat") {
      return;
    }

    setIsWaitingSkeleton(true);
    try {
      const res = await getConversationDetailApi(id);

      const oldMessages =
        res?.data?.messages || res?.messages || (Array.isArray(res) ? res : []);

      const cleanedMessages = oldMessages.map((msg) => ({
        ...msg,
        content:
          msg.role === "assistant" ? cleanSSEContent(msg.content) : msg.content,
      }));
      setMessages(cleanedMessages);

      const isRoomStreaming =
        res?.data?.isStreaming || res?.isStreaming || false;
      if (isRoomStreaming) {
        // BKAV HaiHS : Lay tin nhan assistant cuoi cung neu co de dung chung ID khi reconnect - start
        const lastMsg = cleanedMessages[cleanedMessages.length - 1];
        const existingMsgId =
          lastMsg && lastMsg.role === "assistant" ? lastMsg.id : null;
        reconnectStream(id, existingMsgId);
        // BKAV HaiHS : Lay tin nhan assistant cuoi cung neu co de dung chung ID khi reconnect - end
      }
    } catch (err) {
      console.error("Lỗi lấy chi tiết tin nhắn", err);
    } finally {
      setIsWaitingSkeleton(false);
    }
  };
  // BKAV HaiHS : Chuyen doi phong chat va tu dong ket noi lai neu dang streaming - end

  // BKAV HaiHS : Dung luong AI va bao cho backend biet de ngat ket noi cheo may chu - start
  const handleStopStream = async () => {
    setIsStopping(true);
    setIsWaitingSkeleton(false);

    try {
      const token = getAccessToken();
      const baseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      // BKAV HaiHS : Goi endpoint /abort de phat tin hieu ABORT cheo may chu qua Redis Pub/Sub - start
      await fetch(`${baseUrl}/conversations/${activeId}/abort`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // BKAV HaiHS : Goi endpoint /abort de phat tin hieu ABORT cheo may chu qua Redis Pub/Sub - end
    } catch (err) {
      console.error("Lỗi khi dừng stream ở backend:", err);
      // Fallback: Nếu lỗi API /abort thì hủy ngay lập tức để tránh đơ UI
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsStreaming(false);
      setIsStopping(false);
    }
  };
  // BKAV HaiHS : Dung luong AI va bao cho backend biet de ngat ket noi cheo may chu - end

  // 4. CORE CHAT: Hàm gửi câu hỏi & Đọc dữ liệu Stream SSE phẳng chuẩn chỉnh
  const sendMessage = async (prompt, modelName) => {
    if (!prompt.trim() || isStreaming) return;

    const imagesToSend = [...attachedImages];
    let currentId = activeId;
    setIsWaitingSkeleton(true);
    setIsStreaming(true);

    if (currentId === "new-chat") {
      try {
        const titleProposal =
          prompt.length > 25 ? prompt.substring(0, 25) + "..." : prompt;
        const newRoom = await createConversationApi(titleProposal);

        const roomData = newRoom?.data || newRoom;
        currentId = roomData?.id;

        if (!currentId) {
          throw new Error(
            "Không bóc tách được ID phòng mới từ cấu trúc phản hồi của BE",
          );
        }

        setActiveId(currentId);
        setConversations((prev) => [roomData, ...prev]);
      } catch (err) {
        console.error("Không thể khởi tạo hội thoại ngầm dưới BE", err);
        setIsStreaming(false);
        setIsWaitingSkeleton(false);
        return;
      }
    }

    const userMsgId = Date.now();
    const userMsg = {
      id: userMsgId,
      role: "user",
      content: prompt,
      images: imagesToSend.map((img) => img.preview),
    };
    setMessages((prev) => [...prev, userMsg]);
    setAttachedImages([]);

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("modelName", modelName);

    imagesToSend.forEach((img) => {
      formData.append("images", img.fileObj);
    });

    abortControllerRef.current = new AbortController();
    const token = getAccessToken();
    const startTime = Date.now();
    let aiMsgId = null;

    try {
      const baseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await fetch(
        `${baseUrl}/conversations/${currentId}/chat`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
          signal: abortControllerRef.current.signal,
        },
      );

      if (!response.ok) {
        if (response.status === 429) {
          const errData = await response.json().catch(() => ({}));
          const errorCode = errData.code || "RATE_LIMIT_CHAT";
          const message =
            t(errorCode) || errData.message || t("RATE_LIMIT_CHAT");
          window.dispatchEvent(
            new CustomEvent("show-toast", {
              detail: { message, type: "error" },
            }),
          );
          throw new Error(message);
        }
        throw new Error("Đường truyền API Chat thất bại");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      aiMsgId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        { id: aiMsgId, role: "assistant", content: "", isStreaming: true },
      ]);
      setIsWaitingSkeleton(false);

      let accumulatedText = "";
      let streamBuffer = ""; // BIẾN CỨU CÁNH: Bộ đệm chắp vá các mảnh dữ liệu bị cắt nửa dòng
      let isDone = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Cộng dồn dữ liệu thô vào bộ đệm mạng
        streamBuffer += decoder.decode(value, { stream: true });
        const lines = streamBuffer.split("\n");

        // Giữ lại dòng cuối cùng dở dang chưa có ký tự xuống dòng (\n) sang chunk sau xử lý tiếp
        streamBuffer = lines.pop() || "";

        for (const line of lines) {
          const cleanedLine = line.trim();
          if (!cleanedLine || !cleanedLine.startsWith("data: ")) continue;

          const dataStr = cleanedLine.replace("data: ", "").trim();
          if (dataStr.startsWith("[DONE]")) {
            try {
              const jsonPart = dataStr.replace("[DONE]", "").trim();
              if (jsonPart) {
                const parsedDone = JSON.parse(jsonPart);
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg.id === aiMsgId) {
                      const updated = { ...msg };
                      if (parsedDone.usage) updated.usage = parsedDone.usage;
                      if (parsedDone.responseTime) updated.responseTime = parsedDone.responseTime;
                      if (parsedDone.isStopped !== undefined) updated.isStopped = parsedDone.isStopped;
                      return updated;
                    }
                    return msg;
                  })
                );
              }
            } catch (e) {
              console.error("Lỗi phân tích dữ liệu kết thúc từ DONE:", e);
            }
            isDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(dataStr);

            // BKAV HaiHS : Xu ly su kien sync khi nhan lai lich su tu Backend - start
            if (parsed.sync === true) {
              // Sự kiện sync: Backend gửi toàn bộ lịch sử trong một khối duy nhất
              if (parsed.content) {
                accumulatedText = parsed.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMsgId
                      ? { ...msg, content: accumulatedText }
                      : msg,
                  ),
                );
              }
              continue;
            }
            // BKAV HaiHS : Xu ly su kien sync khi nhan lai lich su tu Backend - end

            const textToken = extractTextToken(parsed);

            // Tiến hành cập nhật thời gian thực lên màn hình bong bóng chat
            if (textToken) {
              accumulatedText += textToken;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMsgId
                    ? { ...msg, content: accumulatedText }
                    : msg,
                ),
              );
            }
          } catch (e) {
            // Im lặng bỏ qua lỗi parse nếu dòng dữ liệu chưa hoàn chỉnh hẳn
          }
        }
        if (isDone) break; // BKAV HaiHS : Thoat ngay while loop de khong bi chan tai reader.read() sau khi nhan DONE
      }

      // STREAM KẾT THÚC THÀNH CÔNG
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1) + "s";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? { 
                ...msg, 
                isStreaming: false, 
                modelName, 
                responseTime: msg.responseTime || elapsed,
                isStopped: msg.isStopped !== undefined ? msg.isStopped : false
              }
            : msg,
        ),
      );

      setConversations((prev) => {
        const target = prev.find((c) => c.id === currentId);
        if (!target) return prev;
        const filtered = prev.filter((c) => c.id !== currentId);
        return [target, ...filtered];
      });
    } catch (err) {
      // Nếu lỗi xảy ra trước khi AI kịp phản hồi (ví dụ rate limit 429), xóa tin nhắn user khỏi UI
      if (!aiMsgId) {
        setMessages((prev) => prev.filter((msg) => msg.id !== userMsgId));
      }

      if (err.name === "AbortError") {
        console.log("Người dùng chủ động nhấn dừng Stream.");
      } else {
        console.error("Lỗi trong quá trình đọc Stream chữ chạy:", err);
      }
      // BKAV HaiHS : Dam bao set isStreaming cua tin nhan assistant cuoi cung thanh false khi loi hoac dung - start
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId ? { ...msg, isStreaming: false } : msg,
        ),
      );
      // BKAV HaiHS : Dam bao set isStreaming cua tin nhan assistant cuoi cung thanh false khi loi hoac dung - end
    } finally {
      // BKAV HaiHS : Chi reset trang thai neu room hien tai van dang active - start
      if (activeIdRef.current === currentId) {
        setIsStreaming(false);
        setIsStopping(false);
        setIsWaitingSkeleton(false);
      }
      // BKAV HaiHS : Chi reset trang thai neu room hien tai van dang active - end
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
  };

  // BKAV HaiHS : Thuc hien dang ky lai luong stream theo quy trinh 3 buoc Subscribe-Query-Flush - start
  const reconnectStream = async (currentId, existingMsgId = null) => {
    setIsStreaming(true);
    const aiMsgId = existingMsgId || Date.now() + 1;
    const startTime = Date.now();

    if (existingMsgId) {
      // BKAV HaiHS : Neu da co tin nhan trong DB, gan no ve isStreaming = true - start
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === existingMsgId ? { ...msg, isStreaming: true } : msg,
        ),
      );
      // BKAV HaiHS : Neu da co tin nhan trong DB, gan no ve isStreaming = true - end
    } else {
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === "assistant") return prev;
        return [
          ...prev,
          { id: aiMsgId, role: "assistant", content: "", isStreaming: true },
        ];
      });
    }

    abortControllerRef.current = new AbortController();
    const token = getAccessToken();

    try {
      const baseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      // BKAV HaiHS : Gui tham so ?resume=true de Backend xu ly theo quy trinh 3 buoc - start
      const response = await fetch(
        `${baseUrl}/conversations/${currentId}/chat?resume=true`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: abortControllerRef.current.signal,
        },
      );
      // BKAV HaiHS : Gui tham so ?resume=true de Backend xu ly theo quy trinh 3 buoc - end

      if (!response.ok) {
        if (response.status === 429) {
          const errData = await response.json().catch(() => ({}));
          const message =
            errData.message ||
            "Bạn đã vượt giới hạn kết nối lại. Vui lòng thử lại!";
          window.dispatchEvent(
            new CustomEvent("show-toast", {
              detail: { message, type: "error" },
            }),
          );
          throw new Error(message);
        }
        throw new Error("Đường truyền API Chat Reconnect thất bại");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let accumulatedText = "";
      let streamBuffer = "";
      let isDone = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done || isDone) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const lines = streamBuffer.split("\n");
        streamBuffer = lines.pop() || "";

        for (const line of lines) {
          const cleanedLine = line.trim();
          if (!cleanedLine || !cleanedLine.startsWith("data: ")) continue;

          const dataStr = cleanedLine.replace("data: ", "").trim();
          if (dataStr.startsWith("[DONE]")) {
            try {
              const jsonPart = dataStr.replace("[DONE]", "").trim();
              if (jsonPart) {
                const parsedDone = JSON.parse(jsonPart);
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg.id === aiMsgId) {
                      const updated = { ...msg };
                      if (parsedDone.usage) updated.usage = parsedDone.usage;
                      if (parsedDone.responseTime) updated.responseTime = parsedDone.responseTime;
                      if (parsedDone.isStopped !== undefined) updated.isStopped = parsedDone.isStopped;
                      return updated;
                    }
                    return msg;
                  })
                );
              }
            } catch (e) {
              console.error("Lỗi phân tích dữ liệu kết thúc từ DONE:", e);
            }
            isDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(dataStr);

            // BKAV HaiHS : Xu ly su kien sync: thay the toan bo lich su bang khoi van ban nhan duoc - start
            if (parsed.sync === true) {
              if (parsed.content) {
                accumulatedText = parsed.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMsgId
                      ? { ...msg, content: accumulatedText }
                      : msg,
                  ),
                );
              }
              continue;
            }
            // BKAV HaiHS : Xu ly su kien sync: thay the toan bo lich su bang khoi van ban nhan duoc - end

            // BKAV HaiHS : Xu ly token live nhan tiep sau khi da dong bo lich su - start
            const textToken = extractTextToken(parsed);
            if (textToken) {
              accumulatedText += textToken;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMsgId
                    ? { ...msg, content: accumulatedText }
                    : msg,
                ),
              );
            }
            // BKAV HaiHS : Xu ly token live nhan tiep sau khi da dong bo lich su - end
          } catch (e) {
            // Im lang bo qua dong loi parse thong tin
          }
        }
        if (isDone) break; // BKAV HaiHS : Thoat ngay while loop de khong bi chan tai reader.read() sau khi nhan DONE
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1) + "s";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? { 
                ...msg, 
                isStreaming: false, 
                responseTime: msg.responseTime || elapsed,
                isStopped: msg.isStopped !== undefined ? msg.isStopped : false
              }
            : msg,
        ),
      );
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Người dùng chủ động nhấn dừng Stream.");
      } else {
        console.error("Lỗi trong quá trình kết nối lại Stream:", err);
      }
      // BKAV HaiHS : Dam bao set isStreaming cua tin nhan assistant cuoi cung thanh false khi loi hoac dung - start
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId ? { ...msg, isStreaming: false } : msg,
        ),
      );
      // BKAV HaiHS : Dam bao set isStreaming cua tin nhan assistant cuoi cung thanh false khi loi hoac dung - end
    } finally {
      // BKAV HaiHS : Chi reset trang thai neu room hien tai van dang active - start
      if (activeIdRef.current === currentId) {
        setIsStreaming(false);
        setIsStopping(false);
        setIsWaitingSkeleton(false);
      }
      // BKAV HaiHS : Chi reset trang thai neu room hien tai van dang active - end
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
  };
  // BKAV HaiHS : Thuc hien dang ky lai luong stream theo quy trinh 3 buoc Subscribe-Query-Flush - end

  // BKAV HaiHS : Custom Hook quản lý logic Chat Stream & Hội thoại - end

  return {
    activeId,
    conversations,
    messages,
    hasMore,
    isLoadingHistory,
    isStreaming,
    isStopping,
    isWaitingSkeleton,
    attachedImages,
    setAttachedImages,
    setConversations,
    selectConversation,
    fetchConversations,
    sendMessage,
    handleStopStream,
    page,
  };
};
