"use client";

import React, { useState } from "react";
import { Search, RefreshCw, Plus, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

interface CampaignActionBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onRefresh: () => void;
    onCreateClick: () => void;
    loading: boolean;
    selectedCount?: number;
    onDeleteBulk?: () => void;
}

export function CampaignActionBar({
    searchTerm, onSearchChange, onRefresh,
    onCreateClick, loading, selectedCount = 0, onDeleteBulk
}: CampaignActionBarProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6 p-2">
            {/* Search - Pro Version */}
            <div className="relative w-full sm:flex-1 max-w-lg group">
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors duration-300" />
                <input
                    className="w-full h-[5rem] bg-surface-2 border border-border rounded-[1.2rem] pl-16 pr-6 text-[1.4rem] font-bold focus:border-primary focus:bg-surface-3 transition-all duration-300 outline-none shadow-sm"
                    placeholder="Tìm kiếm chiến dịch robot..."
                    value={searchTerm}
                    onChange={e => onSearchChange(e.target.value)}
                />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3 ms-auto w-full sm:w-auto">
                {selectedCount > 0 && (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="flex items-center gap-3 bg-error/10 hover:bg-error text-error hover:text-white px-6 h-[5rem] rounded-[1.6rem] border border-error/20 transition-all font-black text-[1.1rem] uppercase tracking-widest animate-in slide-in-from-right-4"
                    >
                        <Trash2 size={16} />
                        Xóa {selectedCount} ROBOT
                    </button>
                )}

                <button
                    onClick={onRefresh}
                    title="Làm mới dữ liệu"
                    className="flex items-center justify-center w-[5rem] h-[5rem] rounded-[1.6rem] bg-surface-2 border border-border text-text-muted hover:text-foreground hover:bg-surface-3 transition-all shadow-sm group"
                >
                    <RefreshCw size={20} className={cn("transition-transform duration-500", loading ? "animate-spin" : "group-hover:rotate-180")} />
                </button>

                <button
                    onClick={onCreateClick}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-3 h-[5rem] bg-primary text-white px-8 rounded-[1.6rem] font-black text-[1.2rem] uppercase tracking-widest shadow-glow-blue hover:bg-primary-hover hover:-translate-y-1 active:scale-95 transition-all"
                >
                    <Plus size={20} />
                    Tạo chiến dịch
                </button>
            </div>

            {/* Confirm Delete Modal - Pro Version */}
            <Modal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                size="sm"
                title={
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error">
                            <AlertTriangle size={20} />
                        </div>
                        <h3 className="ds-font-title text-foreground">Xác nhận xóa Robot</h3>
                    </div>
                }
            >
                <div className="py-6 space-y-8 animate-in fade-in duration-300">
                    <p className="text-[1.5rem] text-text-muted leading-relaxed font-medium">
                        Bạn đang yêu cầu xóa vĩnh viễn <strong className="text-foreground">{selectedCount} chiến dịch</strong> đang được chọn. Hành động này sẽ không thể khôi phục dữ liệu.
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="flex-1 h-[4.8rem] rounded-2xl bg-surface-2 text-text-muted font-bold text-[1.4rem] hover:bg-surface-3 transition-all"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={() => { onDeleteBulk?.(); setShowConfirm(false); }}
                            className="flex-1 h-[4.8rem] rounded-2xl bg-error text-white font-black text-[1.2rem] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg"
                        >
                            Xác nhận xóa
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
