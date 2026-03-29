import { useState, useEffect, useCallback } from "react";
import axios from "@/lib/axios";
import { PostTemplate, CreatePostTemplateInput } from "../types";

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
            setError(err.response?.data?.message || "Không thể tải danh sách mẫu bài viết.");
        } finally {
            setLoading(false);
        }
    }, []);

    const createTemplate = async (input: CreatePostTemplateInput) => {
        try {
            const response = await axios.post("/post-templates", input);
            const newTemplate = response.data?.data || response.data;
            setTemplates(prev => [...prev, newTemplate]);
            return { success: true, data: newTemplate };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || "Lỗi khi tạo mẫu bài viết." };
        }
    };

    const updateTemplate = async (id: string, input: Partial<CreatePostTemplateInput>) => {
        try {
            await axios.patch(`/post-templates/${id}`, input);
            setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...input } : t));
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || "Lỗi khi cập nhật bài viết." };
        }
    };

    const deleteTemplate = async (id: string) => {
        try {
            await axios.delete(`/post-templates/${id}`);
            setTemplates(prev => prev.filter(t => t.id !== id));
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || "Lỗi khi xóa mẫu bài viết." };
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
        deleteTemplate
    };
};
