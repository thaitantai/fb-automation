import { useState, useEffect, useCallback } from "react";
import axios from "@/lib/axios";
import { Campaign, CreateCampaignInput, CampaignStatus } from "../types";

export const useCampaigns = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get("/campaigns");
            const data = response.data?.data || response.data;
            setCampaigns(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể tải danh sách chiến dịch.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchLogs = useCallback(async (id: string) => {
        try {
            const response = await axios.get(`/campaigns/${id}/logs`);
            const data = response?.data || [];
            setLogs(data);
            return data;
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
        console.log("UPDATE: ", id);

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

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    return {
        campaigns,
        logs,
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
