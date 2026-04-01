"use client";

import React from "react";
import { Type } from "lucide-react";

import { WritingAreaProps } from "../types";

export function WritingArea({ content, setContent }: WritingAreaProps) {
    return (
        <div className="flex-[7] flex flex-col space-y-5">
            <label className="ds-font-label px-2 ml-1 flex items-center gap-2.5 text-primary border-l-2 border-primary">
                <Type size={14} /> NỘI DUNG SPINTAX
            </label>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung {Chào Bạn|Hi Bro|Hello}..."
                className="flex-1 bg-surface-2 border border-border rounded-[2.5rem] p-10 text-foreground text-[1.5rem] font-medium leading-relaxed focus:bg-surface-3 focus:border-primary/30 transition-all outline-none resize-none shadow-inner placeholder:text-text-muted/20 custom-scrollbar"
            />
        </div>
    );
}
