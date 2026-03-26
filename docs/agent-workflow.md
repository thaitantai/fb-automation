# Thiết kế hệ thống `.agents` cho dự án Tools Facebook

Chào bạn, với tư cách là Software Engineer cho dự án "Tools Facebook", tôi đã thiết kế kiến trúc và luồng làm việc (workflows) thư mục `.agents` để chuẩn hóa các quy trình tự động hóa cho AI Assistant.

Dự án dạng "Tool Facebook" thường đòi hỏi tính ổn định cao, tương tác qua DOM phức tạp (cần bypass checkpoint, quản lý proxy, cookies, session), và khả năng mở rộng liên tục khi Facebook thay đổi UI.

Dưới đây là thiết kế toàn bộ luồng `.agents/workflows` để hỗ trợ quá trình phát triển dự án.

## 1. Cấu trúc thư mục `.agents` đề xuất

```text
Tools/
└── .agents/
    ├── rules/
    │   ├── browser-automation-rules.md   # Setup quy luật khi code crawl/auto (Playwright/Puppeteer/Selenium)
    │   └── facebook-dom-selectors.md     # Nguyên tắc tách biệt file chứa DOM selectors để dễ bảo trì
    └── workflows/
        ├── 01-setup-dev-environment.md   # Cài đặt môi trường phát triển (NodeJS/Python, DB, SDK)
        ├── 02-scaffold-fb-feature.md     # Tạo template chuẩn cho 1 tool nhỏ/tính năng mới (VD: auto-comment)
        ├── 03-run-safe-browser-tests.md  # Kịch bản chạy test an toàn (không bị khóa tài khoản thật)
        └── 04-build-and-release.md       # Đóng gói và phát hành tool (Build .exe hoặc Chrome Extension)
```

## 2. Chi tiết các Workflows Cốt Lõi

### 2.1. `01-setup-dev-environment.md`
**Từ khóa:** Khởi tạo, Dependencies, Database.
**Mục đích:** Giúp Agent hoặc Developer mới nhanh chóng thiết lập môi trường chuẩn nhất.
**Các bước (Steps):**
1. Kiểm tra version ngôn ngữ (Python/Node.js) phù hợp với thư viện automation.
2. Cài đặt các thư viện lõi (VD: `playwright`, `puppeteer-extra-plugin-stealth` chống bị phát hiện bot, `axios`).
3. Khởi tạo file `.env` từ `.env.example` chứa thông tin kết nối tới hệ thống giải mã Captcha (Anticaptcha) hoặc Proxy API.
4. Setup Database local (SQLite/MongoDB) để lưu tài khoản FB (chứa UID, Pass, 2FA, Cookies, Token).

### 2.2. `02-scaffold-fb-feature.md`
**Từ khóa:** Tạo tool mới, Auto-Join-Group, Auto-Post.
**Mục đích:** Khi bạn yêu cầu viết 1 tính năng mới (VD: Code cho tôi Tool tự động comment), Agent sẽ dùng workflow này để tuân thủ kiến trúc thư mục.
**Các bước (Steps):**
1. Nhận tên tính năng (Ví dụ: `Auto-Comment`).
2. Sinh ra file logic chính trong thư mục `src/features/`.
3. Tách file chứa toàn bộ các HTML Selectors của Facebook ra file riêng (VD: `src/selectors/comment.json`) – **Rất quan trọng vì FB hay đổi cấu trúc HTML**.
4. Tạo module Helper để log trạng thái thành công/thất bại vào Database.

### 2.3. `03-run-safe-browser-tests.md`
**Từ khóa:** Test automation, Debug headless, Anti-detect.
**Mục đích:** Chạy thử tool trong môi trường an toàn (Account clone, gắn Proxy riêng) để trace lỗi mà không ảnh hưởng account chính.
**Các bước (Steps):**
1. Chỉ định một tài khoản UID test (loại clone) từ Database.
2. Khởi chạy trình duyệt test (mở kèm UI hoặc headless), chèn Cookies/Profile đã lưu.
3. Chạy kịch bản và **chụp ảnh màn hình (screenshot)** lập tức khi bị Checkpoint hoặc văng exception.
4. Ghi lỗi ra file log để phân tích sau.

### 2.4. `04-build-and-release.md`
**Từ khóa:** Build `.exe`, Chrome Extension, Deploy.
**Mục đích:** Chuẩn bị sản phẩm đưa lên server ảo (VPS) hoặc giao cho người dùng cuối.
**Các bước (Steps):**
1. Xác định target (Là Desktop App hay Extension hay Web App Cloud).
2. Clean code, Obfuscate code (bảo vệ mã nguồn tránh bị dịch ngược nếu mang bán).
3. Đóng gói ra file thực thi (VD dùng `pkg`, `pyinstaller` hoặc `electron-builder`).
4. Nén thành file `.zip`, kèm tài liệu hướng dẫn sử dụng.

---

## Các Câu Hỏi Lựa Chọn Kiến Trúc

Để tôi có thể tạo chi tiết nội dung từng file markdown `.agents/workflows/...` và cài đặt ứng dụng cho bạn ngay bây giờ, bạn vui lòng xác nhận giúp tôi:

1. **Ngôn ngữ và Framework:** Bạn muốn code dự án bằng **Node.js** (Puppeteer/Playwright) hay **Python** (Selenium/Playwright)? (Tôi khuyến nghị Node.js/Playwright vì nhẹ và xử lý bất đồng bộ tốt).
2. **Hình thức Tool:** Dự án này là phần mềm chạy trên máy tính (`Desktop Tool CLI/UI`), hay `Chrome Extension`, hay một hệ thống `Web Cloud` quản lý tập trung?
3. **Quản lý trình duyệt:** Bạn định dùng trình duyệt tự cấu hình hay tích hợp qua API với các Browser Antidetect Profile (Gologin, AdsPower...)?
