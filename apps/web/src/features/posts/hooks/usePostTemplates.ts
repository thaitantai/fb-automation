import { useState, useEffect, useCallback } from "react";
import axios from "@/lib/axios";
import { PostTemplate, CreatePostTemplateInput } from "../types";
import { toast } from "sonner";

export const usePostTemplates = () => {
    const [templates, setTemplates] = useState<PostTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get("/post-templates");
            const data = response.data?.data || response.data;
            setTemplates(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Không thể tải danh sách mẫu bài viết.";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    const createTemplate = async (input: CreatePostTemplateInput) => {
        try {
            const response = await axios.post("/post-templates", input);
            const newTemplate = response.data?.data || response.data;
            setTemplates(prev => [...prev, newTemplate]);
            toast.success("Đã tạo mẫu bài viết mới thành công.");
            return { success: true, data: newTemplate };
        } catch (err: any) {
            const msg = err.response?.data?.message || "Lỗi khi tạo mẫu bài viết.";
            toast.error(msg);
            return { success: false, error: msg };
        }
    };

    const updateTemplate = async (id: string, input: Partial<CreatePostTemplateInput>) => {
        try {
            await axios.patch(`/post-templates/${id}`, input);
            setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...input } : t));
            toast.success("Cập nhật mẫu bài viết thành công.");
            return { success: true };
        } catch (err: any) {
            const msg = err?.message || "Lỗi khi cập nhật bài viết.";
            toast.error(msg);
            return { success: false, error: msg };
        }
    };

    const deleteTemplate = async (id: string) => {
        try {
            await axios.delete(`/post-templates/${id}`);
            setTemplates(prev => prev.filter(t => t.id !== id));
            toast.success("Đã xóa mẫu bài viết thành công.");
            return { success: true };
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Lỗi khi xóa mẫu bài viết.";
            toast.error(msg);
            return { success: false, error: msg };
        }
    };

    const bulkDelete = async (ids: string[]) => {
        try {
            await axios.post("/post-templates/bulk-delete", { ids });
            setTemplates(prev => prev.filter(t => !ids.includes(t.id)));
            toast.success(`Đã xóa thành công ${ids.length} mẫu.`);
            return { success: true };
        } catch (err: any) {
            const msg = err.response?.data?.message || "Lỗi khi xóa hàng loạt mẫu bài viết.";
            toast.error(msg);
            return { success: false, error: msg };
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    return {
        templates,
        loading,
        error,
        fetchTemplates,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        bulkDelete
    };
};
