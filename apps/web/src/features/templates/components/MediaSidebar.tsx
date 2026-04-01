"use client";

import React from "react";
import { Image as ImageIcon, Trash2 } from "lucide-react";

import { MediaSidebarProps } from "../types";

export function MediaSidebar({
    mediaUrls,
    newMediaUrl,
    setNewMediaUrl,
    onAddMedia,
    onRemoveMedia,
    children
}: MediaSidebarProps) {
    return (
        <div className="flex-[3] flex flex-col space-y-10">
            <div className="space-y-6">
                <label className="ds-font-label px-2 ml-1 flex items-center gap-2.5 text-warning border-l-2 border-warning">
                    <ImageIcon size={14} /> THƯ VIỆN MEDIA
                </label>
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <input
                            value={newMediaUrl}
                            onChange={(e) => setNewMediaUrl(e.target.value)}
                            placeholder="Nhập link ảnh (https://...)"
                            className="input h-[4.2rem] flex-1 px-5"
                        />
                        <button
                            onClick={onAddMedia}
                            className="px-6 h-[4.2rem] bg-surface-raised border border-border hover:bg-foreground hover:text-background text-text-secondary rounded-2xl text-[1.1rem] font-black transition-all active:scale-95 shadow-sm"
                        >
                            THÊM
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-h-[30rem] overflow-y-auto scrollbar-hide p-1">
                        {mediaUrls.map((url, idx) => (
                            <div key={idx} className="relative aspect-square rounded-[1.8rem] overflow-hidden border border-border bg-surface-2 group shadow-lg transition-all hover:border-primary/50">
                                <img src={url} alt="Media" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                                <button
                                    onClick={() => onRemoveMedia(idx)}
                                    className="absolute inset-0 flex items-center justify-center bg-error/60 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                >
                                    <Trash2 size={22} className="drop-shadow-lg" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Slot for additional help or info - Trợ giúp Spintax */}
            {children}
        </div>
    );
}
