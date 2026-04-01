"use client";

import React from "react";
import { Users } from "lucide-react";

export function EmptyAccountState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            <div className="w-24 h-24 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5 text-zinc-800 shadow-inner relative">
                <Users size={44} />
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl" />
            </div>
            <div className="text-center max-w-xs px-4">
                <h3 className="text-[1.5rem] font-black text-zinc-400 uppercase tracking-tighter">No Accounts Selected</h3>
                <p className="text-zinc-600 text-sm mt-3 leading-relaxed italic font-medium">
                    Vui lòng chọn ít nhất một tài khoản Facebook ở bảng điều hướng bên trái để theo dõi các nhóm.
                </p>
            </div>
        </div>
    );
}
