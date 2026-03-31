"use client";

import React from "react";
import {
    Sparkles, Trash2, Save, RefreshCcw,
    Type, Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateEditorProps {
    name: string;
    setName: (value: string) => void;
    content: string;
    setContent: (value: string) => void;
    mediaUrls: string[];
    newMediaUrl: string;
    setNewMediaUrl: (value: string) => void;
    onAddMedia: () => void;
    onRemoveMedia: (index: number) => void;
    onSave: () => void;
    onDelete?: () => void;
    isSaving: boolean;
    isEdit: boolean;
    children?: React.ReactNode; // For SpintaxHelp
}

export function TemplateEditor({
    name,
    setName,
    content,
    setContent,
    mediaUrls,
    newMediaUrl,
    setNewMediaUrl,
    onAddMedia,
    onRemoveMedia,
    onSave,
    onDelete,
    isSaving,
    isEdit,
    children
}: TemplateEditorProps) {
    return (
        <div className="flex-1 flex flex-col min-w-0 bg-[hsl(var(--ds-workspace))]">
            {/* Header */}
            <div className="ds-header flex items-center justify-between px-10 py-7">
                <div className="flex items-center gap-6 flex-1">
                    <div className="ds-icon-box w-14 h-14 rounded-2xl shadow-2xl">
                        <Sparkles size={24} />
                    </div>
                    <div className="space-y-1 flex-1 max-w-xl">
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Tiêu đề mẫu bài viết..."
                            className="bg-transparent border-none outline-none text-foreground ds-font-title focus:ring-0 placeholder:text-muted-foreground/20 w-full"
                        />
                        <div className="flex items-center gap-4">
                            <span className="ds-font-subtitle">Thiết lập nội dung bài viết mẫu</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isEdit && onDelete && (
                        <button
                            onClick={onDelete}
                            className="w-11 h-11 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all border border-border"
                            title="Xóa mẫu"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                    <button
                        disabled={isSaving || !name || !content}
                        onClick={onSave}
                        className="flex items-center gap-2.5 px-8 py-3.5 bg-foreground text-background rounded-2xl text-sm font-bold hover:bg-white transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
                        {isEdit ? "CẬP NHẬT MẪU" : "LƯU MẪU MỚI"}
                    </button>
                </div>
            </div>

            {/* Workspace Split */}
            <div className="flex-1 flex overflow-hidden p-10 gap-10">
                {/* Writing Column (70%) */}
                <div className="flex-[7] flex flex-col space-y-4">
                    <label className="ds-font-label px-1 flex items-center gap-2">
                        <Type size={14} className="text-primary" /> Nội dung bài đăng (Spintax)
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Nhập nội dung {Chào|Hi}..."
                        className="flex-1 bg-white/[0.02] border border-border rounded-2xl p-8 text-foreground text-base font-medium leading-relaxed focus:bg-white/[0.04] focus:border-primary/20 transition-all outline-none resize-none shadow-inner placeholder:text-muted-foreground/10"
                    />
                </div>

                {/* Utils Column (30%) */}
                <div className="flex-[3] flex flex-col space-y-10">
                    <div className="space-y-6">
                        <label className="ds-font-label px-1 flex items-center gap-2">
                            <ImageIcon size={14} className="text-primary" /> Thư viện truyền thông
                        </label>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    value={newMediaUrl}
                                    onChange={(e) => setNewMediaUrl(e.target.value)}
                                    placeholder="Https://..."
                                    className="ds-input flex-1 px-4 py-3"
                                />
                                <button
                                    onClick={onAddMedia}
                                    className="px-5 py-3 bg-white/[0.05] text-foreground hover:bg-foreground hover:text-background rounded-2xl text-tiny font-bold transition-all border border-border active:scale-95"
                                >
                                    THÊM
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 max-h-56 overflow-y-auto custom-scrollbar p-1">
                                {mediaUrls.map((url, idx) => (
                                    <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border border-border bg-white/[0.02] group shadow-xl transition-transform hover:scale-[1.02]">
                                        <img src={url} alt="Media" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                                        <button
                                            onClick={() => onRemoveMedia(idx)}
                                            className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Help Section Slot */}
                    {children}
                </div>
            </div>
        </div>
    );
}
