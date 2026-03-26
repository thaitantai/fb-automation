# Kế hoạch & Kiến trúc Tổng thể: Facebook Automation Tool

Tài liệu này trình bày kiến trúc tổng thể toàn diện (Fullstack) cho dự án Facebook Automation Tool, bao gồm Database, Backend, Frontend và Automation Engine, nhằm đáp ứng các chức năng hiện tại và sẵn sàng mở rộng trong tương lai.

## 1. Phân tích Yêu cầu & Chức năng Hiện tại
- **Quản lý Tài khoản:** Đăng nhập, đăng xuất, lưu trữ phiên (session/cookies) an toàn.
- **Quản lý Group:** Lấy danh sách, phân loại và lưu trữ thông tin các nhóm đã tham gia.
- **Tương tác Tự động (Campaigns):**
  - Đăng bài tự động lên nhóm.
  - Tự động comment.
  - Tự động reply theo từ khóa/nhu cầu.
- **Bảo vệ Tài khoản (Anti-Spam):** SpinTax (tự động tạo content), Random delays, Quản lý Proxy, Stealth mode.

---

## 2. Lựa chọn Công nghệ (Tech Stack)

Để hệ thống hoạt động mượt mà, quản lý được hàng chục/trăm tài khoản cùng lúc và có giao diện trực quan cho người dùng, kiến trúc được đề xuất như sau:

### 2.1. Cơ sở dữ liệu (Database)
- **Primary Database: PostgreSQL**
  - *Lý do:* Dữ liệu của dự án có tính quan hệ cao (Một User -> Nhiều FB Accounts -> Nhiều Groups -> Nhiều Chiến dịch đăng bài/comment). PostgreSQL mạnh mẽ, an toàn và dễ dàng mở rộng.
- **In-memory Store & Message Queue: Redis**
  - *Lý do:* Hệ thống cần xử lý hàng đợi công việc (Job Queues) cực kỳ quan trọng (ví dụ: xếp hàng 100 tác vụ đăng bài để chạy dần, tránh bị Facebook block). Redis kết hợp với BullMQ là giải pháp tối ưu nhất cho Node.js.

### 2.2. Backend (API & Job Management)
- **Framework: Node.js với Express.js (hoặc NestJS)**
  - *Lý do:* Express nhẹ, linh hoạt. Kết hợp với Node.js rất phù hợp vì Automation Engine (Playwright) cũng dùng Node.js.
- **Job Queue: BullMQ**
  - *Lý do:* Quản lý các task vụ tự động hóa chạy ngầm (background jobs), có cơ chế retry khi lỗi, concurrency control (không chạy quá 2 account trên cùng 1 IP), theo dõi tiến độ.
- **Automation Engine: Playwright (với stealth-plugin)**
  - *Lý do:* Trình duyệt không đầu (headless browser) nhanh nhất hiện nay, có plugin chống phát hiện (stealth) giúp vượt qua các bài kiểm tra bot cơ bản của Facebook.

### 2.3. Frontend (Dashboard & User Interface)
- **Framework: React.js (Next.js hoặc Vite)**
  - *Lý do:* Xây dựng giao diện Single Page Application (SPA) mượt mà. Next.js hỗ trợ tốt cho việc mở rộng sau này nếu cần SEO cho landing page bán tool.
- **UI Library: Tailwind CSS & Shadcn/UI (hoặc Ant Design)**
  - *Lý do:* Phát triển giao diện dashboard quản lý nhanh, thẩm mỹ cao, mang lại trải nghiệm premium.
- **State Management: React Query / Zustand**
  - *Lý do:* Quản lý trạng thái gọi API và realtime updates (ví dụ: xem log worker đang chạy tới đâu).

---

## 3. Thiết kế Cơ sở dữ liệu (High-level Schema)

1. **`users`**: Khách hàng sử dụng hệ thống.
2. **`fb_accounts`**: Tài khoản Facebook được add vào hệ thống (lưu session_key/cookies mã hóa, proxy_id).
3. **`proxies`**: Danh sách IP Proxy để gán cho các `fb_accounts`.
4. **`fb_groups`**: Danh sách nhóm đã quét được từ tài khoản.
5. **`campaigns`**: Chiến dịch tự động hóa (Post, Comment, Reply). Chứa cấu hình: đối tượng, thời gian, delay, chế độ SpinTax.
6. **`post_templates`**: Các mẫu nội dung (có chứa cú pháp SpinTax như `{Hello|Hi}`).
7. **`job_logs`**: Lịch sử chạy của hệ thống (thành công/thất bại, lý do).

---

## 4. Kiến trúc Hệ thống (System Architecture Workflow)

1. **Người dùng (Frontend)** thiết lập chiến dịch (VD: Đăng bài vào 10 nhóm).
2. **Frontend** gửi request API tới **Backend**.
3. **Backend** lưu thông tin vào **PostgreSQL** và tạo ra 10 Jobs (Work) đẩy vào **Redis Queue (BullMQ)**.
4. **Automation Worker (Playwright)** sẽ lần lượt bốc từng Job trong Redis ra chạy:
   - Khởi tạo trình duyệt ẩn danh với Proxy và Cookies của tài khoản cẩn thận.
   - Decode SpinTax để tạo nội dung unique.
   - Mở Facebook, thực hiện các hành vi mô phỏng người thật (di chuột cong, delay ngẫu nhiên).
   - Đăng bài/Comment.
   - Trả kết quả về Backend cập nhật log.
5. **Frontend** nhận kết quả realtime via WebSockets (Socket.io) hoặc Polling.

---

## 5. Khả năng Mở rộng (Future Usability)

Mô hình **Backend + Queue + Worker** cho phép dự án mở rộng không giới hạn:
- Khi cần chạy 1000 tài khoản FB cùng lúc, chỉ cần tạo thêm các server Worker (chạy Playwright) kết nối chung vào 1 máy chủ Redis, Backend và Frontend vẫn giữ nguyên.
- Dễ dàng tích hợp AI (OpenAI API / Gemini) ở tầng Backend để sinh content tự động hoặc reply comment thông minh thay vì chỉ dùng SpinTax truyền thống.
- Bán dưới dạng phần mềm SaaS (Software as a Service) với hệ thống subscriptions, thanh toán.

---

## 6. Lộ trình Triển khai (Roadmap)

### Giai đoạn 1: Core Automation (Playwright Worker)
- Xây dựng các hàm tự động hóa độc lập: Login an toàn, quét group, đăng bài, comment (tuân thủ nguyên tắc file `.agents/rules/`).
- Xử lý SpinTax và log ảnh màn hình (checkpoint detection).

### Giai đoạn 2: Backend + Database
- Thiết kế API, setup PostgreSQL.
- Tích hợp BullMQ để bọc các hàm Automation ở Giai đoạn 1 thành các Background Jobs.

### Giai đoạn 3: Frontend Dashboard
- Xây dựng giao diện React.
- Kết nối API để người dùng có thể quản lý tài khoản FB, setup nội dung và bấm "Chạy".
- Hiển thị logs chạy trực quan.

### Giai đoạn 4: Hoàn thiện & Mở rộng
- Thêm cơ chế quản lý Proxy chuyên sâu.
- Các tính năng bảo vệ nâng cao (giới hạn tương tác theo ngày).
- Đóng gói (Docker hoặc Desktop App bằng Electron nếu muốn chạy local trên máy khách).

---

> [!IMPORTANT]
> Bạn vui lòng xem qua kế hoạch kiến trúc Fullstack này. Nếu kiến trúc và lựa chọn công nghệ (Node.js REST API + Playwright Workers + React Dashboard) đã phù hợp với định hướng của bạn, chúng ta sẽ bắt đầu khởi tạo Frontend hoặc Backend trước tùy theo ưu tiên.
