"use client";

import React from "react";
import { RefreshCcw } from "lucide-react";

interface SyncProgressOverlayProps {
    isVisible: boolean;
    selectedCount: number;
}

export function SyncProgressOverlay({ isVisible, selectedCount }: SyncProgressOverlayProps) {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-8 animate-in fade-in duration-500">
            <div className="card-elevated w-full max-w-md p-10 text-center space-y-8 animate-in zoom-in duration-300">
                <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-primary">
                        <RefreshCcw size={28} />
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Đang cào dữ liệu nhóm</h3>
                    <p className="text-zinc-500 font-medium text-sm text-center">
                        Hệ thống đang truy cập Facebook để lấy danh sách nhóm của {selectedCount} tài khoản.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-primary animate-shimmer" style={{ width: '100%', backgroundSize: '200% 100%' }} />
                    </div>
                    <div className="flex justify-between text-[1rem] font-bold text-zinc-600 uppercase tracking-widest">
                        <span>Status: Running</span>
                        <span className="animate-pulse text-primary/80">Updating local cache...</span>
                    </div>
                </div>

                <p className="text-tiny text-zinc-600 italic">Quá trình này có thể tốn từ 10-30 giây tùy vào số lượng nhóm.</p>
            </div>
        </div>
    );
}
