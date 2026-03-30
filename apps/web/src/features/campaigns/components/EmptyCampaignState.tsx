"use client";

import React from "react";
import { Rocket } from "lucide-react";

export function EmptyCampaignState() {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-6">
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5 text-zinc-700 shadow-inner">
                <Rocket size={32} />
            </div>
            <div className="text-center">
                <h3 className="text-lg font-bold text-zinc-300">Chưa có chiến dịch nào được khởi tạo</h3>
                <p className="text-zinc-500 text-sm mt-1 max-w-xs mx-auto">Tạo chiến dịch đầu tiên để bắt đầu tự động hóa quy trình Marketing của bạn.</p>
            </div>
        </div>
    );
}
