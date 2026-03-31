"use client";

import React, { useState } from "react";
import { Search, RefreshCw, Plus, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

interface CampaignActionBarProps {
    searchTerm:    string;
    onSearchChange:(value: string) => void;
    onRefresh:     () => void;
    onCreateClick: () => void;
    loading:       boolean;
    selectedCount?:number;
    onDeleteBulk?: () => void;
}

export function CampaignActionBar({
    searchTerm, onSearchChange, onRefresh,
    onCreateClick, loading, selectedCount = 0, onDeleteBulk
}: CampaignActionBarProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div className="flex items-center gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                    className="input pl-10 h-10"
                    placeholder="Tìm chiến dịch..."
                    value={searchTerm}
                    onChange={e => onSearchChange(e.target.value)}
                />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 ml-auto">
                {selectedCount > 0 && (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="btn-danger btn-sm gap-2 animate-in zoom-in duration-200"
                    >
                        <Trash2 size={14} />
                        Xóa {selectedCount} mục
                    </button>
                )}

                <button
                    onClick={onRefresh}
                    title="Làm mới"
                    className="btn-icon"
                >
                    <RefreshCw size={16} className={cn(loading && "animate-spin")} />
                </button>

                <button onClick={onCreateClick} className="btn-primary btn-sm gap-2">
                    <Plus size={16} />
                    Chiến dịch mới
                </button>
            </div>

            {/* Confirm Delete Modal */}
            <Modal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                size="sm"
            >
                <div className="flex flex-col items-center text-center gap-6 py-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                         style={{ background: "hsl(var(--error-muted))", color: "hsl(var(--error))" }}>
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <h3 className="text-[20px] font-bold text-white mb-2">Xóa {selectedCount} chiến dịch?</h3>
                        <p className="text-secondary text-[14px] leading-relaxed">
                            Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="btn-secondary btn-md flex-1"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={() => { onDeleteBulk?.(); setShowConfirm(false); }}
                            className="btn-danger btn-md flex-1 hover:bg-red-600 hover:text-white"
                        >
                            Xóa ngay
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
