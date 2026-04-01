"use client";

import React, { useEffect, useMemo } from "react";
import {
    Activity, CheckCircle2,
    Clock, Hash, RefreshCcw, AlertCircle, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCampaigns } from "../hooks/useCampaigns";
import { Campaign } from "../types";
import { Modal } from "@/components/ui/Modal";

interface CampaignDetailsModalProps {
    campaign: (Campaign & { groups?: any[] }) | null;
    isOpen: boolean;
    onClose: () => void;
}

export function CampaignDetailsModal({ campaign, isOpen, onClose }: CampaignDetailsModalProps) {
    const { logs, targetGroups: fetchedGroups, fetchLogs } = useCampaigns();

    const groupsToDisplay = useMemo(() => {
        if (fetchedGroups && fetchedGroups.length > 0) return fetchedGroups;
        return campaign?.groups || [];
    }, [fetchedGroups, campaign?.groups]);

    useEffect(() => {
        if (isOpen && campaign) {
            fetchLogs(campaign.id);
            if (campaign.status === 'PROCESSING') {
                const interval = setInterval(() => fetchLogs(campaign.id), 5000);
                return () => clearInterval(interval);
            }
        }
    }, [isOpen, campaign, fetchLogs]);

    const stats = useMemo(() => {
        const successIds = new Set(logs.filter(l => l.actionType === 'AUTO_POST').map(l => l.targetId));
        const errorIds = new Set(logs.filter(l => l.actionType.includes('ERROR')).map(l => l.targetId));

        return {
            success: groupsToDisplay.filter(g => successIds.has(g.id)).length,
            error: groupsToDisplay.filter(g => errorIds.has(g.id)).length,
            pending: groupsToDisplay.filter(g => !successIds.has(g.id) && !errorIds.has(g.id)).length
        };
    }, [logs, groupsToDisplay]);

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
                            <Activity size={28} className={cn("text-primary", campaign.status === 'PROCESSING' && "animate-pulse")} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-4">
                            <h2 className="text-[2.8rem] text-foreground font-black tracking-tighter leading-none">{campaign.name}</h2>
                            <div className={cn(
                                "px-4 py-1.5 rounded-full text-[1rem] font-black uppercase tracking-[0.2em] border shadow-sm",
                                campaign.status === "PROCESSING"
                                    ? "bg-primary text-white border-primary shadow-glow-blue"
                                    : "bg-surface-2 text-text-muted border-border"
                            )}>
                                {campaign.status === 'PROCESSING' ? "Đang xử lý robot" : "Đã hoàn tất"}
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

                {/* List Headers Area */}
                <div className="grid grid-cols-12 gap-4 px-6 py-2 mb-2 bg-surface-2/50 rounded-xl border border-border/40">
                    <div className="col-span-4 text-[0.95rem] font-black text-text-muted uppercase tracking-[0.2em]">Thông tin nhóm</div>
                    <div className="col-span-5 text-[0.95rem] font-black text-text-muted uppercase tracking-[0.2em]">Trạng thái thực thi & Tin nhắn</div>
                    <div className="col-span-3 text-right text-[0.95rem] font-black text-text-muted uppercase tracking-[0.2em]">Kế hoạch</div>
                </div>

                {/* Scrollable Rows Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-3 space-y-2 pb-6">
                    {groupsToDisplay.map((group) => {
                        const groupLogs = logs.filter(l => l.targetId === group.id);
                        const latestLog = groupLogs[0]; // Log mới nhất của nhóm này
                        const isSuccess = groupLogs.some(l => l.actionType === 'AUTO_POST');
                        const isError = groupLogs.some(l => l.actionType.includes('ERROR'));
                        const isProcessing = !isSuccess && !isError && campaign.status === 'PROCESSING';

                        return (
                            <div
                                key={group.id}
                                className={cn(
                                    "grid grid-cols-12 gap-4 px-6 py-5 rounded-[1.4rem] border transition-all duration-300 relative items-center group",
                                    isSuccess
                                        ? "bg-success/[0.03] border-success/20 hover:bg-success/[0.05]"
                                        : isError
                                            ? "bg-error/[0.03] border-error/20 hover:bg-error/[0.05]"
                                            : "bg-surface-2/30 border-border/60 hover:bg-surface-2/50",
                                    isProcessing && "border-primary/40 shadow-glow-blue/5"
                                )}
                            >
                                {/* Group Info Column */}
                                <div className="col-span-4 flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-sm",
                                        isSuccess
                                            ? "bg-success text-white border-success"
                                            : isError
                                                ? "bg-error text-white border-error"
                                                : "bg-surface-3 border-border text-text-muted"
                                    )}>
                                        {isSuccess ? <CheckCircle2 size={16} /> : isError ? <AlertCircle size={16} /> : <Hash size={16} />}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[1.4rem] font-black text-foreground truncate group-hover:text-primary transition-colors">
                                            {group.name || group.groupId}
                                        </span>
                                        <span className="text-[1rem] font-mono font-bold text-text-muted opacity-50 tracking-tighter">
                                            UID: {group.groupId}
                                        </span>
                                    </div>
                                </div>

                                {/* Execution Status & Message Column */}
                                <div className="col-span-5">
                                    {latestLog ? (
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "text-[0.9rem] font-black px-2 py-0.5 rounded uppercase tracking-wider",
                                                    latestLog.actionType === 'AUTO_POST' ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
                                                )}>
                                                    {latestLog.actionType === 'AUTO_POST' ? "COMPLETED" : "ACTIVITY"}
                                                </span>
                                                <span className="text-[0.9rem] font-bold text-text-muted opacity-40">
                                                    {new Date(latestLog.executedAt).toLocaleTimeString("vi-VN")}
                                                </span>
                                            </div>
                                            <p className="text-[1.3rem] text-foreground font-medium italic opacity-80 truncate" title={latestLog.message}>
                                                "{latestLog.message}"
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 h-10 opacity-30">
                                            {isProcessing ? (
                                                <>
                                                    <RefreshCcw size={14} className="animate-spin text-primary" />
                                                    <span className="text-[1.1rem] font-black text-primary uppercase tracking-widest italic animate-pulse">Robot đang điều phối...</span>
                                                </>
                                            ) : (
                                                <span className="text-[1.1rem] font-black text-text-muted uppercase tracking-widest italic">--- Đang chờ lượt ---</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Plan Status Badge Column */}
                                <div className="col-span-3 flex justify-end">
                                    <div className={cn(
                                        "px-5 py-2 rounded-xl flex items-center gap-3 border shadow-sm transition-all",
                                        isSuccess
                                            ? "bg-success/10 border-success/20 text-success"
                                            : isError
                                                ? "bg-error/10 border-error/20 text-error"
                                                : "bg-surface-3 border-border text-text-muted"
                                    )}>
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            isSuccess ? "bg-success shadow-glow-green" : isError ? "bg-error" : "bg-text-muted/40",
                                            isProcessing && "bg-primary animate-ping shadow-glow-blue"
                                        )} />
                                        <span className="text-[1.1rem] font-black uppercase tracking-widest">
                                            {isSuccess ? "Đã Xong" : isError ? "Lỗi" : isProcessing ? "Đang chạy" : "Chờ thực thi"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {groupsToDisplay.length === 0 && (
                        <div className="py-20 border-2 border-dashed border-border rounded-[3rem] flex flex-col items-center justify-center text-text-muted/30">
                            <Hash size={48} className="mb-6 opacity-20" />
                            <p className="text-[1.4rem] font-black uppercase tracking-widest opacity-40">Danh sách nhóm mục tiêu trống</p>
                        </div>
                    )}
                </div>

                {/* Statistics Summary Bar - Minimalist */}
                <div className="flex items-center justify-end p-5 bg-surface-2 border border-border rounded-[2.5rem] mt-4">
                    <div className="flex items-center gap-3 pr-6 border-r border-border">
                        <div className="w-2.5 h-2.5 rounded-full bg-success shadow-glow-green" />
                        <span className="text-[1.1rem] font-black text-foreground uppercase tracking-widest">{stats.success} HOÀN TẤT</span>
                    </div>
                    <div className="flex items-center gap-3 pr-6 border-r border-border">
                        <div className="w-2.5 h-2.5 rounded-full bg-error" />
                        <span className="text-[1.1rem] font-black text-foreground uppercase tracking-widest">{stats.error} LỖI</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-text-muted opacity-40" />
                        <span className="text-[1.1rem] font-black text-text-muted uppercase tracking-widest">{stats.pending} ĐANG CHỜ</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
