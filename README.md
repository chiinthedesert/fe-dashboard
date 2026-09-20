# FE Dashboard

Frontend cho hệ thống dashboard quản trị **Python Master**, được xây dựng bằng Vue 3, TypeScript, Vite, Tailwind CSS và shadcn-vue.

## Công nghệ sử dụng

- Vue 3
- TypeScript
- Vite
- Tailwind CSS
- shadcn-vue
- Lucide Vue Next
- Chart.js

## Trạng thái hiện tại

Backend API, dữ liệu thật và chức năng đăng nhập quản trị viên sẽ được tích hợp sau. Thắc mắc hỏi tự thân search, hỏi AI hoặc hỏi Chí (hiện tại cũng chả biết gì, đang cố)

- [ ] Dashboard Vận Hành
    - [ ] Tổng Quan
    - [ ] Theo Khu Vực
    - [ ] Bảng Thi & Độ Tuổi
    - [ ] Trường Học
- [ ] Quản Lý Thí Sinh
- [ ] Quản Lý Đối Tác
- [ ] Style lại màu và theme
- [ ] Tích Hợp API dữ liệu thật

## Yêu cầu trước khi cài đặt

Máy cần có:

- [Node.js](https://nodejs.org/)
- npm
- [Git](https://git-scm.com/)

Kiểm tra bằng các lệnh:

```sh
node --version
npm --version
git --version
```

Nếu các lệnh trên hiển thị số phiên bản thì môi trường đã sẵn sàng.

## 1. Clone dự án

Clone repository từ GitHub

Đi vào thư mục dự án:

```sh
cd fe-dashboard
```

## 2. Cài đặt dependency

Chạy lệnh sau trong thư mục dự án:

```sh
npm install
```

Lệnh này cài đặt toàn bộ dependency được khai báo trong `package.json`, bao gồm Vue, Tailwind CSS, shadcn-vue và các thư viện liên quan. Thành viên trong nhóm không cần cài đặt lại từng component shadcn-vue bằng tay.

## 3. Chạy dự án

Khởi động development server:

```sh
npm run dev
```

Sau khi khởi động thành công, terminal sẽ hiển thị địa chỉ truy cập, thường là:

```text
http://localhost:5173
```

Giữ terminal này hoạt động trong thời gian phát triển. Nhấn `Ctrl+C` để dừng server.

## Cấu hình API doanh thu

Màn hình Dashboard > Tổng quan gọi API `GET /api/v1/thong-ke/doanh-thu` theo API contract của Backend.

Tạo file `.env` từ `.env.example` nếu cần đổi địa chỉ backend:

```env
VITE_API_BASE_URL=https://api.pythonmaster.vn
```

Token đăng nhập được đọc từ `localStorage` với key `access_token` và gửi dưới dạng:

```text
Authorization: Bearer <access_token>
```

API hỗ trợ hai bộ lọc tùy chọn `start_date` và `end_date` theo định dạng `YYYY-MM-DD`. Lỗi `400` và `401` được hiển thị trực tiếp trên màn hình để người dùng xử lý.
