"use client";

import React from "react";
import { 
    RefreshCw, CheckCircle2, Pause, Clock, AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CampaignStatus } from "../types";

interface CampaignStatusBadgeProps {
    status: CampaignStatus;
    className?: string;
}

const getStatusStyles = (status: CampaignStatus) => {
    switch (status) {
        case "PROCESSING": 
            return "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]";
        case "COMPLETED": 
            return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        case "PAUSED": 
            return "bg-amber-500/10 text-amber-400 border-amber-500/20";
        case "SCHEDULED": 
            return "bg-violet-500/10 text-violet-400 border-violet-500/20";
        default: 
            return "bg-zinc-500/10 text-zinc-500 border-zinc-500/10";
    }
};

export function CampaignStatusBadge({ status, className }: CampaignStatusBadgeProps) {
    return (
        <span className={cn(
            "px-3 py-1 rounded-full text-[9px] font-black flex items-center gap-1.5 uppercase tracking-tighter border",
            getStatusStyles(status),
            className
        )}>
            {status === "PROCESSING" && <RefreshCw size={10} className="animate-spin" />}
            {status === "COMPLETED" && <CheckCircle2 size={10} />}
            {status === "PAUSED" && <Pause size={10} />}
            {status === "SCHEDULED" && <Clock size={10} />}
            {status}
        </span>
    );
}
