"use client";

import React, { useState } from "react";
import { User, CheckCircle2, XCircle, Search, Layers, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FbAccount } from "@/features/accounts/types";

interface AccountSidebarProps {
    accounts: FbAccount[];
    loading: boolean;
    selectedAccountIds: string[];
    onToggleSelect: (id: string | 'ALL') => void;
}

export function AccountSidebar({
    accounts,
    loading,
    selectedAccountIds,
    onToggleSelect
}: AccountSidebarProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const isAllSelected = selectedAccountIds.length === accounts.length && accounts.length > 0;
    
    const filteredAccounts = accounts.filter(acc => 
        acc.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        acc.fbUid.includes(searchTerm)
    );

    return (
        <div className="w-72 border-r border-white/5 bg-black/20 flex flex-col h-full overflow-hidden">
            {/* Header: Search accounts */}
            <div className="p-4 space-y-3">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input
                        placeholder="Tìm tài khoản..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                    />
                </div>

                <button
                    onClick={() => onToggleSelect('ALL')}
                    className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300",
                        isAllSelected 
                            ? "bg-blue-600/10 border-blue-500/50 text-blue-400" 
                            : "bg-white/5 border-transparent text-zinc-400 hover:bg-white/10"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Layers size={18} />
                        <span className="text-sm font-bold">Tất cả tài khoản</span>
                    </div>
                    <span className="text-xs bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                        {accounts.length}
                    </span>
                </button>
            </div>

            {/* List: Facebook Accounts with group counts */}
            <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2 custom-scrollbar">
                {loading && accounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-zinc-600">
                        <Circle className="animate-pulse mb-2" size={24} />
                        <span className="text-sm">Đang nạp...</span>
                    </div>
                ) : filteredAccounts.map((acc) => {
                    const isSelected = selectedAccountIds.includes(acc.id);
                    return (
                        <div
                            key={acc.id}
                            onClick={() => onToggleSelect(acc.id)}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] group",
                                isSelected 
                                    ? "bg-blue-600/10 border-blue-500/40" 
                                    : "bg-white/[0.02] border-white/5 hover:bg-white/5"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/5 text-zinc-600 group-hover:text-blue-400">
                                        <User size={20} />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1">
                                        {acc.status === 'ACTIVE' ? (
                                            <CheckCircle2 className="text-emerald-500 fill-black" size={14} />
                                        ) : (
                                            <XCircle className="text-rose-500 fill-black" size={14} />
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn(
                                        "text-sm font-semibold truncate max-w-[120px]",
                                        isSelected ? "text-blue-400" : "text-zinc-200"
                                    )}>
                                        {acc.username || "FB Account"}
                                    </span>
                                    <span className="text-[10px] text-zinc-600 font-mono">
                                        {acc.fbUid}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end">
                                <span className={cn(
                                    "text-xs font-bold",
                                    isSelected ? "text-blue-500" : "text-zinc-400"
                                )}>
                                    {acc.groupsCount || 0}
                                </span>
                                <span className="text-[8px] uppercase tracking-tighter text-zinc-700 font-bold">Groups</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
