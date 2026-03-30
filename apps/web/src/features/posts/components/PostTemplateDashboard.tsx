"use client";

import React, { useState, useMemo } from "react";
import { usePostTemplates } from "../hooks/usePostTemplates";
import { PostTemplate } from "../types";
import { TemplateSidebar } from "./TemplateSidebar";
import { TemplateEditor } from "./TemplateEditor";
import { SpintaxHelp } from "./SpintaxHelp";

export function PostTemplateDashboard() {
    const {
        templates,
        loading,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        bulkDelete
    } = usePostTemplates();

    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const { confirm } = useModal();

    // Form states
    const [name, setName] = useState("");
    const [content, setContent] = useState("");
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [newMediaUrl, setNewMediaUrl] = useState("");

    const filteredTemplates = useMemo(() =>
        templates.filter((t: PostTemplate) =>
            t.name.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [templates, searchTerm]
    );

    // Handle Template Change
    const handleSelectTemplate = (template: PostTemplate) => {
        setSelectedTemplateId(template.id);
        setName(template.name);
        setContent(template.contentSpintax);
        setMediaUrls(Array.isArray(template.mediaUrls) ? template.mediaUrls : []);
    };

    const resetForm = () => {
        setSelectedTemplateId(null);
        setName("");
        setContent("");
        setMediaUrls([]);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const payload = {
            name,
            contentSpintax: content,
            mediaUrls
        };

        if (selectedTemplateId) {
            await updateTemplate(selectedTemplateId, payload);
        } else {
            const result = await createTemplate(payload);
            if (result.success) setSelectedTemplateId(result.data.id);
        }
        setIsSaving(false);
    };

    const handleAddMedia = () => {
        if (newMediaUrl) {
            setMediaUrls(prev => [...prev, newMediaUrl]);
            setNewMediaUrl("");
        }
    };

    const handleRemoveMedia = (idx: number) => {
        setMediaUrls(prev => prev.filter((_, i) => i !== idx));
    };

    // Bulk Delete Handlers
    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredTemplates.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredTemplates.map(t => t.id));
        }
    };

    const handleBulkDelete = () => {
        confirm({
            title: "Xóa hàng loạt mẫu bài viết",
            description: `Bạn có chắc chắn muốn xóa ${selectedIds.length} mẫu đã chọn?`,
            type: "danger",
            onConfirm: async () => {
                const result = await bulkDelete(selectedIds);
                if (result.success) {
                    setSelectedIds([]);
                    if (selectedTemplateId && selectedIds.includes(selectedTemplateId)) {
                        resetForm();
                    }
                }
            }
        });
    };

    const handleDeleteSingle = () => {
        if (!selectedTemplateId) return;
        confirm({
            title: "Xóa mẫu bài viết",
            description: `Bạn có chắc chắn muốn xóa mẫu "${name}"?`,
            type: "danger",
            onConfirm: async () => {
                const result = await deleteTemplate(selectedTemplateId);
                if (result.success) resetForm();
            }
        });
    };

    return (
        <div className="flex h-full bg-[hsl(var(--ds-bg))] border border-border rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.6)] relative overflow-hidden">

            <TemplateSidebar
                templates={filteredTemplates}
                selectedTemplateId={selectedTemplateId}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={toggleSelectAll}
                onBulkDelete={handleBulkDelete}
                loading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onSelectTemplate={handleSelectTemplate}
                onReset={resetForm}
            />

            <TemplateEditor
                name={name}
                setName={setName}
                content={content}
                setContent={setContent}
                mediaUrls={mediaUrls}
                newMediaUrl={newMediaUrl}
                setNewMediaUrl={setNewMediaUrl}
                onAddMedia={handleAddMedia}
                onRemoveMedia={handleRemoveMedia}
                onSave={handleSave}
                onDelete={handleDeleteSingle}
                isSaving={isSaving}
                isEdit={!!selectedTemplateId}
            >
                <SpintaxHelp />
            </TemplateEditor>
        </div>
    );
}

import { useModal } from "@/providers/ModalProvider";
