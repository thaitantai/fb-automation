"use client";

import { useEffect, useMemo } from "react";
import { useCampaigns } from "../../hooks/useCampaigns";

export function useMonitoringLogic(campaign: any, isOpen: boolean) {
    const { logs, targetGroups: fetchedGroups, fetchLogs } = useCampaigns();

    const groupsToDisplay = useMemo(() => {
        const baseGroups = fetchedGroups?.length ? fetchedGroups : (campaign?.groups || []);
        return [...baseGroups].sort((a, b) => {
            const getScheduledTime = (id: string) => {
                const log = logs.find(l => l.targetId === id && l.actionType === 'SCHEDULED');
                return log ? new Date(log.executedAt).getTime() : 0;
            };
            return getScheduledTime(a.id) - getScheduledTime(b.id);
        });
    }, [fetchedGroups, campaign?.groups, logs]);

    const stats = useMemo(() => {
        const defaultStats = { success: 0, pendingApproval: 0, error: 0, pending: groupsToDisplay.length, isAllDone: false };
        if (!logs || !groupsToDisplay.length) return defaultStats;

        const successIds = new Set(logs.filter(l => l.actionType === 'AUTO_POST').map(l => l.targetId));
        const pendingIds = new Set(logs.filter(l => l.actionType === 'AUTO_POST_PENDING').map(l => l.targetId));
        const errorIds = new Set(logs.filter(l => l.actionType.includes('ERROR')).map(l => l.targetId));

        const counts = {
            success: groupsToDisplay.filter(g => successIds.has(g.id)).length,
            pendingApproval: groupsToDisplay.filter(g => pendingIds.has(g.id)).length,
            error: groupsToDisplay.filter(g => errorIds.has(g.id)).length,
        };

        const totalHandled = counts.success + counts.pendingApproval + counts.error;
        return {
            ...counts,
            pending: Math.max(0, groupsToDisplay.length - totalHandled),
            isAllDone: groupsToDisplay.length > 0 && totalHandled >= groupsToDisplay.length
        };
    }, [logs, groupsToDisplay]);

    const isRunning = campaign?.status === 'PROCESSING' && !stats.isAllDone;

    useEffect(() => {
        if (!isOpen || !campaign) return;
        fetchLogs(campaign.id);

        if (campaign.status !== 'PROCESSING' || stats.isAllDone) return;

        const isAnyRobotWorking = logs.some(l => l.actionType === 'ACTIVITY');
        let timer: NodeJS.Timeout;

        if (isAnyRobotWorking) {
            timer = setInterval(() => fetchLogs(campaign.id), 4000);
        } else {
            const scheduled = logs.filter(l => l.actionType === 'SCHEDULED');
            const nextTime = scheduled.length ? Math.min(...scheduled.map(l => new Date(l.executedAt).getTime())) : 0;
            const waitTime = nextTime - Date.now();

            if (waitTime > 5000) {
                const wakeup = setTimeout(() => fetchLogs(campaign.id), Math.max(100, waitTime - 2000));
                const heartbeat = setInterval(() => fetchLogs(campaign.id), 30000);
                return () => { clearTimeout(wakeup); clearInterval(heartbeat); };
            }
            timer = setInterval(() => fetchLogs(campaign.id), 4000);
        }
        return () => clearInterval(timer);
    }, [isOpen, campaign?.id, campaign?.status, stats.isAllDone, logs.some(l => l.actionType === 'ACTIVITY'), logs.length]);

    return { logs, groupsToDisplay, stats, isRunning };
}
