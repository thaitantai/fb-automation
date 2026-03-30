"use client";

import React from "react";
import { LayoutTemplate } from "lucide-react";
import { PostTemplateDashboard } from "@/features/posts/components/PostTemplateDashboard";

export default function TemplatesPage() {
    return (
        <div className="h-screen overflow-hidden grid grid-rows-[auto_1fr] p-8 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Template Header Section (Compact) */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl border border-amber-500/200">
                        <LayoutTemplate className="w-7 h-7 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="ds-font-title font-black text-white tracking-tighter">Mẫu Bài Viết</h1>
                        <p className="ds-font-subtitle font-bold opacity-80">Cài đặt mẫu bài viết & random spintax</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl ds-text-body font-bold transition-all border border-white/5 active:scale-95 duration-300 shadow-xl">
                        Hướng dẫn Spintax
                    </button>
                </div>
            </div>

            {/* Main Template Workspace */}
            <div className="min-h-0 overflow-hidden relative">
                <PostTemplateDashboard />
            </div>

        </div>
    );
}
