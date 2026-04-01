import { Component } from "lucide-react";
import { GroupsMasterDashboard } from "@/features/groups/components/GroupsMasterDashboard";

export default function GroupsPage() {
    return (
        <div className="flex flex-col h-screen p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden bg-transparent">

            {/* Row 1: Header - Tiêu đề chính */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-primary-muted rounded-2xl flex items-center justify-center shadow-glow-blue border border-primary/20">
                        <Component className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-foreground tracking-tight">Quản lý nhóm</h1>
                        <p className="ds-font-label text-text-muted mt-1 uppercase">Dashboard Đa tài khoản & Đồng bộ hóa</p>
                    </div>
                </div>
            </div>

            {/* Row 2: Main Dashboard - Không gian làm việc */}
            <div className="flex-1 min-h-0 flex flex-col">
                <GroupsMasterDashboard />
            </div>

            {/* Row 3: Footer Status - Trạng thái hệ thống */}
            <div className="flex items-center justify-between pt-6 border-t border-border bg-surface-2/10 shrink-0 px-2">
                <p className="text-[1.2rem] text-text-muted italic flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-border-strong rounded-full" />
                    Hệ thống đang sử dụng cơ chế Async Queue để tối ưu hiệu suất đồng bộ.
                </p>
                <div className="flex items-center gap-3 px-4 py-2 bg-success/5 rounded-full border border-success/10">
                    <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                    <span className="ds-font-label text-success font-bold">Cloud Sync Engine Running</span>
                </div>
            </div>
        </div>
    );
}
