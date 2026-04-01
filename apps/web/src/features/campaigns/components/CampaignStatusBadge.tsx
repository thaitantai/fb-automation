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
        case "PROCESSING": return "badge-blue animate-pulse";
        case "COMPLETED":  return "badge-green";
        case "PAUSED":     return "badge-amber";
        case "SCHEDULED":  return "badge-purple";
        case "DRAFT":      return "badge-zinc";
        default:           return "badge-zinc";
    }
};

export function CampaignStatusBadge({ status, className }: CampaignStatusBadgeProps) {
    return (
        <span className={cn(
            "inline-flex items-center gap-1.5",
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
