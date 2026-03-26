# Thiết kế Kiến trúc & Cấu trúc thư mục Fullstack: Facebook Automation Tool

Dựa trên bản thiết kế tổng thể, dự án này sẽ sử dụng kiến trúc **Monorepo** (quản lý bằng `pnpm workspace`). Cách tiếp cận này giúp chia sẻ mã nguồn (như Database models, Typescript interfaces) dễ dàng giữa Backend, Frontend và Worker một cách chuyên nghiệp và dễ bảo trì.

## User Review Required

> [!IMPORTANT]
> Vui lòng xem qua thiết kế và xác nhận các giải pháp công nghệ sau trước khi tôi bắt đầu khởi tạo mã:
> 1. **Package Manager:** Sử dụng `pnpm` workspace để xây dựng monorepo (tối ưu, nhẹ và nhanh).
> 2. **Backend (API):** Sử dụng Node.js + `Express` + TypeScript cho tốc độ phát triển (hoặc bạn muốn dùng `NestJS` cho enterprise?).
> 3. **Cơ sở dữ liệu:** PostgreSQL với `Prisma ORM`. Prisma giúp chúng ta tách riêng package DB để cả API và Worker tái sử dụng dễ dàng.
> 4. **Thư mục làm việc:** Dự án sẽ được tạo trong một thư mục mới có tên `fb-automation` lưu tại `f:\Web Application\Projects\Tools`.

## Proposed Changes

Chúng ta sẽ xây dựng kiến trúc với các thành phần sau:

```text
fb-automation/
├── package.json          (Root monorepo config, scripts quản lý chung)
├── pnpm-workspace.yaml   (Định nghĩa vùng làm việc cho apps/ và packages/)
├── docker-compose.yml    (Khởi tạo tự động PostgreSQL và Redis cục bộ)
├── apps/
│   ├── web/              (Frontend Dashboard - Next.js + Tailwind + Shadcn)
│   ├── api/              (REST API - Node.js/Express + BullMQ Queue)
│   └── worker/           (Automation Engine - Node.js + Playwright + Stealth)
├── packages/
│   ├── database/         (Prisma schema, migrations, xuất DB client)
│   ├── shared/           (Các hàm common, helpers, interfaces dùng chung)
│   ├── eslint-config/    (Config rule lint cho toàn dự án)
│   └── typescript-config/(Cấu hình base tsconfig.json thống nhất)
└── .env                  (Biến môi trường dùng chung)
```

### Chi tiết các khối (Components)

1. **`apps/web`**: 
   Chứa toàn bộ giao diện Next.js cho người dùng quản trị. Kết nối trực tiếp tới `apps/api`.
2. **`apps/api`**: 
   Chịu trách nhiệm nhận API request, thao tác với thư viện `packages/database`, và đẩy các tác vụ tự động vào Redis queue (thông qua BullMQ).
3. **`apps/worker`**: 
   Là một process chạy độc lập, liên tục pull jobs từ Redis queue để điều khiển trình duyệt ẩn danh thực hiện nghiệp vụ (Playwright). Report log lại Redis/Database.
4. **`packages/database`**: 
   Tạo Schema và Export PrismaClient model đã được gen types. Điều này đảm bảo tính nhất quán (Type-safe) tuyệt đối giữa DB - API - Worker.
5. **`docker-compose.yml`**: 
   Set up hạ tầng 1-click cho lập trình viên với Postgres và Redis bản mới nhất.

## Verification Plan

### Manual Verification
- Bạn sẽ duyệt và chốt được Tech Stack này.
- Các module và thư mục mẫu sẽ được tạo ra, không gặp lỗi cài đặt dependencies với pnpm.
- Docker command có thể đưa DB và Queue lên chạy ổn định trên cổng tiêu chuẩn.
