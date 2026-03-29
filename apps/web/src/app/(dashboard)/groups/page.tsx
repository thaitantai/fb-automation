import { Component } from "lucide-react";
import { GroupsMasterDashboard } from "@/features/groups/components/GroupsMasterDashboard";

export default function GroupsPage() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen">
      
      {/* Dynamic Header Section (Compact) */}
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg border border-pink-500/20">
                  <Component className="w-5 h-5 text-white" />
              </div>
              <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Quản lý Group</h1>
                  <p className="text-zinc-600 text-[10px] font-medium uppercase tracking-wider">Dashboard Đa tài khoản</p>
              </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-sm">
              <div className="px-4 py-2 text-center border-r border-white/5">
                  <span className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Tiêu chuẩn</span>
                  <span className="text-lg font-bold text-white leading-none">AUTO</span>
              </div>
              <div className="px-4 py-2 text-center">
                  <span className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Phiên bản</span>
                  <span className="text-lg font-bold text-pink-500 leading-none">PRO</span>
              </div>
          </div>
      </div>

      {/* Main Master Dashboard Interface */}
      <GroupsMasterDashboard />

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5 opacity-50">
          <p className="text-xs text-zinc-600 italic">
              * Lưu ý: Hệ thống đang sử dụng cơ chế Async Queue để đồng bộ hóa hàng loạt tài khoản.
          </p>
          <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Cloud Sync Engine Running</span>
          </div>
      </div>
    </div>
  );
}
