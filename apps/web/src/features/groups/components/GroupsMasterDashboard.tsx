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
        <div className="flex h-[calc(100vh-220px)] overflow-hidden relative border-t border-white/5">

            {/* Left Sidebar: Account Navigation (Compact w-80) */}
            <div className="w-[320px] shrink-0 h-full overflow-hidden flex flex-col glass-card border-none bg-transparent">
                <AccountSidebar
                    accounts={accounts}
                    loading={accountsLoading}
                    selectedAccountIds={selectedAccountIds}
                    onToggleSelect={(id) => toggleSelectAccount(id, accounts.map(a => a.id))}
                />
            </div>

            {/* Main Content: Group Listing (Ultra-compact p-5) */}
            <div className="flex-1 flex flex-col min-w-0 px-6 h-full overflow-hidden">

                {/* Dashboard Header (Compact mb-4) */}
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight leading-none">
                            {selectedAccountIds.length > 1
                                ? `Đã chọn ${selectedAccountIds.length} tài khoản`
                                : selectedAccountIds.length === 1
                                    ? "Danh sách nhóm"
                                    : "Chọn tài khoản bên trái"}
                        </h2>
                        <p className="text-zinc-600 text-tiny mt-1.5 font-medium">
                            {groups.length > 0
                                ? `Hệ thống hiển thị kết quả từ ${groups.length} nhóm kết nối.`
                                : "Vui lòng chọn hoặc đồng bộ tài khoản để nạp dữ liệu..."}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-2xl border border-white/5">
                        {selectedAccountIds.length > 0 && (
                            <button
                                onClick={handleBulkSync}
                                disabled={syncing}
                                className={cn(
                                    "px-5 py-2.5 bg-primary text-white rounded-xl text-tiny font-bold hover:bg-blue-500 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2.5",
                                    syncing && "animate-pulse"
                                )}
                            >
                                <RefreshCcw size={14} className={cn(syncing && "animate-spin")} />
                                {syncing ? "SYNC..." : `ĐỒNG BỘ (${selectedAccountIds.length})`}
                            </button>
                        )}
                        <button
                            onClick={fetchGroups}
                            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-zinc-400 transition-all group"
                            title="Tải lại bảng"
                        >
                            <RefreshCcw size={16} className={cn(groupsLoading && "animate-spin", "group-hover:text-white")} />
                        </button>
                    </div>
                </div>

                {/* Status Message Overlay (Compact py-2) */}
                {syncMessage && (
                    <div className="mb-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-3 py-3 px-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-tiny font-semibold shadow-xl shadow-emerald-500/5">
                            <CheckCircle2 size={16} />
                            {syncMessage}
                        </div>
                    </div>
                )}

                {/* Main View: Empty state or Table */}
                <div className="flex-1 min-h-0 flex flex-col relative bg-[#0a0a0a]/40 rounded-3xl border border-white/5 overflow-hidden">
                    {selectedAccountIds.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                            <div className="w-24 h-24 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5 text-zinc-800 shadow-inner relative">
                                <AlertCircle size={44} />
                                <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-2xl" />
                            </div>
                            <div className="text-center max-w-xs">
                                <h3 className="text-lg font-bold text-zinc-400">Trống tài khoản</h3>
                                <p className="text-zinc-600 text-sm mt-2 leading-relaxed italic">Vui lòng chọn ít nhất một tài khoản ở thanh điều hướng bên trái để bắt đầu quản lý nhóm.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 min-h-0 h-full">
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
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[60] animate-in fade-in duration-300">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-primary" size={40} />
                        <span className="text-tiny font-black uppercase tracking-[0.3em] text-white/50 animate-pulse">Processing...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
