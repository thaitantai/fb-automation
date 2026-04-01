"use client";

import React from "react";
import { Users } from "lucide-react";

export function GroupEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center border border-border text-text-muted opacity-40">
                <Users size={32} />
            </div>
            <p className="text-[1.8rem] text-text-muted font-bold tracking-tight opacity-80">
                Không tìm thấy nhóm phù hợp trong bộ nhớ
            </p>
        </div>
    );
}
