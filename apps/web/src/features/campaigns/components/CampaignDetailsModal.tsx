"use client";

import React, { useEffect, useState } from "react";
import {
    Activity, CheckCircle2, AlertCircle,
    Clock, User, Hash, RefreshCcw, Layout
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCampaigns } from "../hooks/useCampaigns";
import { Campaign } from "../types";
import { Modal } from "@/components/ui/Modal";

interface CampaignDetailsModalProps {
    campaign: Campaign | null;
    isOpen: boolean;
    onClose: () => void;
}

export function CampaignDetailsModal({ campaign, isOpen, onClose }: CampaignDetailsModalProps) {
    const { logs, fetchLogs, loading } = useCampaigns();
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (isOpen && campaign) {
            fetchLogs(campaign.id);
        }
    }, [isOpen, campaign, fetchLogs]);

    const handleRefresh = async () => {
        if (!campaign) return;
        setIsRefreshing(true);
        await fetchLogs(campaign.id);
        setIsRefreshing(false);
    };

    if (!campaign) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            title={
                <div className="flex items-center gap-5 translate-y-2">
                    <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-lg">
                        <Activity size={24} className="text-blue-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-black text-white tracking-tight">{campaign.name}</h3>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                campaign.status === "PROCESSING" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-zinc-500/10 text-zinc-500 border-white/5"
                            )}>
                                {campaign.status}
                            </span>
                        </div>
                        <p className="text-zinc-500 text-xs font-medium mt-1">ID Hệ thống: {campaign.id}</p>
                    </div>
                </div>
            }
            description={
                <div className="flex items-center gap-3 mt-4">
                    <button
                        onClick={handleRefresh}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-400 rounded-xl border border-white/5 transition-all outline-none",
                            isRefreshing && "animate-spin"
                        )}
                    >
                        <RefreshCcw size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Làm mới báo cáo</span>
                    </button>
                    {loading && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                </div>
            }
            footer={
                <div className="flex items-center justify-end gap-4 w-full">
                    <button onClick={onClose} className="px-10 py-3.5 bg-white text-black hover:bg-zinc-200 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95">
                        Đóng Dashboard
                    </button>
                </div>
            }
        >
            {/* Content Area */}
            <div className="flex overflow-hidden gap-8 h-[60vh]">

                {/* Left: Campaign Summary */}
                <div className="w-1/3 flex flex-col gap-6">
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-5">
                        <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Cấu hình kịch bản</h4>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-zinc-400">
                                <Layout size={16} />
                                <span className="text-xs font-bold">Mẫu bài viết</span>
                            </div>
                            <span className="text-xs text-white font-black truncate max-w-[120px]">
                                {campaign.templateId ? "Sẵn sàng" : "Chưa chọn"}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-zinc-400">
                                <User size={16} />
                                <span className="text-xs font-bold">Tài khoản</span>
                            </div>
                            <span className="text-xs text-white font-black">{campaign.fbAccounts?.length || 0}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-zinc-400">
                                <Hash size={16} />
                                <span className="text-xs font-bold">Nhóm đích</span>
                            </div>
                            <span className="text-xs text-white font-black">{(campaign.targetConfigs as any)?.groupIds?.length || 0}</span>
                        </div>
                    </div>

                    {/* Status Card (Example) */}
                    <div className="p-6 bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10 rounded-3xl">
                        <div className="flex items-center gap-3 text-emerald-500 mb-2">
                            <CheckCircle2 size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Tiến độ</span>
                        </div>
                        <div className="text-3xl font-black text-white">
                            {logs.filter(l => l.actionType === 'AUTO_POST').length}
                            <span className="text-zinc-600 text-lg"> / {(campaign.targetConfigs as any)?.groupIds?.length || 0}</span>
                        </div>
                        <p className="text-emerald-500/50 text-[10px] font-bold mt-2 uppercase tracking-tighter">Bài đăng thành công</p>
                    </div>
                </div>

                {/* Right: Live Execution Logs */}
                <div className="flex-1 flex flex-col border border-white/5 bg-white/[0.01] rounded-[32px] overflow-hidden">
                    <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-2">Báo cáo thời gian thực</h4>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-700 opacity-50 space-y-3">
                                <Clock size={32} />
                                <p className="text-xs italic font-bold">Đang chờ Robot thực thi những dòng đầu tiên...</p>
                            </div>
                        ) : logs.map((log) => (
                            <div
                                key={log.id}
                                className={cn(
                                    "p-4 rounded-2xl border flex items-center justify-between transition-all group hover:scale-[1.01]",
                                    log.actionType === 'AUTO_POST'
                                        ? "bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10"
                                        : "bg-red-500/5 border-red-500/10 hover:bg-red-500/10"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner",
                                        log.actionType === 'AUTO_POST' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                    )}>
                                        {log.actionType === 'AUTO_POST' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-white leading-tight">{log.message}</p>
                                        <div className="flex items-center gap-2 mt-1.2">
                                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">Tài khoản: {log.fbAccount?.username}</span>
                                            <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">{new Date(log.executedAt).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Clock size={14} className="text-zinc-700" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
