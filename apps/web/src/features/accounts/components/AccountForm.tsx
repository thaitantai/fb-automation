import { useState } from "react";
import { cn } from "@/lib/utils";
import { NewAccountInput } from "../types";
import { Mail, Lock, Globe, Loader2, CheckCircle2, AlertCircle, Plus } from "lucide-react";

interface AccountFormProps {
  isAdding: boolean;
  submitting: boolean;
  onSubmit: (data: NewAccountInput) => Promise<{ success: boolean; error?: string }>;
}

export function AccountForm({ isAdding, submitting, onSubmit }: AccountFormProps) {
  const [formData, setFormData] = useState<NewAccountInput>({
    username: "zy3721ba@gmail.com",
    password: "nampro2003",
    proxyId: ""
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({
    type: null,
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });

    const result = await onSubmit(formData);
    console.log(result)
    if (result.success) {
      setStatus({
        type: 'success',
        message: 'Yêu cầu kết nối đã được gửi thành công! Hệ thống đang tự động đăng nhập...'
      });
      // Giữ lại form data để user biết họ vừa nhập gì, hoặc xóa nếu muốn
    } else {
      setStatus({
        type: 'error',
        message: result.error || 'Có lỗi xảy ra khi kết nối.'
      });
    }
  };

  return (
    <div className={cn(
      "grid transition-all duration-500 ease-in-out overflow-hidden glass-card shadow-lg",
      isAdding ? "max-h-[800px] opacity-100 p-10" : "max-h-0 opacity-0 p-0 border-none"
    )}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex items-center justify-between border-b border-border pb-6">
          <h3 className="text-2xl font-black text-foreground flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Plus size={20} />
            </div>
            Kết nối Facebook mới
          </h3>
        </div>

        {/* Status Message - Tận dụng Callout chuẩn */}
        {status.type && (
          <div className={cn(
            "animate-in fade-in slide-in-from-top-2 duration-300",
            status.type === 'success' ? "callout-success" : "callout-warning"
          )}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <p className="font-semibold">{status.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Username / Email */}
          <div className="space-y-3">
            <label className="ds-font-label text-text-muted flex items-center gap-2 ml-1">
              <Mail size={14} /> Email hoặc Số điện thoại
            </label>
            <input
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="VD: name@example.com hoặc 098..."
              className="input h-[4.8rem] px-5"
            />
          </div>

          {/* Password */}
          <div className="space-y-3">
            <label className="ds-font-label text-text-muted flex items-center gap-2 ml-1">
              <Lock size={14} /> Mật khẩu Facebook
            </label>
            <input
              required
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="input h-[4.8rem] px-5"
            />
          </div>
        </div>

        {/* Proxy ID (Tùy chọn) */}
        <div className="space-y-3">
          <label className="ds-font-label text-text-muted flex items-center gap-2 ml-1">
            <Globe size={14} /> Proxy (Tùy chọn)
          </label>
          <input
            value={formData.proxyId}
            onChange={(e) => setFormData({ ...formData, proxyId: e.target.value })}
            placeholder="VD: proxy-auth-id-xxxx"
            className="input h-[4.8rem] px-5"
          />
          <p className="text-[1.2rem] text-text-muted font-medium ml-1">
            Để trống nếu muốn sử dụng địa chỉ IP mặc định của hệ thống.
          </p>
        </div>

        <div className="flex justify-end pt-8 border-t border-border-subtle">
          <button
            disabled={submitting}
            type="submit"
            className="btn-primary h-[5rem] px-12 shadow-glow-blue uppercase font-bold tracking-widest text-[1.3rem]"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Đang xử lý kết nối...
              </>
            ) : "Bắt đầu kết nối ngay"}
          </button>
        </div>
      </form>
    </div>
  );
}
