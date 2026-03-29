"use client";

import React from "react";
import { Rocket } from "lucide-react";
import { CampaignDashboard } from "@/features/campaigns/components/CampaignDashboard";

export default function CampaignsPage() {
    return (
        <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen">
            
            {/* Campaign Header Section (Compact) */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg border border-violet-500/20">
                        <Rocket className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Chiến dịch Tự động</h1>
                        <p className="text-zinc-600 text-[10px] font-medium uppercase tracking-wider">Trình điều khiển Robot & Trạng thái Thực thi</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-6 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Đang xử lý: 02
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Hoàn tất: 14
                        </div>
                    </div>
                </div>
            </div>

            {/* Campaign Master Workspace */}
            <CampaignDashboard />

        </div>
    );
}
