"use client";

import React, { useState } from "react";
import { FbGroup } from "@/features/accounts/types";
import { GroupSearch } from "./GroupSearch";
import { GroupTableRow } from "./GroupTableRow";
import { GroupLoadingOverlay } from "./GroupLoadingOverlay";
import { GroupEmptyState } from "./GroupEmptyState";

interface GroupTableProps {
    groups: (FbGroup & { fbAccount?: { username: string; fbUid: string } })[];
    loading: boolean;
    onSync: () => void;
    showAccount?: boolean;
}

/* ─── Main Component ─────────────────────────────────────────── */
export function GroupTable({
    groups = [],
    loading,
    showAccount = true
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
        <div className="flex flex-col h-full min-h-0 bg-transparent py-4">
            <GroupSearch value={searchTerm} onChange={setSearchTerm} />

            <div className="flex-1 overflow-auto border border-border rounded-[2.5rem] bg-surface-1 relative custom-scrollbar shadow-sm">
                {filteredGroups.length === 0 && !loading ? (
                    <GroupEmptyState />
                ) : (
                    <table className="w-full text-left border-collapse relative">
                        <thead className="sticky top-0 bg-surface-1/95 backdrop-blur-xl z-[30] shadow-sm">
                            <tr className="text-text-muted border-b border-border">
                                <th className="px-6 py-6 text-[1.1rem] font-black uppercase tracking-[0.15em]">Thông tin Nhóm</th>
                                {showAccount && <th className="px-6 py-6 text-[1.1rem] font-black uppercase tracking-[0.15em]">Tài khoản nguồn</th>}
                                <th className="px-6 py-6 text-[1.1rem] font-black uppercase tracking-[0.15em]">Facebook ID</th>
                                <th className="px-6 py-6 text-[1.1rem] font-black uppercase tracking-[0.15em]">Ngày cập nhật</th>
                                <th className="px-6 py-6 text-right text-[1.1rem] font-black uppercase tracking-[0.15em]">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {filteredGroups.map((group) => (
                                <GroupTableRow
                                    key={group.id}
                                    group={group}
                                    showAccount={showAccount}
                                    onCopy={handleCopy}
                                    isCopied={copiedId === group.groupId}
                                />
                            ))}
                        </tbody>
                    </table>
                )}

                {loading && <GroupLoadingOverlay />}
            </div>
        </div>
    );
}
