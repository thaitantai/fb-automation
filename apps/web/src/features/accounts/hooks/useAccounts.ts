import { useState, useEffect, useCallback, useRef } from "react";
import axios from "@/lib/axios";
import { FbAccount, NewAccountInput } from "../types";

export const useAccounts = () => {
    const [accounts, setAccounts] = useState<FbAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const fetchAccounts = useCallback(async () => {
        try {
            const response = await axios.get("/fb-accounts");
            setAccounts(response.data || []);
        } catch (error) {
            console.error("Fetch accounts error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect để tự động fetch lần đầu
    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    // [Auto Polling] 
    // Nếu có tài khoản đang ở trạng thái 'CONNECTING', tự động làm mới mỗi 5 giây
    useEffect(() => {
        const hasConnecting = accounts.some(acc => acc.status === 'CONNECTING');

        if (hasConnecting) {
            if (!pollingRef.current) {
                console.log("[useAccounts] Bắt đầu polling vì có tài khoản đang kết nối...");
                pollingRef.current = setInterval(() => {
                    fetchAccounts();
                }, 5000);
            }
        } else {
            if (pollingRef.current) {
                console.log("[useAccounts] Dừng polling.");
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        }

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [accounts, fetchAccounts]);

    const addAccount = async (data: NewAccountInput) => {
        setSubmitting(true);
        try {
            await axios.post("/fb-accounts", data);
            // Refresh ngay lập tức để thấy trạng thái 'CONNECTING'
            await fetchAccounts();
            return { success: true };
        } catch (error: any) {
            const message = error.response?.data?.message || "Lỗi khi gửi yêu cầu kết nối";
            return { success: false, error: message };
        } finally {
            setSubmitting(false);
        }
    };

    const deleteAccount = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này không?")) return;
        try {
            await axios.delete(`/fb-accounts/${id}`);
            setAccounts(prev => prev.filter(a => a.id !== id));
            return { success: true };
        } catch (error) {
            alert("Lỗi khi xóa tài khoản");
            return { success: false };
        }
    };

    const bulkDelete = async (ids: string[]) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa ${ids.length} tài khoản này không?`)) return;
        try {
            await axios.post("/fb-accounts/bulk-delete", { ids });
            setAccounts(prev => prev.filter(a => !ids.includes(a.id)));
            return { success: true };
        } catch (error) {
            alert("Lỗi khi xóa tài khoản hàng loạt");
            return { success: false };
        }
    };

    const connectAccount = async (id: string) => {
        try {
            // Logic kết nối: Ở đây có thể là chuyển status sang CONNECTING 
            // hoăc gọi API yêu cầu login lại
            console.log("Connecting account:", id);
            await axios.post(`/fb-accounts/${id}/reconnect`);
            await fetchAccounts();
        } catch (error) {
            console.error("Connect error:", error);
        }
    };

    const disconnectAccount = async (id: string) => {
        try {
            // Logic ngắt kết nối
            console.log("Disconnecting account:", id);
            await axios.post(`/fb-accounts/${id}/disconnect`);
            await fetchAccounts();
        } catch (error) {
            console.error("Disconnect error:", error);
        }
    };

    return {
        accounts,
        loading,
        submitting,
        fetchAccounts,
        addAccount,
        deleteAccount,
        bulkDelete,
        connectAccount,
        disconnectAccount
    };
};
