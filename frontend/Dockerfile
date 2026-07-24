# Stage 1: Build stage
FROM node:20-alpine AS build-stage

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
# Lưu ý: Nếu có dependencies ở thư mục cha, bạn có thể cần copy thêm hoặc cài đặt bổ sung
RUN npm install

# Sao chép toàn bộ mã nguồn
COPY . .

# Build ứng dụng Vite
RUN npm run build

# Stage 2: Production stage
FROM nginx:stable-alpine AS production-stage

# Sao chép file build từ stage 1 vào thư mục phục vụ của nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Cấu hình Nginx để hỗ trợ React Router (SPA)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Mở cổng 80
EXPOSE 80

# Chạy Nginx
CMD ["nginx", "-g", "daemon off;"]

