"use client";

import React from "react";
import { CheckCircle2, Clock, Hash, RefreshCcw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseStepInfo } from "./utils";

// --- Sub-components (Local) ---
const MiniStepProgress = ({ message }: { message?: string }) => {
    const stepInfo = parseStepInfo(message);
    if (!stepInfo) return null;

    return (
        <div className="flex gap-1.5 mt-1">
            {Array.from({ length: stepInfo.total }).map((_, i) => (
                <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", i + 1 <= stepInfo.current ? "bg-primary shadow-glow-blue" : "bg-surface-3")} />
            ))}
        </div>
    );
};

const GroupStatusBadge = ({ type, time }: { type: string; time: string }) => {
    const config: Record<string, { label: string; className: string }> = {
        AUTO_POST: { label: "HOÀN TẤT", className: "bg-success/15 text-success" },
        AUTO_POST_PENDING: { label: "CHỜ DUYỆT", className: "bg-yellow-500/15 text-yellow-500" },
        SCHEDULED: { label: "ĐANG CHỜ", className: "bg-surface-3 text-text-muted border border-border/50" },
        ERROR: { label: "LỖI", className: "bg-error/15 text-error" },
        ACTIVITY: { label: "ĐANG CHẠY", className: "bg-primary/20 text-primary shadow-sm" },
    };
    const statusKey = type.includes('ERROR') ? 'ERROR' : type;
    const { label, className } = config[statusKey] || config.ACTIVITY;
    return (
        <div className="flex items-center gap-2">
            <span className={cn("text-[0.9rem] font-black px-2 py-0.5 rounded uppercase tracking-wider", className)}>{label}</span>
            <span className="text-[0.9rem] font-bold text-text-muted opacity-40">{time}</span>
        </div>
    );
};

// --- Main Row Export ---
export function CampaignGroupRow({ group, logs, campaignStatus }: { group: any; logs: any[]; campaignStatus: string }) {
    const latestLog = logs[0];
    const isSuccess = logs.some(l => l.actionType === 'AUTO_POST');
    const isError = logs.some(l => l.actionType.includes('ERROR'));
    const isPendingApproval = latestLog?.actionType === 'AUTO_POST_PENDING';
    const isProcessing = !isSuccess && !isError && campaignStatus === 'PROCESSING';

    return (
        <div className={cn(
            "grid grid-cols-12 gap-4 px-6 py-5 rounded-[1.4rem] border transition-all duration-300 relative items-center group",
            isSuccess ? "bg-success/[0.03] border-success/20 hover:bg-success/[0.05]" :
            isPendingApproval ? "bg-yellow-500/[0.03] border-yellow-500/20 hover:bg-yellow-500/[0.05]" :
            isError ? "bg-error/[0.03] border-error/20 hover:bg-error/[0.05]" : "bg-surface-2/30 border-border/60 hover:bg-surface-2/50",
            isProcessing && "border-primary/40 shadow-glow-blue/5"
        )}>
            <div className="col-span-4 flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-sm text-white", isSuccess ? "bg-success border-success" : isPendingApproval ? "bg-yellow-500 border-yellow-500 shadow-glow-yellow" : isError ? "bg-error border-error" : "bg-surface-3 border-border text-text-muted")}>
                    {isSuccess ? <CheckCircle2 size={16} /> : isPendingApproval ? <Clock size={16} /> : isError ? <AlertCircle size={16} /> : <Hash size={16} />}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-[1.4rem] font-black text-foreground truncate group-hover:text-primary transition-colors">{group.name || group.groupId}</span>
                    <span className="text-[1rem] font-mono font-bold text-text-muted opacity-50 tracking-tighter">UID: {group.groupId}</span>
                </div>
            </div>

            <div className="col-span-5">
                {latestLog ? (
                    <div className="flex flex-col gap-2">
                        <GroupStatusBadge type={latestLog.actionType} time={new Date(latestLog.executedAt).toLocaleTimeString("vi-VN")} />
                        <div className="flex flex-col gap-2">
                            <p className={cn("text-[1.3rem] font-bold italic truncate flex items-center gap-2", latestLog.actionType === 'SCHEDULED' ? "text-text-muted opacity-60" : "text-foreground opacity-90")}>
                                {latestLog.actionType === 'ACTIVITY' && <RefreshCcw size={12} className="animate-spin text-primary" />}
                                {latestLog.actionType === 'SCHEDULED' && <Clock size={12} className="opacity-50" />}
                                "{parseStepInfo(latestLog.message)?.cleanMessage || latestLog.message}"
                            </p>
                            <MiniStepProgress message={latestLog.message} />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 h-10 opacity-30">
                        {isProcessing ? (
                            <><RefreshCcw size={14} className="animate-spin text-primary" /><span className="text-[1.1rem] font-black text-primary uppercase tracking-widest italic animate-pulse">Robot đang điều phối...</span></>
                        ) : (<span className="text-[1.1rem] font-black text-text-muted uppercase tracking-widest italic">--- Đang chờ lượt ---</span>)}
                    </div>
                )}
            </div>

            <div className="col-span-3 flex justify-end">
                <div className={cn("px-5 py-2 rounded-xl flex items-center gap-3 border shadow-sm transition-all", isSuccess ? "bg-success/10 border-success/20 text-success" : isPendingApproval ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" : isError ? "bg-error/10 border-error/20 text-error" : "bg-surface-3 border-border text-text-muted")}>
                    <div className={cn("w-2 h-2 rounded-full", isSuccess ? "bg-success shadow-glow-green" : isPendingApproval ? "bg-yellow-500 shadow-glow-yellow" : isError ? "bg-error" : "bg-text-muted/40", isProcessing && "bg-primary animate-ping shadow-glow-blue")} />
                    <span className="text-[1.1rem] font-black uppercase tracking-widest">{isSuccess ? "Đã Xong" : isPendingApproval ? "Chờ duyệt" : latestLog?.actionType === 'SCHEDULED' ? "Chờ chạy" : isError ? "Lỗi" : isProcessing ? "Đang chạy" : "Chờ lượt"}</span>
                </div>
            </div>
        </div>
    );
}
