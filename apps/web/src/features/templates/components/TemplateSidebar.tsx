"use client";

import { Search, Sparkles, Plus, FileText, Image as ImageIcon, Loader2, Trash2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Template } from "../types";

interface TemplateSidebarProps {
    templates: Template[];
    selectedTemplateId: string | null;
    selectedIds: string[];
    onToggleSelect: (id: string) => void;
    onToggleSelectAll: () => void;
    onBulkDelete: () => void;
    loading: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onSelectTemplate: (template: Template) => void;
    onReset: () => void;
}

export function TemplateSidebar({
    templates,
    selectedTemplateId,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    onBulkDelete,
    loading,
    searchTerm,
    onSearchChange,
    onSelectTemplate,
    onReset
}: TemplateSidebarProps) {
    const isAllSelected = templates.length > 0 && selectedIds.length === templates.length;

    return (
        <div className="w-[300px] border-r border-border bg-surface-raised/30 flex flex-col h-full overflow-hidden">
            {/* Header Area - Thanh tiêu đề gọn gàng */}
            <div className="p-6 space-y-6 border-b border-border-subtle bg-surface-2/10">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={14} />
                        <input
                            placeholder="Tìm mẫu..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="input h-[4rem] pl-11 shadow-sm text-[1.4rem]"
                        />
                    </div>
                    <button
                        onClick={onReset}
                        className="w-12 h-12 shrink-0 flex items-center justify-center bg-primary text-white rounded-2xl hover:bg-primary-hover transition-all shadow-glow-blue active:scale-90"
                        title="Tạo mới"
                    >
                        <Plus size={22} />
                    </button>
                </div>

                {/* Status & Bulk Actions Bar - Công cụ chọn hàng loạt */}
                <div className="flex items-center justify-between px-1">
                    <button
                        onClick={onToggleSelectAll}
                        className="flex items-center gap-3 group cursor-pointer"
                    >
                        <div className={cn(
                            "w-6 h-6 rounded-lg border flex items-center justify-center transition-all",
                            isAllSelected 
                                ? "bg-primary border-primary text-white shadow-glow-blue/20" 
                                : "border-border bg-surface-1 group-hover:border-primary/50"
                        )}>
                            {isAllSelected && <CheckCircle2 size={12} strokeWidth={3} />}
                        </div>
                        <span className="ds-font-label text-text-muted group-hover:text-foreground">
                            {isAllSelected ? "Hủy chọn" : "Chọn hết"}
                        </span>
                    </button>

                    {selectedIds.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-right-2">
                             <button
                                onClick={onBulkDelete}
                                className="badge-red py-2 px-3 gap-2 font-black uppercase text-[1.1rem]"
                            >
                                <Trash2 size={12} />
                                {selectedIds.length}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* List Area - Danh sách mẫu nội dụng */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-hide">
                {loading && templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-primary/40 gap-4">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="ds-font-label">Đang đồng bộ...</span>
                    </div>
                ) : templates.map((template) => {
                    const isActive = selectedTemplateId === template.id;
                    const isSelected = selectedIds.includes(template.id);

                    return (
                        <div key={template.id} className="group relative flex items-center gap-4">
                            {/* Checkbox */}
                            <button
                                onClick={() => onToggleSelect(template.id)}
                                className={cn(
                                    "w-6 h-6 shrink-0 rounded-lg border flex items-center justify-center transition-all duration-300",
                                    isSelected
                                        ? "bg-primary border-primary text-white shadow-glow-blue/20"
                                        : "bg-surface-2 border-border/40 text-transparent hover:border-primary/50 hover:text-primary/50"
                                )}
                            >
                                <CheckCircle2 size={12} strokeWidth={3} />
                            </button>

                            <button
                                onClick={() => onSelectTemplate(template)}
                                className={cn(
                                    "flex-1 flex items-center gap-4 p-4 rounded-[1.8rem] transition-all border relative overflow-hidden",
                                    isActive
                                        ? "bg-primary/5 border-primary/30 text-foreground shadow-sm"
                                        : "bg-transparent border-transparent text-text-muted hover:bg-surface-2/40 hover:text-foreground"
                                )}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500",
                                    isActive
                                        ? "bg-primary text-white border-primary/40 shadow-glow-blue/10 rotate-3"
                                        : "bg-surface-3 border-border text-text-muted group-hover:text-foreground"
                                )}>
                                    {template.contentSpintax.length > 0 ? <FileText size={20} /> : <ImageIcon size={20} />}
                                </div>
                                <div className="flex flex-col items-start min-w-0 flex-1">
                                    <span className={cn(
                                        "text-[1.4rem] font-bold truncate transition-colors",
                                        isActive ? "text-primary" : "text-foreground"
                                    )}>
                                        {template.name}
                                    </span>
                                    <span className="text-[1.1rem] uppercase tracking-tighter font-black text-text-muted opacity-60">
                                        Content Template
                                    </span>
                                </div>
                                
                                {isActive && (
                                    <div className="absolute right-4 w-1 h-6 bg-primary rounded-full shadow-glow-blue animate-in fade-in zoom-in" />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
