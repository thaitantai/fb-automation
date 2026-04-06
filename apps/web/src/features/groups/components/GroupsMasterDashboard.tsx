"use client";

import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { useGroupsMaster } from "../hooks/useGroupsMaster";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";

// Phân tách Component theo Clean Architecture
import { AccountSidebar } from "./AccountSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { SyncProgressOverlay } from "./SyncProgressOverlay";
import { EmptyAccountState } from "./EmptyAccountState";
import { GroupTable } from "./GroupTable";

export function GroupsMasterDashboard() {
    const { accounts, loading: accountsLoading, fetchAccounts } = useAccounts();
    const {
        groups,
        loading: groupsLoading,
        syncing,
        selectedAccountIds,
        toggleSelectAccount,
        syncBulk,
        fetchGroups: refreshGroups
    } = useGroupsMaster();

    const [syncMessage, setSyncMessage] = useState<string | null>(null);
    const [isShowingSyncProgress, setIsShowingSyncProgress] = useState(false);
    const [isSyncingBackground, setIsSyncingBackground] = useState(false);

    // Dùng Ref để tính số lần dữ liệu đứng yên (Stagnation) nhằm nhận biết Job đã kết thúc
    const prevCountRef = useRef(groups.length);
    const stagnantTicksRef = useRef(0);

    // Bắt đầu chế độ Polling khi đang Sync Background
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSyncingBackground) {
            // Khởi tạo Ref
            prevCountRef.current = groups.length;
            stagnantTicksRef.current = 0;

            // Cứ 6 giây tự động fetchGroups lại 1 lần để đếm số nhóm tăng lên
            interval = setInterval(() => {
                refreshGroups();
                fetchAccounts(); // Update liên tục cho thanh Account Sidebar bên trái
            }, 6000);
        }
        return () => clearInterval(interval);
    }, [isSyncingBackground, refreshGroups, fetchAccounts]);

    // [Bộ não thông minh] Tự động ngắt trạng thái chạy ngầm khi Crawler không nạp thêm nhóm mới vào DB
    useEffect(() => {
        if (isSyncingBackground) {
            // Logic so sánh: Nếu nhóm đang tải mà chững lại không bơi vào nữa
            if (groups.length === prevCountRef.current) {
                stagnantTicksRef.current += 1;
                // Nếu ngưng trệ liên tục 4 chu kỳ (khoảng 24 giây) -> Đồng nghĩa Crawler đã cào xong và tắt Job
                if (stagnantTicksRef.current >= 4) {
                    setIsSyncingBackground(false);
                    setSyncMessage(null);
                    console.log("[Auto-Stop] Đã hoàn thành quá trình nạp dữ liệu.");
                }
            } else {
                // Nhóm vẫn đang vào ào ào -> reset bộ đếm đứng yên
                stagnantTicksRef.current = 0;
            }
            prevCountRef.current = groups.length;
        }
    }, [groups.length, isSyncingBackground]);

    const handleBulkSync = async () => {
        if (selectedAccountIds.length === 0) return;

        setIsShowingSyncProgress(true);
        const result = await syncBulk();

        if (result.success) {
            setIsSyncingBackground(true);
            setSyncMessage(`Tiến trình đồng bộ đang chạy ngầm cho ${selectedAccountIds.length} tài khoản.`);

            // Tắt Overlay chắn ngang màn hình sớm để người dùng còn bấm làm việc khác
            setTimeout(() => {
                setIsShowingSyncProgress(false);
            }, 8000);

            // Xóa luôn setTimeout tĩnh 150000s vì giờ đã có bộ não AI tự động ngắt theo Stagnation Detection
        } else {
            setIsShowingSyncProgress(false);
            setIsSyncingBackground(false);
            setSyncMessage(`Lỗi: ${result.error}`);
            setTimeout(() => setSyncMessage(null), 5000);
        }
    };

    return (
        <div className="flex h-full relative border-t border-border">

            {/* Left Sidebar: Account Navigation - Danh sách tài khoản bên trái */}
            <div className="w-[300px] shrink-0 h-full overflow-hidden flex flex-col glass-card border-none bg-surface-raised/20">
                <AccountSidebar
                    accounts={accounts}
                    loading={accountsLoading}
                    selectedAccountIds={selectedAccountIds}
                    onToggleSelect={(id) => toggleSelectAccount(id, accounts.map(a => a.id))}
                />
            </div>

            {/* Main Content: Group Listing - Nội dung chính */}
            <div className="flex-1 flex flex-col min-w-0 px-8 h-full overflow-hidden">

                {/* Dashboard Header Component */}
                <DashboardHeader
                    selectedCount={selectedAccountIds.length}
                    groupsCount={groups.length}
                    syncing={syncing}
                    isProgressShowing={isShowingSyncProgress}
                    isSyncingBackground={isSyncingBackground}
                    onSync={handleBulkSync}
                    onRefresh={refreshGroups}
                    loading={groupsLoading}
                />

                {/* Status Message Overlay (Premium Callout) */}
                {syncMessage && !isShowingSyncProgress && (
                    <div className="mb-6 animate-in slide-in-from-right-4 duration-500">
                        <div className="callout-success py-4 px-6 shadow-glow-green/5">
                            <CheckCircle2 size={18} className="shrink-0" />
                            <p className="font-semibold">{syncMessage}</p>
                            <button onClick={() => setSyncMessage(null)} className="ml-auto text-success/60 hover:text-success transition-colors font-bold uppercase text-[1.1rem]">Đóng</button>
                        </div>
                    </div>
                )}

                {/* Main View Container */}
                <div className="flex-1 min-h-0 flex flex-col relative bg-surface-1 rounded-[2.5rem] border border-border overflow-hidden shadow-inner selection:bg-primary/20">

                    {/* Sync Progress Overlay Component */}
                    <SyncProgressOverlay
                        isVisible={isShowingSyncProgress}
                        selectedCount={selectedAccountIds.length}
                    />

                    {selectedAccountIds.length === 0 ? (
                        <EmptyAccountState />
                    ) : (
                        <div className="flex-1 min-h-0 h-full overflow-hidden">

                            <GroupTable
                                groups={groups}
                                loading={groupsLoading}
                                onSync={handleBulkSync}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Global Loader Overlay (Database fetch only) */}
            {groupsLoading && !isShowingSyncProgress && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[4px] flex items-center justify-center z-[60] animate-in fade-in duration-300">
                    <div className="flex flex-col items-center gap-5">
                        <div className="w-14 h-14 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                        <span className="text-[1.2rem] font-bold text-foreground/70 animate-pulse uppercase">Đang nạp cơ sở dữ liệu...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
