# Enterprise Frontend Setup Planning

Dự án có định hướng mở rộng lớn (SaaS, nhiều module quản lý tài khoản, chiến dịch, kịch bản). Vì vậy, cấu trúc **Feature-based Architecture** (chia theo từng Cụm tính năng / Domain) sẽ là tốt nhất thay vì gộp chung toàn bộ (như Components vs Hooks) dễ gây rối khi code phình to.

## Cấu trúc Thư mục Đề xuất (Enterprise Scale)

Thay vì cấu trúc cơ bản, `apps/web/src/` sẽ được thiết kế theo chuẩn **Bulletproof React**:

```text
src/
├── app/               # Next.js App Router (Chỉ chứa routing & gọi Layout/Page từ features)
├── components/        # UI tĩnh dùng chung toàn hệ thống (Button, Modal, Input, Table...)
├── config/            # Cấu hình tĩnh (Constants, Environment Variables, Routes list)
├── features/          # CHÌA KHÓA SCALING: Tách biệt từng cụm tính năng
│   ├── auth/          # Tính năng Đăng nhập/Phân quyền
│   ├── campaigns/     # Tính năng Chiến dịch (List, Detail, Create)
│   ├── accounts/      # Tính năng Quản lý Tài khoản FB
│   └── ...            # (Mỗi feature sẽ có thư mục components, hooks, services, types riêng)
├── lib/               # Cấu hình thư viện ngoài (axios, react-query, utils)
├── hooks/             # Custom hook dùng CHUNG (useDebounce, useClickOutside)
├── store/             # Global State (Zustand) chỉ lưu những gì thật sự global (User Session, UI Theme)
├── types/             # Global Type definitions
└── utils/             # Helper format JS thuần (formatDate, cleanString)
```

## Proposed Changes

### 1. The `features/` Directory (Scalability Core)
Tạo mẫu một Cụm tính năng. Ví dụ `src/features/campaigns/`:
- `components/` (chỉ dùng cho campaign như `CampaignForm.tsx`)
- `services/` (các hàm gọi api của campaign như `createCampaign()`)
- `types/` (interface cho Campaign)

### 2. Smart Axios Client (`src/lib/axios.ts`)
- Config một `axiosInstance` chuyên nghiệp.
- **Request Interceptor**: Tự động đính `Authorization Bearer Token` lấy từ cookie hoặc rỗng tùy môi trường (Client/Server của Next.js).
- **Response Interceptor**:
  - Chuẩn hóa data trả về (unwrap `.data` từ axios response).
  - Tự động bắt lỗi Authentication (401), nếu bị lỗi sẽ redirect mượt về trang `/login`.

### 3. Chuẩn bị Global UI Components (`src/components/ui/`)
Tạo sẵn bộ UI chuẩn (chúng ta có thể kết hợp thư viện như `lucide-react` đã có sẵn trong `package.json` và cấu hình Tailwind để dựng khung).

## Verification Plan

- Khởi chạy dev server với `pnpm dev`.
- Kiểm tra kiến trúc phân mảnh tính năng: đảm bảo file ở Feature này không import chéo lộn xộn Feature khác trừ khi qua index export chuẩn.
- Giao diện `lib/axios.ts` phải sẵn sàng đón Token cho các call API tới Backend.
