"use client";

import React from "react";
import {
    Rocket, LayoutTemplate, Users, Component,
    ArrowRight, Calendar, Clock, Pause,
    Play, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Campaign, CampaignStatus } from "../types";
import { CampaignStatusBadge } from "./CampaignStatusBadge";

interface CampaignTableRowProps {
    campaign: Campaign;
    onRowClick: (campaign: Campaign) => void;
    onUpdateStatus: (id: string, status: CampaignStatus) => void;
    onDelete: (id: string) => void;
}

export function CampaignTableRow({
    campaign,
    onRowClick,
    onUpdateStatus,
    onDelete
}: CampaignTableRowProps) {
    return (
        <tr
            onClick={() => onRowClick(campaign)}
            className="hover:bg-white/[0.04] transition-all group/row cursor-pointer border-b border-white/[0.02]"
        >
            <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center border border-white/5 group-hover/row:border-blue-500/30 transition-all overflow-hidden relative">
                        <Rocket size={18} className="text-zinc-600 group-hover/row:text-blue-500 group-hover/row:scale-110 duration-300" />
                        {campaign.status === "PROCESSING" && (
                            <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="ds-font-body font-bold truncate max-w-[220px] group-hover/row:text-white transition-colors">
                            {campaign.name}
                        </span>
                        <span className="ds-font-subtitle font-black uppercase text-blue-500/80 mt-1">
                            {campaign.type || 'HÀNH ĐỘNG CƠ BẢN'}
                        </span>
                    </div>
                </div>
            </td>

            <td className="px-6 py-5">
                <div className="flex items-center gap-2.5 bg-white/[0.03] px-4 py-2 rounded-2xl border border-white/5 w-fit group-hover:bg-white/10 transition-all">
                    <LayoutTemplate size={14} className="text-amber-500" />
                    <span className="ds-font-subtitle font-bold text-zinc-300">
                        {campaign.template?.name || "Mẫu đã bị gỡ"}
                    </span>
                </div>
            </td>

            <td className="px-6 py-5">
                <div className="flex justify-center">
                    <CampaignStatusBadge status={campaign.status} />
                </div>
            </td>

            <td className="px-6 py-5">
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                            <Users size={10} /> {campaign.fbAccounts?.length || 0}
                        </div>
                        <ArrowRight size={10} className="text-zinc-700" />
                        <div className="flex items-center gap-1 text-[10px] text-pink-500 font-bold bg-pink-500/5 px-1.5 py-0.5 rounded border border-pink-500/10">
                            <Component size={10} /> {campaign.targetConfigs.groupIds.length}
                        </div>
                    </div>
                </div>
            </td>

            <td className="px-6 py-5">
                <div className="flex flex-col ds-font-subtitle font-semibold leading-relaxed">
                    <span className="flex items-center gap-2">
                        <Calendar size={12} className="opacity-30" />
                        {new Date(campaign.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-2 opacity-50">
                        <Clock size={12} className="opacity-30" />
                        {new Date(campaign.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </td>

            <td className="px-6 py-5 text-right">
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {campaign.status === "PROCESSING" ? (
                        <button
                            onClick={() => onUpdateStatus(campaign.id, "PAUSED")}
                            className="p-2.5 text-zinc-600 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
                            title="Tạm dừng chiến dịch"
                        >
                            <Pause size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={() => onUpdateStatus(campaign.id, "PROCESSING")}
                            className="p-2.5 text-zinc-600 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                            title="Bắt đầu ngay"
                        >
                            <Play size={18} />
                        </button>
                    )}

                    <button
                        onClick={() => onDelete(campaign.id)}
                        className="p-2.5 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Gỡ bỏ"
                        disabled={campaign.status === "PROCESSING"}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
}
