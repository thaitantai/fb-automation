"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "@/lib/axios";
import { FbGroup, FbAccount } from "@/features/accounts/types";

export const useGroupsMaster = () => {
    const [accounts, setAccounts] = useState<FbAccount[]>([]);
    const [groups, setGroups] = useState<any[]>([]); // Sử dụng any[] vì có kèm thông tin fbAccount
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
    const [syncing, setSyncing] = useState(false);

    const fetchAccounts = useCallback(async () => {
        try {
            const response = await axios.get("/fb-accounts");
            const data = response.data?.data || response.data || [];
            setAccounts(Array.isArray(data) ? data : []);
        } catch (err) {}
    }, []);

    const fetchGroups = useCallback(async (accountIds: string[]) => {
        setLoading(true);
        try {
            const query = accountIds.length > 0 ? `?accountIds=${accountIds.join(",")}` : "";
            const response = await axios.get(`/fb-groups${query}`);
            const data = response?.data?.data ?? response?.data ?? response ?? [];
            setGroups(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || "Không thể tải danh sách nhóm");
            setGroups([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Khởi tạo lấy danh sách tài khoản
    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    // Tự động tải lại nhóm khi danh sách tài khoản thay đổi
    useEffect(() => {
        if (selectedAccountIds.length > 0) {
            fetchGroups(selectedAccountIds);
        } else {
             // If no account selected, we still might want all groups if it's the master dashboard
             // but for now, let's keep it selective or fetch all if none selected
             fetchGroups([]);
        }
    }, [selectedAccountIds, fetchGroups]);

    const toggleSelectAccount = (id: string | 'ALL', allIds: string[] = []) => {
        if (id === 'ALL') {
            const currentAllIds = accounts.map(a => a.id);
            setSelectedAccountIds(prev => prev.length === currentAllIds.length ? [] : [...currentAllIds]);
            return;
        }

        setSelectedAccountIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const syncBulk = async () => {
        if (selectedAccountIds.length === 0) return { success: false, error: "Chưa chọn tài khoản" };

        setSyncing(true);
        try {
            await axios.post("/fb-groups/sync-bulk", { accountIds: selectedAccountIds });
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.error || "Lỗi đồng bộ hàng loạt" };
        } finally {
            setSyncing(false);
        }
    };

    return {
        accounts,
        groups,
        loading,
        syncing,
        error,
        selectedAccountIds,
        toggleSelectAccount,
        fetchGroups: () => fetchGroups(selectedAccountIds),
        syncBulk
    };
};
