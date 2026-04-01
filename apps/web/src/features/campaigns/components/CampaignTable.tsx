"use client";

import React from "react";
import { Campaign, CampaignStatus } from "../types";
import { CampaignTableRow } from "./CampaignTableRow";
import { EmptyCampaignState } from "./EmptyCampaignState";
import { Loader2, CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface CampaignTableProps {
    campaigns: Campaign[];
    loading: boolean;
    selectedIds: string[];
    onSelectedIdsChange: (ids: string[]) => void;
    onRowClick: (campaign: Campaign) => void;
    onUpdateStatus: (id: string, status: CampaignStatus) => void;
    onOpenLogs?: (campaign: Campaign) => void;
    onOpenSettings?: (campaign: Campaign) => void;
}

const HEADERS = [
    { label: "Thao tác", align: "left" },
    { label: "Tên chiến dịch", align: "left" },
    { label: "Mẫu nội dung", align: "left" },
    { label: "Trạng thái", align: "center" },
    { label: "Acc / Nhóm", align: "center" },
    { label: "Ngày tạo", align: "left" },
    { label: "", align: "right" }   // checkbox
];

export function CampaignTable({
    campaigns, loading, selectedIds, onSelectedIdsChange,
    onRowClick, onUpdateStatus, onOpenLogs, onOpenSettings
}: CampaignTableProps) {
    const isAllSelected = campaigns.length > 0 && selectedIds.length === campaigns.length;

    const toggleAll = () => isAllSelected
        ? onSelectedIdsChange([])
        : onSelectedIdsChange(campaigns.map(c => c.id));

    const toggleOne = (id: string) => {
        const next = selectedIds.includes(id)
            ? selectedIds.filter(i => i !== id)
            : [...selectedIds, id];
        onSelectedIdsChange(next);
    };

    if (loading && campaigns.length === 0) {
        return (
            <div className="table-container flex-1 flex flex-col items-center justify-center min-h-[380px]">
                <Loader2 className="animate-spin text-primary mb-4" size={28} />
                <p className="text-secondary text-[14px]">Đang tải dữ liệu chiến dịch...</p>
            </div>
        );
    }

    if (campaigns.length === 0) {
        return (
            <div className="table-container flex-1 flex flex-col items-center justify-center min-h-[380px]">
                <EmptyCampaignState />
            </div>
        );
    }

    return (
        <div className="table-container flex-1 overflow-auto bg-surface-raised/10">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-surface-2 border-b border-border">
                        {HEADERS.map((h, i) => (
                            <th key={i} className={cn("table-header-cell", h.align === 'center' && "text-center", h.align === 'right' && "text-right")}>
                                {i === HEADERS.length - 1 ? (
                                    /* Select all checkbox - Toàn chọn */
                                    <button
                                        onClick={toggleAll}
                                        className="text-text-muted hover:text-primary transition-all p-2 rounded-lg hover:bg-primary/10"
                                    >
                                        {isAllSelected
                                            ? <CheckSquare size={18} className="text-primary" />
                                            : <Square size={18} className="opacity-40" />
                                        }
                                    </button>
                                ) : (
                                    <span className="ds-font-label text-text-muted">
                                        {h.label}
                                    </span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                    {campaigns.map(campaign => (
                        <CampaignTableRow
                            key={campaign.id}
                            campaign={campaign}
                            isSelected={selectedIds.includes(campaign.id)}
                            onToggleSelect={() => toggleOne(campaign.id)}
                            onRowClick={onRowClick}
                            onUpdateStatus={onUpdateStatus}
                            onOpenLogs={onOpenLogs}
                            onOpenSettings={onOpenSettings}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
