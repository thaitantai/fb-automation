"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { authService } from "../api/auth.service";
import { useAuth } from "../hooks/useAuth";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return (
    <div className="card w-full max-w-md h-[480px] skeleton rounded-2xl" />
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await authService.login({ email, password });
      if (res.status === 'ok') {
        login(res.data.token, res.data.user);
      } else {
        setError(res.message || "Email hoặc mật khẩu không chính xác.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Đã xảy ra lỗi không xác định.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-elevated w-full max-w-[42rem] p-10 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Hiệu ứng nền mờ tạo chiều sâu */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[100px] rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 blur-[100px] rounded-full" />

      <div className="relative z-10 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary-muted rounded-2xl mx-auto flex items-center justify-center border border-primary/20 mb-2 shadow-glow-blue">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="ds-font-title text-foreground">
            Welcome Back
          </h1>
          <p className="text-text-secondary text-[1.4rem] font-medium">
            Đăng nhập để vào hệ thống điều khiển automation
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="callout-warning border-error/20 bg-error/5 text-error animate-in zoom-in duration-300">
              <AlertCircle size={18} className="shrink-0" />
              <p className="font-semibold text-[1.3rem]">{error}</p>
            </div>
          )}

          <div className="space-y-2.5">
            <label htmlFor="email" className="ds-font-label ml-1 text-text-muted">Địa chỉ Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="input h-[4.6rem] px-5 bg-surface-2 border-white/5 focus:bg-surface-3 transition-all"
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between ml-1">
              <label htmlFor="password" className="ds-font-label text-text-muted">Mật khẩu</label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input h-[4.6rem] px-5 pr-14 bg-surface-2 border-white/5 focus:bg-surface-3 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-foreground transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className="btn-primary w-full h-[5rem] mt-2 shadow-glow-blue font-bold text-[1.4rem] uppercase tracking-wider"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              "Đăng nhập ngay"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-[1.3rem] font-medium text-text-muted pt-2">
          Bạn chưa có tài khoản?{" "}
          <Link href="/register" className="text-primary hover:text-primary-hover underline underline-offset-4 decoration-primary/30 transition-all font-bold">
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
}
