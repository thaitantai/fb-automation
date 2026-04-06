"use client";

import React from "react";
import { RefreshCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
    selectedCount: number;
    groupsCount: number;
    syncing: boolean;
    isProgressShowing: boolean;
    isSyncingBackground?: boolean;
    onSync: () => void;
    onRefresh: () => void;
    loading: boolean;
}

export function DashboardHeader({
    selectedCount,
    groupsCount,
    syncing,
    isProgressShowing,
    isSyncingBackground,
    onSync,
    onRefresh,
    loading
}: DashboardHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="space-y-2 text-center md:text-left">
                <h3 className=" text-foreground tracking-tight">
                    {selectedCount > 1
                        ? `Mạng lưới Nhóm (${selectedCount} TK)`
                        : selectedCount === 1
                            ? "Cơ sở dữ liệu Nhóm"
                            : "Quản lý nhóm tập trung"}
                </h3>
                <div className="flex items-center justify-center md:justify-start gap-3">
                    {groupsCount > 0 && !isSyncingBackground && <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />}
                    {isSyncingBackground && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping shadow-[0_0_10px_rgba(59,130,246,0.8)]" />}
                    <p className="text-[1.4rem] text-text-muted font-medium italic opacity-70">
                        {isSyncingBackground
                           ? `Đang chạy ngầm lấy dữ liệu liên tục... Đã tóm được ${groupsCount} nhóm!`
                           : groupsCount > 0
                            ? `Robot đã nạp ${groupsCount} nhóm khả dụng vào bộ nhớ.`
                            : "Chưa nạp dữ liệu. Vui lòng đồng bộ tài khoản để robot làm việc..."}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 bg-surface-2/50 p-3 rounded-[2rem] border border-border backdrop-blur-md shadow-sm">
                {selectedCount > 0 && (
                    <button
                        onClick={onSync}
                        disabled={syncing || isProgressShowing}
                        className={cn(
                            "group relative overflow-hidden px-8 py-3 bg-primary text-white rounded-2xl text-[1.2rem] font-black uppercase tracking-widest transition-all shadow-glow-blue hover:bg-primary-hover active:scale-95 disabled:opacity-30 flex items-center gap-3",
                            (syncing || isProgressShowing) && "cursor-not-allowed"
                        )}
                    >
                        {/* Subtle inner glow for active button */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        {(syncing || isProgressShowing || isSyncingBackground) ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>{isSyncingBackground ? 'ĐANG CHẠY NGẦM...' : 'ĐANG KHỞI TẠO...'}</span>
                            </>
                        ) : (
                            <>
                                <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                                <span>ĐỒNG BỘ ({selectedCount})</span>
                            </>
                        )}
                    </button>
                )}

                <button
                    onClick={onRefresh}
                    className="flex items-center justify-center w-[4.6rem] h-[4.6rem] bg-surface-3 hover:bg-surface-4 border border-border rounded-xl text-text-muted hover:text-foreground transition-all group"
                    title="Tải lại danh sách"
                >
                    <RefreshCcw size={18} className={cn(loading && "animate-spin", "group-hover:rotate-180 transition-transform duration-500")} />
                </button>
            </div>
        </div>
    );
}
