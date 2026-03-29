"use client";

import React, { useState } from "react";
import { Component, RefreshCcw, Search, Loader2, Users, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountSidebar } from "./AccountSidebar";
import { useGroupsMaster } from "../hooks/useGroupsMaster";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { GroupTable } from "./GroupTable";

// Chúng ta sẽ tái sử dụng GroupTable nhưng thêm logic hiển thị tên tài khoản nếu chọn nhiều
export function GroupsMasterDashboard() {
    const { accounts, loading: accountsLoading } = useAccounts();
    const { 
        groups, 
        loading: groupsLoading, 
        syncing, 
        selectedAccountIds, 
        toggleSelectAccount,
        syncBulk,
        fetchGroups
    } = useGroupsMaster();

    const [searchTerm, setSearchTerm] = useState("");
    const [syncMessage, setSyncMessage] = useState<string | null>(null);

    const handleBulkSync = async () => {
        if (selectedAccountIds.length === 0) return;
        
        const result = await syncBulk();
        if (result.success) {
            setSyncMessage(`Đã gửi yêu cầu đồng bộ cho ${selectedAccountIds.length} tài khoản. Vui lòng chờ...`);
            setTimeout(() => setSyncMessage(null), 5000);
        }
    };

    return (
        <div className="flex bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden h-[calc(100vh-160px)] shadow-2xl relative">
            
            {/* Left Sidebar: Account Navigation (Compact w-72) */}
            <AccountSidebar 
                accounts={accounts}
                loading={accountsLoading}
                selectedAccountIds={selectedAccountIds}
                onToggleSelect={(id) => toggleSelectAccount(id, accounts.map(a => a.id))}
            />

            {/* Main Content: Group Listing (Ultra-compact p-5) */}
            <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-black to-zinc-900/40 p-5">
                
                {/* Dashboard Header (Compact mb-4) */}
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight leading-none">
                            {selectedAccountIds.length > 1 
                                ? `Đã chọn ${selectedAccountIds.length} tài khoản` 
                                : selectedAccountIds.length === 1 
                                    ? "Tài khoản hiện tại" 
                                    : "Chọn tài khoản bên trái"}
                        </h2>
                        <p className="text-zinc-600 text-[11px] mt-0.5">
                            {groups.length > 0 
                                ? `Dữ liệu nạp: ${groups.length} nhóm` 
                                : "Danh sách chưa có dữ liệu..."}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedAccountIds.length > 0 && (
                            <button
                                onClick={handleBulkSync}
                                disabled={syncing}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 bg-blue-600/90 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/10 disabled:opacity-50",
                                    syncing && "animate-pulse"
                                )}
                            >
                                <RefreshCcw size={14} className={cn(syncing && "animate-spin")} />
                                {syncing ? "Đang xử lý..." : `Đồng bộ (${selectedAccountIds.length})`}
                            </button>
                        )}
                        <button
                            onClick={fetchGroups}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-zinc-500 transition-all"
                        >
                            <RefreshCcw size={14} className={cn(groupsLoading && "animate-spin")} />
                        </button>
                    </div>
                </div>

                {/* Status Message Overlay (Compact py-2) */}
                {syncMessage && (
                    <div className="mb-3 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-2 py-2 px-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-emerald-400 text-[11px] font-medium">
                            <CheckCircle2 size={14} />
                            {syncMessage}
                        </div>
                    </div>
                )}

                {/* Main View: Empty state or Table */}
                <div className="flex-1 min-h-0 flex flex-col relative">
                    {selectedAccountIds.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-6 bg-white/[0.01] rounded-3xl border border-dashed border-white/10">
                            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5 text-zinc-700 shadow-inner">
                                <AlertCircle size={40} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-zinc-400">Chưa có tài khoản nào được chọn</h3>
                                <p className="text-zinc-600 text-sm mt-1">Vui lòng chọn tài khoản ở cột bên trái để xem và đồng bộ dữ liệu nhóm.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 min-h-0">
                            <GroupTable 
                                groups={groups}
                                loading={groupsLoading}
                                onSync={handleBulkSync}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Global Loader Overlay */}
            {groupsLoading && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-[60]">
                    <div className="p-4 rounded-3xl bg-zinc-950 border border-white/10 shadow-3xl text-blue-500 flex items-center gap-3">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-xs font-bold uppercase tracking-wider">Đang cập nhật Dashboard...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
