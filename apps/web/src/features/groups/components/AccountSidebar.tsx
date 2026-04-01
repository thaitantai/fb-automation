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
        <div className="border-r border-border bg-surface-raised/20 flex flex-col h-full overflow-hidden">
            {/* Header: Search accounts - Tìm kiếm tài khoản */}
            <div className="p-6 space-y-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} />
                    <input
                        placeholder="Tìm tài khoản..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input h-[4.2rem] pl-12 shadow-sm focus:bg-surface-1"
                    />
                </div>

                <button
                    onClick={() => onToggleSelect('ALL')}
                    className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                        isAllSelected
                            ? "bg-primary/10 border-primary/40 text-primary shadow-glow-blue/10"
                            : "bg-surface-2 border-border/40 text-text-muted hover:bg-surface-3"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Layers size={18} />
                        <span className="text-[1.4rem] font-black">Toàn bộ tài khoản</span>
                    </div>
                    <span className="text-[1.1rem] bg-surface-1 px-2.5 py-1 rounded-lg border border-border font-bold">
                        {accounts.length}
                    </span>
                </button>
            </div>

            {/* List: Facebook Accounts with group counts - Danh sách tài khoản FB */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 scrollbar-hide">
                {loading && accounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-text-muted">
                        <Circle className="animate-pulse text-primary mb-3" size={24} />
                        <span className="ds-font-label">Đang tải dữ liệu...</span>
                    </div>
                ) : filteredAccounts.map((acc) => {
                    const isSelected = selectedAccountIds.includes(acc.id);
                    const isActive = acc.status === 'ACTIVE';
                    return (
                        <div
                            key={acc.id}
                            onClick={() => onToggleSelect(acc.id)}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all hover:translate-x-1 group",
                                isSelected
                                    ? "bg-primary/10 border-primary/30 shadow-glow-blue/5"
                                    : "bg-surface-2/40 border-border/40 hover:bg-surface-3 hover:border-border"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center border transition-all",
                                        isSelected ? "bg-primary/20 border-primary/30 text-primary" : "bg-surface-3 border-border text-text-muted group-hover:text-foreground"
                                    )}>
                                        <User size={20} />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 shadow-sm rounded-full">
                                        {isActive ? (
                                            <CheckCircle2 className="text-success" size={16} fill="white" />
                                        ) : (
                                            <XCircle className="text-error" size={16} fill="white" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn(
                                        "text-[1.4rem] font-black truncate max-w-[110px] transition-colors",
                                        isSelected ? "text-primary" : "text-foreground"
                                    )}>
                                        {acc.username || "FB Account"}
                                    </span>
                                    <span className="text-[1.1rem] text-text-muted font-mono tracking-tight font-medium">
                                        {acc.fbUid}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <span className={cn(
                                    "text-[1.3rem] font-black",
                                    isSelected ? "text-primary" : "text-foreground"
                                )}>
                                    {acc.groupsCount || 0}
                                </span>
                                <span className="text-[1rem] uppercase tracking-tighter text-text-muted font-black opacity-60">Groups</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
