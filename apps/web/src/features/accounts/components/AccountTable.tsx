import { useState } from "react";
import { Users, Trash2, Globe, RefreshCcw, Search, Loader2, Eye, EyeOff, User, Power, PowerOff, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FbAccount } from "../types";

interface AccountTableProps {
    accounts: FbAccount[];
    loading: boolean;
    onRefresh: () => void;
    onBulkDelete: (ids: string[]) => void;
    onConnect: (id: string) => void;
    onDisconnect: (id: string) => void;
    onManageGroups: (account: FbAccount) => void;
}

function PasswordCell({ value }: { value: string | null }) {
    const [show, setShow] = useState(false);

    if (!value) return <span className="text-zinc-600 italic text-sm">N/A</span>;

    return (
        <div className="flex items-center justify-center gap-2 group/pass">
            <span className="font-mono text-zinc-400 text-sm">
                {show ? value : "••••••••"}
            </span>
            <button
                onClick={() => setShow(!show)}
                className="p-1 hover:bg-white/5 rounded text-zinc-600 hover:text-zinc-400 transition-colors opacity-0 group-hover/pass:opacity-100"
            >
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
        </div>
    );
}

export function AccountTable({
    accounts = [],
    loading,
    onRefresh,
    onBulkDelete,
    onConnect,
    onDisconnect,
    onManageGroups
}: AccountTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleSelectAll = () => {
        if (selectedIds.length === accounts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(accounts.map(acc => acc.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };
    return (
        <div className="glass-card overflow-hidden relative">
            {/* Header & Search */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            placeholder="Tìm kiếm tài khoản..."
                            className="w-full bg-white/5 border-none rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-white/20 transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={() => {
                                onBulkDelete(selectedIds);
                                setSelectedIds([]);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl text-sm font-medium hover:bg-rose-500/20 transition-all border border-rose-500/20"
                        >
                            <Trash2 size={16} />
                            Gỡ bỏ ({selectedIds.length})
                        </button>
                    )}
                    <button
                        onClick={onRefresh}
                        className="p-2.5 hover:bg-white/5 rounded-xl text-zinc-400 transition-colors border border-white/5"
                    >
                        <RefreshCcw size={20} className={cn(loading && "animate-spin")} />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                {loading && accounts.length === 0 ? (
                    <div className="p-20 text-center text-zinc-500 flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-zinc-600" size={32} />
                        Đang tải danh sách tài khoản...
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="p-20 text-center space-y-3">
                        <Users size={48} className="mx-auto text-zinc-700" />
                        <p className="text-zinc-500">Chưa có tài khoản nào được kết nối.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs uppercase tracking-wider text-zinc-500 font-semibold border-b border-white/5 bg-white/[0.01]">
                                <th className="px-6 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-white/10 bg-white/5 checked:bg-blue-500 transition-all cursor-pointer accent-blue-500"
                                        checked={accounts.length > 0 && selectedIds.length === accounts.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-4">Tài khoản</th>
                                <th className="px-6 py-4 text-center">Mật khẩu</th>
                                <th className="px-6 py-4 text-center">Tình trạng</th>
                                <th className="px-6 py-4">Proxy</th>
                                <th className="px-6 py-4">Đăng nhập</th>
                                <th className="px-6 py-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {accounts.map((acc) => (
                                <tr
                                    key={acc.id}
                                    className={cn(
                                        "group transition-all duration-200",
                                        selectedIds.includes(acc.id) ? "bg-blue-500/[0.03]" : "hover:bg-white/[0.02]"
                                    )}
                                >
                                    <td className="px-6 py-5">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-white/10 bg-white/5 checked:bg-blue-500 transition-all cursor-pointer accent-blue-500"
                                            checked={selectedIds.includes(acc.id)}
                                            onChange={() => toggleSelect(acc.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                                                <User size={16} className="text-zinc-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-zinc-200">{acc.username || "Chưa đặt tên"}</span>
                                                <span className="text-tiny font-mono text-zinc-500 mt-0.5">{acc.fbUid}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <PasswordCell value={acc.password} />
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-tiny font-bold flex items-center gap-1.5 w-fit uppercase tracking-tighter shadow-sm",
                                                acc.status === 'ACTIVE'
                                                    ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                                                    : acc.status === 'CONNECTING'
                                                        ? "bg-blue-400/10 text-blue-400 border border-blue-400/20 animate-pulse"
                                                        : "bg-rose-400/10 text-rose-400 border border-rose-400/20"
                                            )}>
                                                {acc.status === 'CONNECTING' && <Loader2 size={10} className="animate-spin" />}
                                                {acc.status === 'ACTIVE' && <CheckCircle2 size={10} />}
                                                {acc.status === 'ERROR' && <XCircle size={10} />}
                                                {acc.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {acc.proxy ? (
                                            <div className="flex items-center gap-2 text-zinc-400 text-xs">
                                                <Globe size={14} className="text-zinc-600" />
                                                <span className="font-mono">{acc.proxy.ip}</span>
                                            </div>
                                        ) : (
                                            <span className="text-zinc-600 text-xs italic">Mặc định</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-zinc-300">
                                                {acc.lastLogin ? new Date(acc.lastLogin).toLocaleDateString() : '---'}
                                            </span>
                                            <span className="text-tiny text-zinc-500">
                                                {acc.lastLogin ? new Date(acc.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {acc.status === 'ACTIVE' ? (
                                                <button
                                                    onClick={() => onDisconnect(acc.id)}
                                                    className="p-2 rounded-lg text-zinc-500 hover:text-amber-500 hover:bg-amber-500/10 transition-all"
                                                    title="Ngắt kết nối"
                                                >
                                                    <PowerOff size={18} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => onConnect(acc.id)}
                                                    className="p-2 rounded-lg text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                                                    title="Kết nối"
                                                >
                                                    <Power size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
