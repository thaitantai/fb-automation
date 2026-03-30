import { useState } from "react";
import { cn } from "@/lib/utils";
import { NewAccountInput } from "../types";
import { Mail, Lock, Globe, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

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
      "grid transition-all duration-500 ease-in-out overflow-hidden glass-card",
      isAdding ? "max-h-[700px] opacity-100 p-8" : "max-h-0 opacity-0 p-0 border-none"
    )}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2 font-heading">
          Kết nối Facebook mới
        </h3>

        {/* Status Message */}
        {status.type && (
          <div className={cn(
            "p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
            status.type === 'success' ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
          )}>
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Username / Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              Email hoặc Số điện thoại
            </label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="VD: name@example.com hoặc 098..."
                className="w-full bg-[#121212] border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none placeholder:text-zinc-700 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              Mật khẩu Facebook
            </label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                required
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-[#121212] border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none placeholder:text-zinc-700 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Proxy ID (Tùy chọn) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            Proxy (Tùy chọn)
          </label>
          <div className="relative group">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              value={formData.proxyId}
              onChange={(e) => setFormData({ ...formData, proxyId: e.target.value })}
              placeholder="VD: proxy-auth-id-xxxx"
              className="w-full bg-[#121212] border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-white focus:ring-2 focus:ring-blue-600 focus:outline-none placeholder:text-zinc-700 transition-all"
            />
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">Để trống nếu muốn sử dụng IP mặc định của server.</p>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/5">
          <button
            disabled={submitting}
            type="submit"
            className="group relative bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 py-3.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 overflow-hidden shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Đang xử lý...
                </>
              ) : "Bắt đầu kết nối"}
            </span>
            <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-full bg-white/10 transition-all duration-300" />
          </button>
        </div>
      </form>
    </div>
  );
}
