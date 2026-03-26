# Database Schema Design (High-Level)
Dự án: Facebook Automation Tool
Database: PostgreSQL

Tài liệu này định nghĩa cấu trúc dữ liệu cho dự án, đảm bảo khả năng quản lý hàng loạt tài khoản Facebook, chiến dịch và lưu trữ logs lịch sử chạy.

## Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ fb_accounts : "manages"
    fb_accounts ||--|| proxies : "uses"
    fb_accounts ||--o{ fb_groups : "joins"
    users ||--o{ post_templates : "creates"
    users ||--o{ campaigns : "creates"
    campaigns ||--o{ fb_accounts : "targets"
    campaigns ||--o{ job_logs : "generates"
    fb_accounts ||--o{ job_logs : "executes"

    users {
        uuid id PK
        string email
        string password_hash
        string subscription_plan
        timestamp created_at
    }

    proxies {
        uuid id PK
        string ip
        int port
        string username
        string password
        boolean is_active
    }

    fb_accounts {
        uuid id PK
        uuid user_id FK
        uuid proxy_id FK
        string fb_uid "Mã ID Facebook"
        string session_data "Encrypted Cookies/Session"
        string status "ACTIVE, CHECKPOINT, BANNED"
        timestamp last_login
    }

    fb_groups {
        uuid id PK
        uuid fb_account_id FK
        string group_id "ID Group trên FB"
        string name "Tên Group"
        string privacy "PUBLIC, PRIVATE"
        int member_count
        timestamp synced_at
    }

    post_templates {
        uuid id PK
        uuid user_id FK
        string name "Tên mẫu"
        text content_spintax "Nội dung {Hi|Hello}"
        json media_urls "Danh sách ảnh/video đính kèm"
    }

    campaigns {
        uuid id PK
        uuid user_id FK
        string name
        string type "POST_GROUP, AUTO_COMMENT"
        json target_configs "List Group IDs hoặc URL bài viết"
        uuid template_id FK
        json delay_config "Min/Max delay"
        string status "DRAFT, RUNNING, PAUSED, COMPLETED"
        timestamp scheduled_at
    }

    job_logs {
        uuid id PK
        uuid campaign_id FK
        uuid fb_account_id FK
        string action_type "POST_SUCCESS, CHECKPOINT, LOGIN_FAILED"
        text message
        string screenshot_url
        timestamp executed_at
    }
```

---

## Chi tiết các Bảng (Tables)

### 1. Bảng `users` (Người dùng Hệ thống)
Chứa thông tin của người dùng đăng nhập vào hệ thống quản lý (Dashboard). Sẵn sàng cho việc mở rộng SaaS sau này (phân biệt gói Free, Premium qua `subscription_plan`).

### 2. Bảng `proxies` (Quản lý Proxy)
Lưu trữ danh sách Proxy. Theo nguyên tắc `Browser Automation Rules`, một Proxy nên được gắn cố định với một tài khoản FB để giữ IP sạch.

### 3. Bảng `fb_accounts` (Tài khoản Facebook)
Quản lý các tài khoản FB được thêm vào.
- `session_data`: Sẽ chứa thông tin session/cookies đã được mã hóa (AES-256) đảm bảo bảo mật.
- `status`: Giúp hệ thống tự động ngừng tương tác nếu bị `CHECKPOINT`.

### 4. Bảng `fb_groups` (Nhóm Facebook)
Sau khi worker (Playwright) quét tài khoản và lấy được danh sách nhóm đã tham gia, thông tin sẽ được Sync về bảng này.

### 5. Bảng `post_templates` (Mẫu nội dung)
Nơi người dùng lưu sẵn các nội dung chuẩn bị đăng, hỗ trợ cấu trúc **SpinTax** (`{A|B}`).

### 6. Bảng `campaigns` (Chiến dịch)
Bảng quan trọng nhất để lên lịch chạy.
- `target_configs`: Chứa danh sách các Group ID mà chiến dịch này sẽ nhắm tới.
- Khi một campaign chuyển sang trạng thái `RUNNING`, Backend sẽ đọc cấu hình và đẩy các Task nhỏ vào Redis Queue (BullMQ) để Playwright Worker bốc ra xử lý.

### 7. Bảng `job_logs` (Lịch sử & Theo dõi)
Mọi hành động thực tế của tài khoản (như Đăng thành công, Bị khóa, Phát hiện captcha) đều được lưu vào đây, kèm theo link ảnh chụp màn hình (`screenshot_url`) nếu có lỗi. Giao diện Frontend sẽ gọi API lấy logs này để người dùng theo dõi Realtime.
