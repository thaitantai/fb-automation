"use client";

import React from "react";
import {
    Rocket, LayoutTemplate, Users, Component,
    ArrowRight, Calendar, Clock, Pause,
    Play, Settings2, ClipboardList, CheckSquare, Square
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Campaign, CampaignStatus } from "../types";
import { CampaignStatusBadge } from "./CampaignStatusBadge";

interface CampaignTableRowProps {
    campaign: Campaign;
    isSelected: boolean;
    onToggleSelect: () => void;
    onRowClick: (campaign: Campaign) => void;
    onUpdateStatus: (id: string, status: CampaignStatus) => void;
    onOpenLogs?: (campaign: Campaign) => void;
    onOpenSettings?: (campaign: Campaign) => void;
}

export function CampaignTableRow({
    campaign, isSelected, onToggleSelect,
    onRowClick, onUpdateStatus, onOpenLogs, onOpenSettings
}: CampaignTableRowProps) {
    const isProcessing = campaign.status === "PROCESSING";

    return (
        <tr className={cn("table-row group/row cursor-pointer transition-all", isSelected && "bg-primary/5")}>
            {/* Actions column - Thao tác */}
            <td className="table-cell w-48" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                    {isProcessing ? (
                        <button
                            onClick={() => onUpdateStatus(campaign.id, "PAUSED")}
                            className="btn-secondary h-[3.4rem] px-3 text-warning border-warning/10 hover:bg-warning/10"
                            title="Tạm dừng chiến dịch"
                        >
                            <Pause size={14} className="fill-current" />
                        </button>
                    ) : (
                        <button
                            onClick={() => onUpdateStatus(campaign.id, "PROCESSING")}
                            className="btn-secondary h-[3.4rem] px-3 text-primary border-primary/10 hover:bg-primary/10"
                            title="Bắt đầu thực thi"
                        >
                            <Play size={14} className="fill-current" />
                        </button>
                    )}

                    <button
                        disabled={isProcessing}
                        onClick={() => onOpenSettings?.(campaign)}
                        className="btn-secondary h-[3.4rem] px-3 text-text-muted hover:text-foreground disabled:opacity-30"
                        title={isProcessing ? "Không thể cài đặt khi đang chạy" : "Cấu hình"}
                    >
                        <Settings2 size={15} />
                    </button>

                    <button
                        onClick={() => onOpenLogs?.(campaign)}
                        className="btn-secondary h-[3.4rem] px-3 text-text-muted hover:text-foreground"
                        title="Xem chi tiết nhật ký"
                    >
                        <ClipboardList size={15} />
                    </button>
                </div>
            </td>

            {/* Name - Tên chiến dịch ví dụ */}
            <td className="table-cell min-w-[200px]" onClick={() => onRowClick(campaign)}>
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center border transition-all shadow-sm",
                        isProcessing
                            ? "border-primary/30 bg-primary/10 text-primary shadow-glow-blue"
                            : "border-border bg-surface-2 text-text-muted"
                    )}>
                        <Rocket size={18} />
                    </div>
                    <div>
                        <p className="font-bold text-[14px] text-foreground group-hover/row:text-primary transition-colors truncate max-w-[220px]">
                            {campaign.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="ds-font-label text-primary bg-primary/5 px-2 py-0.5 rounded text-[10px]">
                                {campaign.type || 'AUTO_POST'}
                            </span>
                        </div>
                    </div>
                </div>
            </td>

            {/* Template - Mẫu nội dung */}
            <td className="table-cell">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-warning/70 border border-border-subtle">
                        <LayoutTemplate size={14} />
                    </div>
                    <span className="text-[16px] text-text-secondary font-medium truncate max-w-[150px]">
                        {campaign.template?.name || "Chưa chọn mẫu"}
                    </span>
                </div>
            </td>

            {/* Status - Trạng thái */}
            <td className="table-cell">
                <div className="flex justify-center">
                    <CampaignStatusBadge status={campaign.status} />
                </div>
            </td>

            {/* Accounts & Groups - Tài nguyên */}
            <td className="table-cell">
                <div className="flex items-center justify-center gap-3">
                    <div className="badge-green h-8 px-2.5 gap-1.5 font-bold">
                        <Users size={12} />
                        {campaign.fbAccounts?.length || 0}
                    </div>
                    <ArrowRight size={10} className="text-text-muted opacity-40" />
                    <div className="badge-blue h-8 px-2.5 gap-1.5 font-bold">
                        <Component size={12} />
                        {campaign.targetConfigs.groupIds.length}
                    </div>
                </div>
            </td>

            {/* Created At - Thời gian tạo */}
            <td className="table-cell">
                <div className="text-[12px] text-text-secondary leading-tight space-y-1">
                    <div className="flex items-center gap-1.5 font-medium">
                        <Calendar size={12} className="text-text-muted" />
                        {new Date(campaign.createdAt || Date.now()).toLocaleDateString("vi-VN")}
                    </div>
                    <div className="flex items-center gap-1.5 text-text-muted/70 font-bold uppercase tracking-tighter">
                        <Clock size={12} />
                        {new Date(campaign.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                </div>
            </td>

            {/* Checkbox - Lựa chọn */}
            <td className="table-cell text-right" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onToggleSelect}
                    className="p-2 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-all"
                >
                    {isSelected
                        ? <CheckSquare size={20} className="text-primary" />
                        : <Square size={20} className="opacity-40" />
                    }
                </button>
            </td>
        </tr>
    );
}
