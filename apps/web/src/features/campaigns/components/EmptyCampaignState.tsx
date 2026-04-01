"use client";

import React from "react";
import { Rocket } from "lucide-react";

export function EmptyCampaignState() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] p-10 animate-in fade-in zoom-in-95 duration-700">
            {/* Visual Icon with Glow */}
            <div className="relative mb-10 group">
                <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full animate-pulse group-hover:bg-primary/30 transition-all duration-500" />
                <div className="w-24 h-24 rounded-[2.5rem] bg-surface-2 border border-border flex items-center justify-center text-text-muted relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12">
                    <Rocket size={40} className="text-primary group-hover:animate-bounce-slow" />
                </div>
            </div>

            <div className="text-center space-y-4 max-w-md mx-auto">
                <h3 className="ds-font-title text-foreground uppercase tracking-widest leading-tight">
                    Sẵn sàng cho chiến dịch đầu tiên?
                </h3>
                <p className="text-[1.5rem] text-text-muted font-medium italic opacity-80 leading-relaxed px-4">
                    "Tự động hóa là chìa khóa để giải phóng tiềm năng của bạn. Hãy khởi tạo một lộ trình Robot ngay bây giờ."
                </p>
            </div>

            {/* Subtle decorative line */}
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent mt-12 rounded-full" />
        </div>
    );
}
