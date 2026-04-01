"use client";

import React from "react";
import { Users, Globe, Shield, User, Check, Copy, ExternalLink } from "lucide-react";

interface GroupTableRowProps {
    group: any; 
    showAccount: boolean; 
    onCopy: (id: string, e: any) => void;
    isCopied: boolean;
}

export function GroupTableRow({ 
    group, 
    showAccount, 
    onCopy, 
    isCopied 
}: GroupTableRowProps) {
    return (
        <tr className="hover:bg-surface-2/50 transition-colors group/row border-b border-border/50">
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-3 border border-border flex items-center justify-center text-text-muted group-hover/row:text-primary group-hover/row:border-primary/30 transition-all duration-300">
                        <Users size={16} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[1.5rem] text-foreground font-black tracking-tight truncate max-w-[240px]">
                            {group.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                            {group.privacy === 'PUBLIC' ? (
                                <span className="flex items-center gap-1 text-[1rem] font-black uppercase tracking-widest text-success bg-success/10 px-2 py-0.5 rounded-md">
                                    <Globe size={10} /> PUBLIC
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-[1rem] font-black uppercase tracking-widest text-warning bg-warning/10 px-2 py-0.5 rounded-md">
                                    <Shield size={10} /> PRIVATE
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </td>

            {showAccount && (
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover/row:bg-primary group-hover/row:text-white transition-all duration-500">
                            <User size={12} />
                        </div>
                        <div className="flex flex-col leading-tight truncate">
                            <span className="text-[1.3rem] font-bold text-foreground">
                                {group.fbAccount?.username || "---"}
                            </span>
                            <span className="text-[1.1rem] text-text-muted font-mono opacity-60">
                                {group.fbAccount?.fbUid}
                            </span>
                        </div>
                    </div>
                </td>
            )}

            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <code className="text-[1.2rem] font-mono text-text-muted italic opacity-80 bg-surface-2 px-2 py-1 rounded-md">
                        {group.groupId}
                    </code>
                    <button
                        onClick={(e) => onCopy(group.groupId, e)}
                        className="p-2 text-text-muted hover:text-primary opacity-0 group-hover/row:opacity-100 transition-all"
                    >
                        {isCopied ? <Check className="text-success" size={12} /> : <Copy size={12} />}
                    </button>
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="flex flex-col text-[1.2rem] text-text-muted font-bold">
                    <span className="text-foreground">{new Date(group.syncedAt).toLocaleDateString("vi-VN")}</span>
                    <span className="opacity-50 font-medium">
                        {new Date(group.syncedAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </td>

            <td className="px-6 py-4 text-right">
                <a
                    href={`https://facebook.com/groups/${group.groupId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 inline-flex items-center justify-center bg-surface-2 hover:bg-primary shadow-sm text-text-muted hover:text-white rounded-xl border border-border transition-all group/btn"
                >
                    <ExternalLink size={14} className="group-hover/btn:scale-110 transition-transform" />
                </a>
            </td>
        </tr>
    );
}
