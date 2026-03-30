"use client";

import { Search, Sparkles, Plus, FileText, Image as ImageIcon, Loader2, Trash2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostTemplate } from "../types";

interface TemplateSidebarProps {
    templates: PostTemplate[];
    selectedTemplateId: string | null;
    selectedIds: string[];
    onToggleSelect: (id: string) => void;
    onToggleSelectAll: () => void;
    onBulkDelete: () => void;
    loading: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onSelectTemplate: (template: PostTemplate) => void;
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
        <div className="w-[300px] border-r border-border bg-[hsl(var(--ds-sidebar))] flex flex-col h-full overflow-hidden">
            {/* Header Area - Clean & Minimal */}
            <div className="p-5 space-y-5 border-b border-white/[0.03]">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 group/search">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within/search:text-primary transition-colors" size={14} />
                        <input
                            placeholder="Tìm kiếm mẫu..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="ds-input pl-10"
                        />
                    </div>
                    <button
                        onClick={onReset}
                        className="w-11 h-11 shrink-0 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-2xl hover:bg-primary hover:text-white transition-all duration-300 shadow-lg shadow-primary/5 active:scale-90"
                        title="Tạo mẫu mới"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {/* Status & Bulk Actions Bar */}
                <div className="flex items-center justify-between px-1">
                    <button
                        onClick={onToggleSelectAll}
                        className="flex items-center gap-2.5 group cursor-pointer"
                    >
                        <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                            isAllSelected 
                                ? "bg-primary border-primary text-white scale-110" 
                                : "border-muted-foreground/20 group-hover:border-primary/50 bg-white/[0.02]"
                        )}>
                            {isAllSelected && <CheckCircle2 size={10} strokeWidth={3} />}
                        </div>
                        <span className="text-[1.1rem] font-bold tracking-widest text-muted-foreground group-hover:text-foreground transition-colors uppercase">
                            {isAllSelected ? "Bỏ chọn" : "Chọn tất cả"}
                        </span>
                    </button>

                    {selectedIds.length > 0 && (
                        <div className="flex items-center animate-in fade-in slide-in-from-right-2">
                             <button
                                onClick={onBulkDelete}
                                className="flex items-center gap-2 text-[1.1rem] font-bold text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-xl transition-all uppercase tracking-widest"
                            >
                                <Trash2 size={12} />
                                XÓA ({selectedIds.length})
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {loading && templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-primary opacity-40 gap-4">
                        <Loader2 className="animate-spin" size={24} strokeWidth={1.5} />
                        <span className="text-tiny font-bold uppercase tracking-[0.2em]">Đang đồng bộ...</span>
                    </div>
                ) : templates.map((template) => {
                    const isActive = selectedTemplateId === template.id;
                    const isSelected = selectedIds.includes(template.id);

                    return (
                        <div key={template.id} className="group relative flex items-center gap-2.5">
                            {/* Checkbox */}
                            <button
                                onClick={() => onToggleSelect(template.id)}
                                className={cn(
                                    "w-5 h-5 shrink-0 rounded-full border flex items-center justify-center transition-all ml-1 duration-300",
                                    isSelected
                                        ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-110"
                                        : "bg-white/[0.02] border-white/10 text-muted-foreground/0 hover:border-primary/50 hover:text-primary/50"
                                )}
                            >
                                <CheckCircle2 size={10} strokeWidth={3} />
                            </button>

                            <button
                                onClick={() => onSelectTemplate(template)}
                                className={cn(
                                    "flex-1 flex items-center gap-4 p-4 rounded-[2rem] transition-all border relative overflow-hidden",
                                    isActive
                                        ? "bg-white/[0.05] border-white/10 text-foreground shadow-2xl"
                                        : "bg-transparent border-transparent text-muted-foreground hover:bg-white/[0.02] hover:text-foreground"
                                )}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500",
                                    isActive
                                        ? "bg-primary text-primary-foreground border-primary/40 shadow-[0_0_20px_rgba(59,130,246,0.4)] rotate-3"
                                        : "bg-white/[0.03] border-white/5 text-muted-foreground group-hover/btn:border-primary/20"
                                )}>
                                    {template.contentSpintax.length > 0 ? <FileText size={20} /> : <ImageIcon size={20} />}
                                </div>
                                <div className="flex flex-col items-start min-w-0 flex-1">
                                    <span className="text-[1.5rem] font-bold truncate mb-0.5 tracking-tight group-hover:text-foreground transition-colors">
                                        {template.name}
                                    </span>
                                    <span className="text-[1.1rem] uppercase tracking-widest font-bold opacity-40">
                                        Nội dung mẫu
                                    </span>
                                </div>
                                
                                {isActive && (
                                    <div className="absolute right-4 w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-in fade-in zoom-in duration-500" />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
