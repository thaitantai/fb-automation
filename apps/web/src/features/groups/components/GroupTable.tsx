import React, { useState } from "react";
import { Users, Search, RefreshCcw, Loader2, Globe, Shield, ExternalLink, Copy, Check, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { FbGroup } from "@/features/accounts/types";

interface GroupTableProps {
    groups: (FbGroup & { fbAccount?: { username: string; fbUid: string } })[];
    loading: boolean;
    onSync: () => void;
    showAccount?: boolean;
}

export function GroupTable({
    groups = [],
    loading,
    onSync,
    showAccount = true // Mặc định hiển thị để hỗ trợ đa tài khoản
}: GroupTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const filteredGroups = Array.isArray(groups) ? groups.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.groupId.includes(searchTerm)
    ) : [];

    const handleCopy = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    return (
        <div className="flex flex-col h-full min-h-0 bg-transparent">
            {/* Search & Tool Center (Compact) */}
            <div className="flex items-center justify-between gap-4 mb-5 relative z-20">
                <div className="relative flex-1 max-w-xl group">
                    <div className="absolute inset-0 bg-blue-500/5 blur-xl group-focus-within:bg-blue-500/10 transition-all rounded-full" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                    <input
                        placeholder="Tìm kiếm nhanh tên hoặc ID nhóm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-blue-500/50 transition-all outline-none backdrop-blur-md"
                    />
                </div>
            </div>

            {/* Premium Master Table (Dense Mode) */}
            <div className="flex-1 overflow-auto border border-white/5 rounded-xl bg-white/[0.01] relative custom-scrollbar shadow-xl">
                {filteredGroups.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-4 text-center">
                        <Users size={32} className="text-zinc-800" />
                        <p className="text-zinc-500 text-sm">Không tìm thấy nhóm phù hợp</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse relative">
                        <thead className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl z-[30]">
                            <tr className="text-tiny uppercase tracking-widest text-zinc-500 font-bold border-b border-white/5">
                                <th className="px-6 py-3">Thông tin Nhóm</th>
                                {showAccount && <th className="px-6 py-3">Tài khoản</th>}
                                <th className="px-6 py-3">Facebook ID</th>
                                <th className="px-6 py-3">Ngày quét</th>
                                <th className="px-6 py-3 text-right">Xem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {filteredGroups.map((group) => (
                                <tr key={group.id} className="hover:bg-white/[0.02] transition-colors group/row">
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/5 text-zinc-600 group-hover/row:text-blue-400 group-hover/row:border-blue-500/30 transition-all">
                                                <Users size={14} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm text-zinc-200 font-semibold truncate max-w-[200px] group-hover/row:text-white">
                                                    {group.name}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    {group.privacy === 'PUBLIC' ? (
                                                        <span className="text-tiny text-emerald-500 font-bold flex items-center gap-1">
                                                            <Globe size={8} /> PUBLIC
                                                        </span>
                                                    ) : (
                                                        <span className="text-tiny text-amber-500 font-bold flex items-center gap-1">
                                                            <Shield size={8} /> PRIVATE
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {showAccount && (
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2 max-w-[150px]">
                                                <div className="w-5 h-5 rounded bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                    <User size={10} />
                                                </div>
                                                <div className="flex flex-col leading-none truncate overflow-hidden">
                                                    <span className="text-tiny font-bold text-zinc-400 truncate">
                                                        {group.fbAccount?.username || "---"}
                                                    </span>
                                                    <span className="text-tiny text-zinc-600 font-mono italic">
                                                        {group.fbAccount?.fbUid}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                    )}

                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-1.5 group/id">
                                            <code className="text-tiny font-mono text-zinc-500 italic">
                                                {group.groupId}
                                            </code>
                                            <button
                                                onClick={(e) => handleCopy(group.groupId, e)}
                                                className="p-1 text-zinc-700 hover:text-white opacity-0 group-hover/row:opacity-100 transition-all"
                                            >
                                                {copiedId === group.groupId ? <Check className="text-emerald-500" size={10} /> : <Copy size={10} />}
                                            </button>
                                        </div>
                                    </td>

                                    <td className="px-6 py-3">
                                        <div className="flex flex-col text-tiny text-zinc-600 font-medium">
                                            <span>{new Date(group.syncedAt).toLocaleDateString()}</span>
                                            <span className="text-tiny opacity-60 font-normal">{new Date(group.syncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-3 text-right">
                                        <a
                                            href={`https://facebook.com/groups/${group.groupId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-7 h-7 inline-flex items-center justify-center bg-white/5 hover:bg-blue-600/30 text-zinc-400 hover:text-white rounded-lg border border-white/5 transition-all group/btn"
                                        >
                                            <ExternalLink size={12} className="group-hover/btn:scale-110" />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {loading && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px] flex flex-col items-center justify-center z-[50] animate-in fade-in duration-500">
                        <div className="p-8 rounded-[2rem] bg-zinc-900 border border-white/10 shadow-[0_0_100px_rgba(37,99,235,0.1)] flex flex-col items-center gap-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse" />
                                <Loader2 className="animate-spin text-blue-500 relative z-10" size={56} />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-lg font-black text-white uppercase tracking-[0.3em]">Processing</p>
                                <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest italic">Analyzing group metadata...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
