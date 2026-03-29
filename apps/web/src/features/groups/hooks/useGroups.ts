import { useState, useCallback } from 'react';
import axios from "@/lib/axios";
import { FbGroup } from "@/features/accounts/types";

export const useGroups = (accountId?: string) => {
  const [groups, setGroups] = useState<FbGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const response = await axios.get(`/fb-groups/account/${accountId}`);
      // Unwrapping: Extracting the .data array from the response object
      const data = response.data?.data || response.data;
      setGroups(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể lấy danh sách nhóm');
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  const syncGroups = async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      await axios.post(`/fb-groups/sync`, { accountId });
      // Thông báo cho user là job đã được đẩy vào queue
      return { success: true };
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lỗi khi yêu cầu đồng bộ');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    groups,
    loading,
    error,
    fetchGroups,
    syncGroups
  };
};
