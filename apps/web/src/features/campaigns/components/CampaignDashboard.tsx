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

    const handleRowClick = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setIsDetailsModalOpen(true);
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
                onCreateClick={() => setIsEditModalOpen(true)}
                loading={loading}
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
                onEdit={(campaign) => {
                    setIsDetailsModalOpen(false);
                    setIsEditModalOpen(true);
                }}
            />

            <CampaignTable
                campaigns={filteredCampaigns}
                loading={loading}
                onRowClick={handleRowClick}
                onUpdateStatus={updateCampaignStatus}
                onDelete={deleteCampaign}
            />
        </div>
    );
}

