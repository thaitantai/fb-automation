"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export function GroupLoadingOverlay() {
    return (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center z-[50] animate-in fade-in duration-500 rounded-2xl">
            <div className="p-12 rounded-[3rem] bg-surface-2 border border-border shadow-2xl flex flex-col items-center gap-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
                    <Loader2 className="animate-spin text-primary relative z-10" size={64} />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-[2rem] font-black text-foreground uppercase tracking-[0.3em]">Processing</p>
                    <p className="text-text-muted text-[1.2rem] font-black uppercase tracking-widest italic opacity-60">Analyzing group metadata...</p>
                </div>
            </div>
        </div>
    );
}
