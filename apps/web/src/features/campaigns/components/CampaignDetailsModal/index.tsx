"use client";

import React, { useEffect, useMemo } from "react";
import {
    Activity, CheckCircle2,
    Clock, Hash, RefreshCcw, AlertCircle, SkipForward
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCampaigns } from "../../hooks/useCampaigns";
import { Campaign } from "../../types";
import { Modal } from "@/components/ui/Modal";
import { parseStepInfo } from "./utils";
// --- Types ---
interface CampaignDetailsModalProps {
    campaign: (Campaign & { groups?: any[] }) | null;
    isOpen: boolean;
    onClose: () => void;
}

// --- Sub-components (Local to this file) ---

const MiniStepProgress = ({ message }: { message?: string }) => {
    const stepInfo = parseStepInfo(message);
    if (!stepInfo || !stepInfo.total) return null;

    return (
        <div className="flex gap-1.5 mt-1">
            {Array.from({ length: stepInfo.total }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "h-1.5 flex-1 rounded-full transition-all duration-500",
                        i + 1 <= stepInfo.current ? "bg-primary shadow-glow-blue" : "bg-surface-3"
                    )}
                />
            ))}
        </div>
    );
};

const GroupStatusBadge = ({ type, time }: { type: string; time: string }) => {
    const config: Record<string, { label: string; className: string }> = {
        COMPLETE: { label: "HOÀN TẤT", className: "bg-success/15 text-success" },
        PENDING: { label: "CHỜ DUYỆT", className: "bg-yellow-500/15 text-yellow-500" },
        SKIP: { label: "BỎ QUA", className: "bg-orange-500/15 text-orange-500" },
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

const CampaignGroupRow = ({ group, groupLogs, campaignStatus }: { group: any; groupLogs: any[]; campaignStatus: string }) => {
    // Luôn lấy log đầu tiên làm trạng thái thực thi hiện tại (logs đã qua sắp xếp desc ở useHook)
    const latestLog = groupLogs[0];

    // Kiểm tra kết quả cuối cùng trong lịch sử group (với batchID hiện tại)
    const isSuccess = groupLogs.some(l => l.actionType === 'COMPLETE');
    const isError = groupLogs.some(l => l.actionType === 'ERROR');
    const isPendingApproval = latestLog?.actionType === 'PENDING';
    const isSkipped = latestLog?.actionType === 'SKIP';

    // Flag robot đang xử lý (campaign đang processing và group chưa có kết quả cuối)
    const isProcessing = !isSuccess && !isError && !isPendingApproval && !isSkipped && campaignStatus === 'PROCESSING';

    const renderContent = () => {
        if (!latestLog) {
            return (
                <div className="flex items-center gap-3 h-10 opacity-30">
                    {isProcessing ? (
                        <><RefreshCcw size={14} className="animate-spin text-primary" /><span className="text-[1.1rem] font-black text-primary uppercase tracking-widest italic animate-pulse">Robot đang điều phối...</span></>
                    ) : (
                        <span className="text-[1.1rem] font-black text-text-muted uppercase tracking-widest italic">--- Đang chờ lượt ---</span>
                    )}
                </div>
            );
        }

        const stepInfo = parseStepInfo(latestLog.message);

        return (
            <div className="flex flex-col gap-2">
                <GroupStatusBadge type={latestLog.actionType} time={new Date(latestLog.executedAt).toLocaleTimeString("vi-VN")} />
                <div className="flex flex-col gap-2">
                    <p className={cn(
                        "text-[1.3rem] font-bold italic truncate flex items-center gap-2",
                        latestLog.actionType === 'SCHEDULED' ? "text-text-muted opacity-60" : "text-foreground opacity-90"
                    )} title={latestLog.message}>
                        {latestLog.actionType === 'ACTIVITY' && <RefreshCcw size={12} className="animate-spin text-primary" />}
                        {latestLog.actionType === 'SCHEDULED' && <Clock size={12} className="opacity-50" />}
                        "{stepInfo?.cleanMessage || latestLog.message}"
                    </p>
                    {latestLog.actionType === 'ACTIVITY' && <MiniStepProgress message={latestLog.message} />}
                </div>
            </div>
        );
    };

    return (
        <div className={cn(
            "grid grid-cols-12 gap-4 px-6 py-5 rounded-[1.4rem] border transition-all duration-300 relative items-center group",
            isSuccess ? "bg-success/[0.03] border-success/20 hover:bg-success/[0.05]" :
                isPendingApproval ? "bg-yellow-500/[0.03] border-yellow-500/20 hover:bg-yellow-500/[0.05]" :
                    isSkipped ? "bg-orange-500/[0.03] border-orange-500/20 hover:bg-orange-500/[0.05]" :
                        isError ? "bg-error/[0.03] border-error/20 hover:bg-error/[0.05]" : "bg-surface-2/30 border-border/60 hover:bg-surface-2/50",
            isProcessing && "border-primary/40 shadow-glow-blue/5"
        )}>
            {/* Group Info */}
            <div className="col-span-4 flex items-center gap-4">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-sm text-white",
                    isSuccess ? "bg-success border-success" :
                        isPendingApproval ? "bg-yellow-500 border-yellow-500 shadow-glow-yellow" :
                            isSkipped ? "bg-orange-500 border-orange-500 shadow-glow-orange" :
                                isError ? "bg-error border-error" : "bg-surface-3 border-border text-text-muted"
                )}>
                    {isSuccess ? <CheckCircle2 size={16} /> : isPendingApproval ? <Clock size={16} /> : isSkipped ? <SkipForward size={16} /> : isError ? <AlertCircle size={16} /> : <Hash size={16} />}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-[1.4rem] font-black text-foreground truncate group-hover:text-primary transition-colors">{group.name || group.groupId}</span>
                    <span className="text-[1rem] font-mono font-bold text-text-muted opacity-50 tracking-tighter">UID: {group.groupId}</span>
                </div>
            </div>

            {/* Execution Content */}
            <div className="col-span-5">
                {renderContent()}
            </div>

            {/* Plan Badge */}
            <div className="col-span-3 flex justify-end">
                <div className={cn(
                    "px-5 py-2 rounded-xl flex items-center gap-3 border shadow-sm transition-all",
                    isSuccess ? "bg-success/10 border-success/20 text-success" :
                        isPendingApproval ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" :
                            isSkipped ? "bg-orange-500/10 border-orange-500/20 text-orange-500" :
                                isError ? "bg-error/10 border-error/20 text-error" : "bg-surface-3 border-border text-text-muted"
                )}>
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        isSuccess ? "bg-success shadow-glow-green" :
                            isPendingApproval ? "bg-yellow-500 shadow-glow-yellow" :
                                isSkipped ? "bg-orange-500 shadow-glow-orange" :
                                    isError ? "bg-error" : "bg-text-muted/40",
                        isProcessing && "bg-primary animate-ping shadow-glow-blue"
                    )} />
                    <span className="text-[1.1rem] font-black uppercase tracking-widest">
                        {isSuccess ? "Đã Xong" :
                            isPendingApproval ? "Chờ duyệt" :
                                isSkipped ? "Đã bỏ qua" :
                                    latestLog?.actionType === 'SCHEDULED' ? "Chờ chạy" :
                                        isError ? "Lỗi" :
                                            isProcessing ? "Đang chạy" : "Chờ lượt"}
                    </span>
                </div>
            </div>
        </div>
    );
};

const StatItemSummary = ({ color, label, value, showBorder }: { color: string; label: string; value: number; showBorder?: boolean }) => (
    <div className={cn("flex items-center gap-3 pr-6", showBorder && "border-r border-border mr-6")}>
        <div className={cn("w-2.5 h-2.5 rounded-full", color)} />
        <span className="text-[1.1rem] font-black text-foreground uppercase tracking-widest">{value} {label}</span>
    </div>
);

// --- Main Folderized Component ---

export function CampaignDetailsModal({ campaign, isOpen, onClose }: CampaignDetailsModalProps) {
    const { logs, targetGroups: fetchedGroups, fetchLogs } = useCampaigns();

    // 1. Sắp xếp danh sách nhóm
    const groupsToDisplay = useMemo(() => {
        const baseGroups = fetchedGroups?.length ? fetchedGroups : (campaign?.groups || []);
        return [...baseGroups].sort((a, b) => {
            const getScheduledTime = (id: string) => {
                const log = logs.find(l => l.targetId === id && l.actionType === 'SCHEDULED');
                return log ? new Date(log.executedAt).getTime() : 0;
            };
            return getScheduledTime(a.id) - getScheduledTime(b.id);
        });
    }, [fetchedGroups, campaign?.groups, logs]);

    // 2. Tính toán thống kê
    const stats = useMemo(() => {
        const defaultStats = { success: 0, pendingApproval: 0, skipped: 0, error: 0, pending: groupsToDisplay.length, isAllDone: false };
        if (!logs || !groupsToDisplay.length) return defaultStats;

        const successIds = new Set(logs.filter(l => l.actionType === 'COMPLETE').map(l => l.targetId));
        const pendingIds = new Set(logs.filter(l => l.actionType === 'PENDING').map(l => l.targetId));
        const skipIds = new Set(logs.filter(l => l.actionType === 'SKIP').map(l => l.targetId));
        const errorIds = new Set(logs.filter(l => l.actionType === 'ERROR').map(l => l.targetId));

        const counts = {
            success: groupsToDisplay.filter(g => successIds.has(g.id)).length,
            pendingApproval: groupsToDisplay.filter(g => pendingIds.has(g.id)).length,
            skipped: groupsToDisplay.filter(g => skipIds.has(g.id)).length,
            error: groupsToDisplay.filter(g => errorIds.has(g.id)).length,
        };

        const totalHandled = counts.success + counts.pendingApproval + counts.skipped + counts.error;
        return {
            ...counts,
            pending: Math.max(0, groupsToDisplay.length - totalHandled),
            isAllDone: groupsToDisplay.length > 0 && totalHandled >= groupsToDisplay.length
        };
    }, [logs, groupsToDisplay]);

    const isRunning = campaign?.status === 'PROCESSING' && !stats.isAllDone;

    // 3. Polling Effect cực kỳ quan trọng
    useEffect(() => {
        if (!isOpen || !campaign) return;

        // Luôn fetch ngay lập tức khi mở
        fetchLogs(campaign.id);

        if (campaign.status !== 'PROCESSING' || stats.isAllDone) return;

        const isAnyRobotWorking = logs.some(l => l.actionType === 'ACTIVITY');
        let timer: NodeJS.Timeout;
        let heartbeat: NodeJS.Timeout;

        if (isAnyRobotWorking) {
            // Nhịp poll nhanh khi đang chạy thực tế
            timer = setInterval(() => fetchLogs(campaign.id), 4000);
        } else {
            // Chế độ tiết kiệm tài nguyên khi đang chờ lịch
            const scheduled = logs.filter(l => l.actionType === 'SCHEDULED');
            const nextTime = scheduled.length ? Math.min(...scheduled.map(l => new Date(l.executedAt).getTime())) : 0;
            const waitTime = nextTime - Date.now();

            if (waitTime > 5000) {
                // Tỉnh dậy đúng lúc
                const wakeup = setTimeout(() => fetchLogs(campaign.id), Math.max(100, waitTime - 2000));
                // Nhịp đập hệ thống 30s
                heartbeat = setInterval(() => fetchLogs(campaign.id), 30000);
                return () => { clearTimeout(wakeup); clearInterval(heartbeat); };
            }
            timer = setInterval(() => fetchLogs(campaign.id), 4000);
        }

        return () => clearInterval(timer);
    }, [isOpen, campaign?.id, campaign?.status, stats.isAllDone, logs.some(l => l.actionType === 'ACTIVITY')]);

    if (!campaign) return null;
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            title={
                <div className="flex items-center gap-6 translate-y-3">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity" />
                        <div className="relative w-16 h-16 bg-surface-3 border border-border rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden">
                            <Activity size={28} className={cn("text-primary", isRunning && "animate-pulse")} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-4">
                            <h2 className="text-[2.8rem] text-foreground font-black tracking-tighter leading-none">{campaign.name}</h2>
                            <div className={cn("px-4 py-1.5 rounded-full text-[1rem] font-black uppercase tracking-[0.2em] border shadow-sm", isRunning ? "bg-primary text-white border-primary shadow-glow-blue" : "bg-success text-white border-success shadow-glow-green")}>
                                {isRunning ? "Đang xử lý robot" : "Đã hoàn tất"}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <p className="text-primary text-[1.1rem] font-black tracking-widest uppercase opacity-80">Kịch bản: {campaign.type}</p>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <p className="text-text-muted text-[1.1rem] font-bold opacity-50 uppercase tracking-widest italic">{groupsToDisplay.length} Nhóm mục tiêu</p>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col h-[65vh] pt-6 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-6 py-2 mb-2 bg-surface-2/50 rounded-xl border border-border/40">
                    <div className="col-span-4 text-[0.95rem] font-black text-text-muted uppercase tracking-[0.2em]">Thông tin nhóm</div>
                    <div className="col-span-5 text-[0.95rem] font-black text-text-muted uppercase tracking-[0.2em]">Thực thi & Tin nhắn </div>
                    <div className="col-span-3 text-right text-[0.95rem] font-black text-text-muted uppercase tracking-[0.2em]">Trạng thái</div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-3 space-y-2 pb-6">
                    {groupsToDisplay.map((group) => (
                        <CampaignGroupRow
                            key={group.id}
                            group={group}
                            groupLogs={logs.filter(l => l.targetId === group.id)}
                            campaignStatus={campaign.status}
                        />
                    ))}

                    {groupsToDisplay.length === 0 && (
                        <div className="py-20 border-2 border-dashed border-border rounded-[3rem] flex flex-col items-center justify-center text-text-muted/30">
                            <Hash size={48} className="opacity-20 mb-6" />
                            <p className="text-[1.4rem] font-black uppercase tracking-widest opacity-40">Danh sách mục tiêu trống</p>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end p-5 bg-surface-2 border border-border rounded-[2.5rem] mt-4">
                    <StatItemSummary color="bg-success shadow-glow-green" label="HOÀN TẤT" value={stats.success} showBorder />
                    <StatItemSummary color="bg-yellow-500 shadow-glow-yellow" label="CHỜ DUYỆT" value={stats.pendingApproval} showBorder />
                    <StatItemSummary color="bg-orange-500 shadow-glow-orange" label="BỎ QUA" value={stats.skipped} showBorder />
                    <StatItemSummary color="bg-error" label="LỖI" value={stats.error} showBorder />
                    <StatItemSummary color="bg-text-muted opacity-40" label="ĐANG CHỜ" value={stats.pending} />
                </div>
            </div>
        </Modal>
    );
}
