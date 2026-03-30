"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

export function SpintaxHelp() {
    return (
        <div className="mt-auto p-8 rounded-2xl bg-white/[0.02] border border-border space-y-4 relative overflow-hidden group/tip">
            <div className="absolute -right-6 -top-6 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover/tip:bg-primary/10 transition-colors" />
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                <AlertCircle size={18} />
            </div>
            <div>
                <h5 className="text-muted-foreground text-tiny font-bold uppercase tracking-[0.1em] mb-1.5">Mẹo Spintax Robot</h5>
                <p className="text-muted-foreground/60 text-tiny leading-relaxed font-semibold">
                    Dùng {"{ }"} để robot tạo ra hàng ngàn biến thể nội dung.
                </p>
            </div>
        </div>
    );
}
