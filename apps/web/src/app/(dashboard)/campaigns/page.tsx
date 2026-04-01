"use client";

import React from "react";
import { Rocket } from "lucide-react";
import { CampaignDashboard } from "@/features/campaigns/components/CampaignDashboard";

export default function CampaignsPage() {
    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen">
            
            {/* Campaign Header Section - Header tinh gọn */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-primary-muted rounded-2xl flex items-center justify-center shadow-glow-blue border border-primary/20">
                        <Rocket className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-foreground tracking-tight">Chiến dịch Tự động</h1>
                        <p className="ds-font-label text-text-muted mt-1">Trình điều khiển Robot & Trạng thái Thực thi</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-8 px-6 py-3 glass-card rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            <span className="ds-font-label text-text-secondary">Đang xử lý: <span className="text-foreground font-black ml-1">02</span></span>
                        </div>
                        <div className="w-px h-4 bg-border" />
                        <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                             <span className="ds-font-label text-text-secondary">Hoàn tất: <span className="text-foreground font-black ml-1">14</span></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Campaign Master Workspace - Không gian làm việc chính */}
            <CampaignDashboard />

        </div>
    );
}
