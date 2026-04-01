"use client";

import React from "react";
import { Sparkles, Trash2, Save, RefreshCcw } from "lucide-react";
import { EditorHeaderProps } from "../types";

export function EditorHeader({
    name,
    setName,
    isSaving,
    isEdit,
    onSave,
    onDelete
}: EditorHeaderProps) {
    return (
        <div className="flex items-center justify-between px-10 py-6 border-b border-border bg-surface-2/40">
            <div className="flex items-center gap-6 flex-1">
                <div className="w-14 h-14 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center shadow-glow-blue/5">
                    <Sparkles size={24} />
                </div>
                <div className="space-y-1 flex-1 max-w-xl">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tiêu đề mẫu nội dung..."
                        className="bg-transparent border-none outline-none text-foreground ds-font-title focus:ring-0 placeholder:text-text-muted/40 w-full font-black tracking-tight"
                    />
                    <div className="flex items-center gap-4">
                        <span className="ds-font-label text-text-muted uppercase">Thiết lập Spintax & Media</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {isEdit && onDelete && (
                    <button
                        onClick={onDelete}
                        className="w-12 h-12 flex items-center justify-center text-text-muted hover:text-error hover:bg-error/10 hover:border-error/20 rounded-2xl transition-all border border-border"
                        title="Xóa mẫu này"
                    >
                        <Trash2 size={20} />
                    </button>
                )}
                <button
                    disabled={isSaving || !name}
                    onClick={onSave}
                    className="btn-primary h-[4.8rem] px-10 shadow-glow-blue"
                >
                    {isSaving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
                    {isEdit ? "CẬP NHẬT MẪU" : "LƯU MẪU MỚI"}
                </button>
            </div>
        </div>
    );
}
