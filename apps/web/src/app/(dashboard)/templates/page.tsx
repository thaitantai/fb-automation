"use client";

import React from "react";
import { LayoutTemplate } from "lucide-react";
import { PostTemplateDashboard } from "@/features/posts/components/PostTemplateDashboard";

export default function TemplatesPage() {
    return (
        <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen">
            
            {/* Template Header Section (Compact) */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg border border-amber-500/20">
                        <LayoutTemplate className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Mẫu Bài Viết</h1>
                        <p className="text-zinc-600 text-[10px] font-medium uppercase tracking-wider">Studio Soạn Thảo Cơ Bản & Trộn Nội Dung</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/5 active:scale-95 duration-200">
                        Hướng dẫn Spintax
                    </button>
                </div>
            </div>

            {/* Main Template Workspace */}
            <PostTemplateDashboard />

        </div>
    );
}
