"use client";

import React from "react";
import { Search, RefreshCw, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CampaignActionBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onRefresh: () => void;
    onCreateClick: () => void;
    loading: boolean;
}

export function CampaignActionBar({ 
    searchTerm, 
    onSearchChange, 
    onRefresh, 
    onCreateClick, 
    loading 
}: CampaignActionBarProps) {
    return (
        <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input
                    placeholder="Tìm tên chiến dịch..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-11 pr-4 py-3.5 ds-font-body text-white focus:bg-white/[0.06] transition-all outline-none"
                />
            </div>

            <div className="flex items-center gap-2">
                <button 
                    onClick={onRefresh}
                    className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 rounded-xl border border-white/5 transition-all"
                    title="Tải lại ngay"
                >
                    <RefreshCw size={18} className={cn(loading && "animate-spin")} />
                </button>
                <button 
                    onClick={onCreateClick}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-95 duration-200"
                >
                    <Plus size={18} />
                    Chiến dịch mới
                </button>
            </div>
        </div>
    );
}
