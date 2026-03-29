import React, { useEffect, useMemo } from "react";
import { X, Users, Globe, Shield, RefreshCcw, Calendar, CheckCircle2 } from "lucide-react";
import { FbAccount } from "@/features/accounts/types";
import { useGroups } from "../hooks/useGroups";
import { GroupTable } from "./GroupTable";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface GroupModalProps {
    account: FbAccount | null;
    isOpen: boolean;
    onClose: () => void;
}

export function GroupModal({ account, isOpen, onClose }: GroupModalProps) {
    const { groups, loading, fetchGroups, syncGroups } = useGroups(account?.id);

    useEffect(() => {
        if (isOpen && account) {
            fetchGroups();
        }
    }, [isOpen, account, fetchGroups]);

    // Tính toán thống kê với lớp bảo vệ nghiêm ngặt
    const stats = useMemo(() => {
        // Đảm bảo safeGroups luôn là mảng, kể cả khi groups là null/undefined/object
        const safeGroups = Array.isArray(groups) ? groups : []; 
        
        return {
            total: safeGroups.length,
            public: safeGroups.filter(g => g?.privacy === 'PUBLIC').length,
            private: safeGroups.filter(g => g?.privacy !== 'PUBLIC').length,
            lastSync: safeGroups.length > 0 
                ? safeGroups.reduce((latest, g) => {
                    const date = new Date(g.syncedAt);
                    return date > latest ? date : latest;
                  }, new Date(0))
                : null
        };
    }, [groups]);

    if (!isOpen || !account) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop với hiệu ứng mờ sâu */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Content Container */}
            <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header Section */}
                <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32" />

                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Users className="text-white" size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white tracking-tight">Quản lý Facebook Groups</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-zinc-500">Tài khoản:</span>
                                    <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                                        {account.username || account.fbUid}
                                    </span>
                                    {stats.lastSync && (
                                        <div className="flex items-center gap-1.5 ml-4 border-l border-white/10 pl-4 text-zinc-500">
                                            <Calendar size={12} />
                                            <span className="text-xs">Đồng bộ: {format(stats.lastSync, 'HH:mm dd/MM/yyyy', { locale: vi })}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-all border border-white/5"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-blue-500/30 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Tổng số nhóm</span>
                                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                                    <Users size={14} />
                                </div>
                            </div>
                            <div className="mt-2 text-3xl font-bold text-white leading-none">{stats.total}</div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-emerald-500/30 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Công khai</span>
                                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                                    <Globe size={14} />
                                </div>
                            </div>
                            <div className="mt-2 text-3xl font-bold text-white leading-none">{stats.public}</div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-amber-500/30 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Nhóm kín</span>
                                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                                    <Shield size={14} />
                                </div>
                            </div>
                            <div className="mt-2 text-3xl font-bold text-white leading-none">{stats.private}</div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="flex-1 p-8 overflow-hidden flex flex-col min-h-0">
                    <GroupTable
                        groups={groups}
                        loading={loading}
                        onSync={syncGroups}
                    />
                </div>

                {/* Footer Section */}
                <div className="p-5 bg-black/40 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs">
                        <CheckCircle2 className="text-emerald-500" size={14} />
                        Dữ liệu được bảo mật và lưu trữ trong hệ thống riêng tư.
                    </div>
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-black/20 transition-all active:scale-95"
                    >
                        Đóng Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
