// BKAV HaiHS : Middleware xử lý lỗi tập trung đạt chuẩn Enterprise - start
const errorHandler = (err, req, res, next) => {
  // BKAV HaiHS : Xử lý lỗi parse cú pháp JSON từ request body (HTTP 400) - start
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      status: "fail",
      code: "INVALID_JSON_BODY",
      message: "Dữ liệu JSON gửi lên không đúng định dạng!",
    });
  }
  // BKAV HaiHS : Xử lý lỗi parse cú pháp JSON từ request body (HTTP 400) - end

  //Lỗi Operational công khai (Lỗi do mình chủ động tạo ra ở tầng Service/Controller)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: "fail",
      code: err.errorCode, // Mã lỗi định danh
      message: err.message, // Message sạch
    });
  }

  // Lỗi Hệ thống ẩn danh (Lỗi 500, lỗi sập DB, crash luồng, lỗi cú pháp thư viện bên thứ 3)
  console.error("LỖI HỆ THỐNG NGHIÊM TRỌNG (500):", err);

  // giảú lỗi với người dùng
  return res.status(500).json({
    status: "error",
    code: "INTERNAL_SERVER_ERROR",
    message: "Hệ thống đang gặp sự cố, vui lòng thử lại sau ít phút!",
  });
};
// BKAV HaiHS : Middleware xử lý lỗi tập trung - end

module.exports = errorHandler;
