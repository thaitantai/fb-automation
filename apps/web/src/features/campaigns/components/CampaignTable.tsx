"use client";

import React from "react";
import { Campaign, CampaignStatus } from "../types";
import { CampaignTableRow } from "./CampaignTableRow";
import { EmptyCampaignState } from "./EmptyCampaignState";
import { Loader2 } from "lucide-react";

interface CampaignTableProps {
    campaigns: Campaign[];
    loading: boolean;
    onRowClick: (campaign: Campaign) => void;
    onUpdateStatus: (id: string, status: CampaignStatus) => void;
    onDelete: (id: string) => void;
}

export function CampaignTable({ 
    campaigns, 
    loading, 
    onRowClick, 
    onUpdateStatus, 
    onDelete 
}: CampaignTableProps) {
    if (loading && campaigns.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-white/5 rounded-2xl bg-white/[0.01] shadow-xl">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <p className="text-zinc-500 text-sm font-medium mt-4">Đang điều phối các chiến dịch bài đăng...</p>
            </div>
        );
    }

    if (campaigns.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-white/5 rounded-2xl bg-white/[0.01] shadow-xl">
                <EmptyCampaignState />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto border border-white/5 rounded-2xl bg-white/[0.01] relative custom-scrollbar shadow-xl">
            <table className="w-full text-left border-collapse relative">
                <thead className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl z-[30]">
                    <tr className="border-b border-white/5">
                        <th className="px-6 py-5 ds-font-label opacity-40">Tên chiến dịch / Loại</th>
                        <th className="px-6 py-5 ds-font-label opacity-40">Mẫu bài viết</th>
                        <th className="px-6 py-5 ds-font-label opacity-40 text-center">Tình trạng</th>
                        <th className="px-6 py-5 ds-font-label opacity-40 text-center">Tài khoản & Nhóm</th>
                        <th className="px-6 py-5 ds-font-label opacity-40">Ngày tạo</th>
                        <th className="px-6 py-5 ds-font-label opacity-40 text-right">Lệnh</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                    {campaigns.map((campaign) => (
                        <CampaignTableRow
                            key={campaign.id}
                            campaign={campaign}
                            onRowClick={onRowClick}
                            onUpdateStatus={onUpdateStatus}
                            onDelete={onDelete}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
