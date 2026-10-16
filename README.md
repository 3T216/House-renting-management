# HỆ THỐNG QUẢN LÝ NHÀ TRỌ & CHI PHÍ THÔNG MINH (HOUSE RENTING MANAGEMENT)

Hệ thống quản lý phòng trọ, đồng hồ điện nước, tự động phát hành hóa đơn và tích hợp cổng thanh toán mã **VietQR** chuẩn Napas247.

---

## 🚀 Hướng Dẫn Chạy Dự Án

### 1. Khởi động nhanh (Khuyên dùng)
Dự án đã được thiết lập Monorepo. Chỉ cần chạy một lệnh duy nhất ở thư mục gốc:

```bash
npm run dev
```

Lệnh trên sẽ khởi chạy đồng thời cả hai dịch vụ:
- **Frontend (Client):** [http://localhost:5173](http://localhost:5173) (React + Vite)
- **Backend (Server):** [http://localhost:5000](http://localhost:5000) (Node.js + Express + Prisma SQLite)

---

## 🔑 Tài Khoản Trải Nghiệm Mẫu (Demo Accounts)

Trên giao diện Đăng nhập đã có sẵn nút **Đăng nhập nhanh 1-Click** hoặc bạn có thể dùng thông tin sau:

| Vai trò | Email đăng nhập | Mật khẩu | Mô tả trải nghiệm |
| :--- | :--- | :--- | :--- |
| **Chủ trọ (Landlord)** | `admin@gmail.com` | `admin123` | Toàn quyền quản trị Dashboard, sơ đồ phòng, lập hợp đồng, nhập điện nước, phát hành hóa đơn & duyệt bill chuyển khoản. |
| **Khách thuê (P101)** | `hoang.nam@gmail.com` | `123456` | Người thuê phòng P101: xem thông tin phòng, xem hóa đơn tiền nhà, quét mã VietQR và gửi phản ánh hỏng hóc. |
| **Khách thuê (P201)** | `minh.anh@gmail.com` | `123456` | Người thuê phòng P201: hóa đơn đang ở trạng thái *Chờ chủ trọ duyệt bill*. |
| **Khách thuê (P301)** | `tuan.kiet@gmail.com` | `123456` | Người thuê phòng P301: hóa đơn tháng 9 đang ở trạng thái *Quá hạn*. |

> **Mẹo:** Khi đang ở bất kỳ trang nào, bạn có thể bấm nút **"Chuyển vai trò Demo"** trên thanh Topbar phía trên cùng để chuyển qua lại tức thì giữa Chủ trọ và Khách thuê mà không cần đăng xuất!

---

## 🛠️ Công Nghệ & Kiến Trúc Sử Dụng

- **Frontend:**
  - React 18 + Vite (SPA)
  - Vanilla CSS Modern Design System (Bảng màu Indigo/Slate, Glassmorphism, Micro-animations)
  - `lucide-react` Icons
  - `chart.js` + `react-chartjs-2` (Biểu đồ doanh thu & tỷ lệ lấp đầy phòng)
  - `canvas-confetti` (Hiệu ứng khi chuyển khoản thành công)
  - Tích hợp chuẩn **VietQR API** tự động sinh QR chuyển khoản ngân hàng có sẵn số tiền và mã phòng.

- **Backend:**
  - Node.js + Express.js (RESTful API)
  - **Prisma ORM** + **SQLite** (`server/prisma/dev.db` - Không cần cài đặt hệ quản trị CSDL cồng kềnh)
  - Bảo mật bằng **JSON Web Token (JWT)** & **Bcrypt.js**
  - Phân quyền theo vai trò (RBAC): `LANDLORD` vs `TENANT`

---

## 📋 Các Lệnh Tiện Ích Database (Prisma)

Nếu muốn reset hoặc xem CSDL trực quan dạng bảng:

```bash
# Xem dữ liệu trực quan bằng giao diện web Prisma Studio
npm run db:studio

# Nạp lại dữ liệu mẫu (Seed Data)
npm run db:seed
```
