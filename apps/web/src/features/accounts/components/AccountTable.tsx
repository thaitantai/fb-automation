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
    console.log(accounts);

    return (
        <div className="table-container relative">
            {/* Header & Search */}
            <div className="p-6 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-6 bg-surface-raised/30">
                <div className="flex items-center gap-4 flex-1 w-full">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input
                            placeholder="Tìm kiếm tài khoản theo tên hoặc UID..."
                            className="input h-[4.2rem] pl-12 pr-4 bg-surface-2 border-white/5 focus:bg-surface-1 transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={() => {
                                onBulkDelete(selectedIds);
                                setSelectedIds([]);
                            }}
                            className="btn-danger h-[4rem] px-5 shadow-lg shadow-error/10 animate-in zoom-in duration-200"
                        >
                            <Trash2 size={16} />
                            Xóa đã chọn ({selectedIds.length})
                        </button>
                    )}
                    <button
                        onClick={onRefresh}
                        className="btn-secondary h-[4rem] px-4 font-bold"
                        title="Làm mới danh sách"
                    >
                        <RefreshCcw size={18} className={cn(loading && "animate-spin")} />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                {loading && accounts.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4 animate-pulse">
                        <Loader2 className="animate-spin text-primary" size={36} />
                        <p className="text-text-secondary font-medium">Đang tải danh sách tài khoản...</p>
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="p-24 text-center space-y-4">
                        <div className="w-20 h-20 bg-surface-2 rounded-full flex items-center justify-center mx-auto text-text-muted">
                            <Users size={40} />
                        </div>
                        <p className="text-text-secondary font-medium">Chưa có tài khoản nào được kết nối.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-2/50 border-b border-border">
                                <th className="px-6 py-4 w-12">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-border-strong bg-surface-3 checked:bg-primary transition-all cursor-pointer accent-primary"
                                        checked={accounts.length > 0 && selectedIds.length === accounts.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="table-header-cell">Thông tin tài khoản</th>
                                <th className="table-header-cell text-center">Mật khẩu</th>
                                <th className="table-header-cell text-center">Tình trạng</th>
                                <th className="table-header-cell">Proxy / IP</th>
                                <th className="table-header-cell">Lục đăng nhập</th>
                                <th className="table-header-cell text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {accounts.map((acc) => (
                                <tr
                                    key={acc.id}
                                    className={cn(
                                        "table-row group",
                                        selectedIds.includes(acc.id) && "bg-primary/5 hover:bg-primary/10"
                                    )}
                                >
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-border-strong bg-surface-3 checked:bg-primary transition-all cursor-pointer accent-primary"
                                            checked={selectedIds.includes(acc.id)}
                                            onChange={() => toggleSelect(acc.id)}
                                        />
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-surface-raised flex items-center justify-center border border-border group-hover:border-primary/20 transition-colors shadow-sm">
                                                <User size={18} className="text-text-secondary group-hover:text-primary transition-colors" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground group-hover:text-primary transition-colors">{acc.username || "Tài khoản FB"}</span>
                                                <span className="text-[1.1rem] font-mono text-text-muted mt-0.5 tracking-tight">{acc.fbUid}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="table-cell text-center">
                                        <PasswordCell value={acc.password} />
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex justify-center">
                                            <span className={cn(
                                                acc.status === 'ACTIVE' ? "badge-green" : 
                                                acc.status === 'CONNECTING' ? "badge-blue" : "badge-red"
                                            )}>
                                                {acc.status === 'CONNECTING' && <Loader2 size={10} className="animate-spin" />}
                                                {acc.status === 'ACTIVE' && <CheckCircle2 size={10} />}
                                                {acc.status === 'ERROR' && <XCircle size={10} />}
                                                {acc.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="table-cell">
                                        {acc.proxy ? (
                                            <div className="flex items-center gap-2 text-text-secondary">
                                                <Globe size={14} className="text-text-muted" />
                                                <span className="font-mono text-[1.2rem]">{acc.proxy.ip}</span>
                                            </div>
                                        ) : (
                                            <span className="text-text-muted text-[1.2rem] italic">Mặc định</span>
                                        )}
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex flex-col">
                                            <span className="text-[1.2rem] text-foreground font-medium">
                                                {acc.lastLogin ? new Date(acc.lastLogin).toLocaleDateString('vi-VN') : '---'}
                                            </span>
                                            <span className="text-[1.1rem] text-text-muted uppercase font-bold tracking-tighter">
                                                {acc.lastLogin ? new Date(acc.lastLogin).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="table-cell text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {acc.status === 'ACTIVE' ? (
                                                <button
                                                    onClick={() => onDisconnect(acc.id)}
                                                    className="p-3 rounded-xl text-text-muted hover:bg-warning/10 hover:text-warning transition-all border border-transparent hover:border-warning/20 shadow-sm"
                                                    title="Ngắt kết nối"
                                                >
                                                    <PowerOff size={18} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => onConnect(acc.id)}
                                                    className="p-3 rounded-xl text-text-muted hover:bg-success/10 hover:text-success transition-all border border-transparent hover:border-success/20 shadow-sm"
                                                    title="Bắt đầu kết nối"
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
