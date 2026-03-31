"use client";

import React, { useState } from "react";
import { useCampaigns } from "../hooks/useCampaigns";
import { Campaign } from "../types";
import { CreateCampaignModal } from "./CreateCampaignModal";
import { CampaignDetailsModal } from "./CampaignDetailsModal";
import { CampaignActionBar } from "./CampaignActionBar";
import { CampaignTable } from "./CampaignTable";

export function CampaignDashboard() {
    const { campaigns, loading, updateCampaignStatus, deleteCampaign, fetchCampaigns } = useCampaigns();
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleRowClick = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setIsDetailsModalOpen(true);
    };

    const handleOpenSettings = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setIsEditModalOpen(true);
    };

    const handleOpenLogs = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setIsDetailsModalOpen(true);
    };

    const handleDeleteBulk = async () => {
        if (!selectedIds.length) return;

        try {
            await Promise.all(selectedIds.map(id => deleteCampaign(id)));
            setSelectedIds([]);
            fetchCampaigns();
        } catch (error) {
            console.error("Lỗi khi xóa hàng loạt:", error);
        }
    };

    const filteredCampaigns = campaigns.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-transparent">
            <CampaignActionBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onRefresh={fetchCampaigns}
                onCreateClick={() => {
                    setSelectedCampaign(null);
                    setIsEditModalOpen(true);
                }}
                loading={loading}
                selectedCount={selectedIds.length}
                onDeleteBulk={handleDeleteBulk}
            />

            <CreateCampaignModal
                isOpen={isEditModalOpen}
                initialData={selectedCampaign}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCampaign(null);
                    fetchCampaigns();
                }}
            />

            <CampaignDetailsModal
                isOpen={isDetailsModalOpen}
                campaign={selectedCampaign}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedCampaign(null);
                }}
            />

            <CampaignTable
                campaigns={filteredCampaigns}
                loading={loading}
                selectedIds={selectedIds}
                onSelectedIdsChange={setSelectedIds}
                onRowClick={handleRowClick}
                onUpdateStatus={updateCampaignStatus}
                onOpenLogs={handleOpenLogs}
                onOpenSettings={handleOpenSettings}
            />
        </div>
    );
}
