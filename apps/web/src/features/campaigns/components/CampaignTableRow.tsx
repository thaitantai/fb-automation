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
    campaign:       Campaign;
    isSelected:     boolean;
    onToggleSelect: () => void;
    onRowClick:     (campaign: Campaign) => void;
    onUpdateStatus: (id: string, status: CampaignStatus) => void;
    onOpenLogs?:    (campaign: Campaign) => void;
    onOpenSettings?:(campaign: Campaign) => void;
}

export function CampaignTableRow({
    campaign, isSelected, onToggleSelect,
    onRowClick, onUpdateStatus, onOpenLogs, onOpenSettings
}: CampaignTableRowProps) {
    const isProcessing = campaign.status === "PROCESSING";

    return (
        <tr className={cn("table-row group/row cursor-pointer", isSelected && "selected")}>
            {/* Actions column */}
            <td className="table-cell w-44" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                    {isProcessing ? (
                        <button
                            onClick={() => onUpdateStatus(campaign.id, "PAUSED")}
                            className="btn-icon p-2"
                            title="Tạm dừng"
                        >
                            <Pause size={15} className="text-amber-400" />
                        </button>
                    ) : (
                        <button
                            onClick={() => onUpdateStatus(campaign.id, "PROCESSING")}
                            className="btn-icon p-2"
                            title="Bắt đầu"
                        >
                            <Play size={15} className="text-blue-400" />
                        </button>
                    )}

                    <button
                        disabled={isProcessing}
                        onClick={() => onOpenSettings?.(campaign)}
                        className="btn-icon p-2 disabled:opacity-25"
                        title={isProcessing ? "Không thể cài đặt khi đang chạy" : "Cài đặt"}
                    >
                        <Settings2 size={15} />
                    </button>

                    <button
                        onClick={() => onOpenLogs?.(campaign)}
                        className="btn-icon p-2"
                        title="Xem nhật ký"
                    >
                        <ClipboardList size={15} />
                    </button>
                </div>
            </td>

            {/* Name */}
            <td className="table-cell" onClick={() => onRowClick(campaign)}>
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-colors",
                        isProcessing
                            ? "border-blue-500/30 bg-blue-500/10"
                            : "border-white/5 bg-surface-2"
                    )}>
                        <Rocket size={16} className={isProcessing ? "text-blue-400" : "text-muted"} />
                    </div>
                    <div>
                        <p className="font-semibold text-[14px] text-white truncate max-w-[200px]">{campaign.name}</p>
                        <p className="text-[11px] text-primary font-medium uppercase tracking-wider mt-0.5">
                            {campaign.type || 'AUTO_POST'}
                        </p>
                    </div>
                </div>
            </td>

            {/* Template */}
            <td className="table-cell">
                <div className="flex items-center gap-2">
                    <LayoutTemplate size={14} className="text-amber-400 shrink-0" />
                    <span className="text-[13px] text-secondary truncate max-w-[160px]">
                        {campaign.template?.name || "—"}
                    </span>
                </div>
            </td>

            {/* Status */}
            <td className="table-cell text-center">
                <CampaignStatusBadge status={campaign.status} />
            </td>

            {/* Accounts & Groups */}
            <td className="table-cell text-center">
                <div className="flex items-center justify-center gap-2">
                    <span className="badge-green gap-1">
                        <Users size={10} />
                        {campaign.fbAccounts?.length || 0}
                    </span>
                    <ArrowRight size={10} className="text-muted" />
                    <span className="badge-blue gap-1">
                        <Component size={10} />
                        {campaign.targetConfigs.groupIds.length}
                    </span>
                </div>
            </td>

            {/* Created At */}
            <td className="table-cell">
                <div className="text-[12px] text-secondary leading-relaxed">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-muted" />
                        {new Date(campaign.createdAt || Date.now()).toLocaleDateString("vi-VN")}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted mt-0.5">
                        <Clock size={11} />
                        {new Date(campaign.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                </div>
            </td>

            {/* Checkbox */}
            <td className="table-cell text-right" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onToggleSelect}
                    className="text-muted hover:text-blue-400 transition-colors p-1"
                >
                    {isSelected
                        ? <CheckSquare size={18} className="text-blue-400" />
                        : <Square size={18} />
                    }
                </button>
            </td>
        </tr>
    );
}
