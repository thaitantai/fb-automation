"use client";

import React from "react";
import { LayoutTemplate } from "lucide-react";
import { TemplateDashboard } from "@/features/templates/components/TemplateDashboard";

export default function TemplatesPage() {
    return (
        <div className="h-screen overflow-hidden flex flex-col p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-transparent">

            {/* Row 1: Header - Tiêu đề chính */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-warning-muted rounded-2xl flex items-center justify-center shadow-lg border border-warning/20">
                        <LayoutTemplate className="w-7 h-7 text-warning" />
                    </div>
                    <div>
                        <h1 className="text-foreground tracking-tight">Mẫu Nội Dung</h1>
                        <p className="ds-font-label text-text-muted mt-1 uppercase">Cấu hình Spintax & Quản lý nội dung bài viết</p>
                    </div>
                </div>
            </div>

            {/* Row 2: Main Workspace - Không gian làm việc */}
            <div className="flex-1 min-h-0 overflow-hidden relative">
                <TemplateDashboard />
            </div>

        </div>
    );
}
