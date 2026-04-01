import { useState, useEffect, useCallback } from "react";
import axios from "@/lib/axios";
import { Campaign, CreateCampaignInput, CampaignStatus } from "../types";

export const useCampaigns = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [targetGroups, setTargetGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCampaigns = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const response = await axios.get("/campaigns");
            const data = response.data?.data || response.data;
            setCampaigns(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể tải danh sách chiến dịch.");
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    const fetchLogs = useCallback(async (id: string) => {
        try {
            const response = await axios.get(`/campaigns/${id}/logs`);
            const payload = response.data?.data || {};
            
            if (payload.logs && payload.groups) {
                setLogs(payload.logs);
                setTargetGroups(payload.groups);
                return payload.logs;
            } else {
                const data = Array.isArray(payload) ? payload : [];
                setLogs(data);
                return data;
            }
        } catch (err: any) {
            return [];
        }
    }, []);

    const createCampaign = async (input: CreateCampaignInput) => {
        try {
            const response = await axios.post("/campaigns", input);
            const newCampaign = response.data?.data || response.data;
            setCampaigns(prev => [newCampaign, ...prev]);
            return { success: true, data: newCampaign };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || "Lỗi khi tạo chiến dịch." };
        }
    };

    const updateCampaignStatus = async (id: string, status: CampaignStatus) => {
        try {
            await axios.patch(`/campaigns/${id}/status`, { status });
            setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status } : c));
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || "Lỗi khi cập nhật trạng thái." };
        }
    };

    const updateCampaign = async (id: string, input: Partial<CreateCampaignInput>) => {
        try {
            const response = await axios.patch(`/campaigns/${id}`, input);
            fetchCampaigns();
            return { success: true, data: response.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || "Lỗi cập nhật chiến dịch" };
        }
    };

    const deleteCampaign = async (id: string) => {
        try {
            await axios.delete(`/campaigns/${id}`);
            setCampaigns(prev => prev.filter(c => c.id !== id));
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || "Lỗi khi xóa chiến dịch." };
        }
    };

    // Removed automatic useEffect from hook to prevent render conflicts.
    // Call fetchCampaigns explicitly in the dashboard or parent component.

    // Polling logic: Refresh campaigns every 10s if any are in PROCESSING status
    useEffect(() => {
        const hasProcessing = campaigns.some(c => c.status === "PROCESSING");
        if (!hasProcessing) return;

        const interval = setInterval(() => {
            fetchCampaigns(true);
        }, 10000);

        return () => clearInterval(interval);
    }, [campaigns, fetchCampaigns]);

    return {
        campaigns,
        logs,
        targetGroups,
        loading,
        error,
        fetchCampaigns,
        fetchLogs,
        createCampaign,
        updateCampaign,
        updateCampaignStatus,
        deleteCampaign
    };
};
