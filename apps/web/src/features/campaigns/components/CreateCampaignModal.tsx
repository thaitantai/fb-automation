"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
    X, Rocket, LayoutTemplate, Users, MessagesSquare,
    ArrowRight, ChevronLeft, CheckCircle2, Search,
    Loader2, AlertCircle, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { StepProgress, StepConfig } from "@/components/ui/StepProgress";
import { usePostTemplates } from "@/features/posts/hooks/usePostTemplates";
import { useGroupsMaster } from "@/features/groups/hooks/useGroupsMaster";
import { useCampaigns } from "../hooks/useCampaigns";

import { Campaign } from "../types";

const CAMPAIGN_STEPS: StepConfig[] = [
    { id: 1, label: "Chọn nội dung", icon: Rocket },
    { id: 2, label: "Chọn tài khoản", icon: Users },
    { id: 3, label: "Chọn nhóm", icon: MessagesSquare },
    { id: 4, label: "Xác nhận", icon: CheckCircle2 }
];

export interface CreateCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Campaign | null;
}

export function CreateCampaignModal({ isOpen, onClose, initialData }: CreateCampaignModalProps) {
    const { templates } = usePostTemplates();
    const { groups, accounts } = useGroupsMaster();
    const { createCampaign, updateCampaign } = useCampaigns();

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Form State
    const [campaignName, setCampaignName] = useState("");
    const [campaignType, setCampaignType] = useState<"AUTO_POST" | "AUTO_COMMENT">("AUTO_POST");
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

    // Search/Filters
    const [groupSearch, setGroupSearch] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    // Calculated Target Options
    const relevantGroups = useMemo(() => {
        return groups.filter(g => selectedAccountIds.includes(g.fbAccountId));
    }, [groups, selectedAccountIds]);

    const filteredGroups = useMemo(() => {
        return relevantGroups.filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase()));
    }, [relevantGroups, groupSearch]);

    // Prefill data if editing
    useEffect(() => {
        if (isOpen && initialData) {
            setCampaignName(initialData.name);
            setCampaignType(initialData.type as any || "AUTO_POST");
            setSelectedTemplateId(initialData.templateId || "");
            setSelectedAccountIds(Array.isArray(initialData.fbAccounts) ? initialData.fbAccounts.map((a: any) => a.id) : []);
            setSelectedGroupIds((initialData.targetConfigs as any)?.groupIds || []);
        } else if (isOpen) {
            setCampaignType("AUTO_POST");
            setCampaignName("");
            setSelectedTemplateId("");
            setSelectedAccountIds([]);
            setSelectedGroupIds([]);
            setStep(1);
        }
    }, [isOpen, initialData]);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const payload = {
            name: campaignName,
            type: campaignType,
            templateId: selectedTemplateId,
            fbAccountIds: selectedAccountIds,
            targetConfigs: { groupIds: selectedGroupIds }
        };

        const result = initialData
            ? await updateCampaign(initialData.id, payload)
            : await createCampaign(payload);

        setIsSubmitting(false);
        if (result.success) {
            onClose();
        }
    };

    const toggleAccount = (id: string) => {
        setSelectedAccountIds(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const toggleGroup = (id: string) => {
        setSelectedGroupIds(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            title={initialData ? "Cập Nhật Chiến Dịch" : "Khởi Tạo Chiến Dịch mới"}
            description={initialData ? "Cập nhật thông tin chiến dịch" : "Thực hiện theo các bước để khởi tạo một chiến dịch robot thông minh"}
            footer={
                <div className="flex items-center justify-between w-full">
                    <button
                        disabled={step === 1 || isSubmitting}
                        onClick={handleBack}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white/5 text-zinc-400 rounded-[1.5rem] ds-font-body font-bold hover:bg-white/10 transition-all disabled:opacity-0"
                    >
                        <ChevronLeft size={18} /> Quay lại
                    </button>

                    {step < 4 ? (
                        <button
                            disabled={
                                (step === 1 && (!campaignName || !selectedTemplateId)) ||
                                (step === 2 && selectedAccountIds.length === 0) ||
                                (step === 3 && selectedGroupIds.length === 0)
                            }
                            onClick={handleNext}
                            className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-[1.5rem] ds-font-body font-bold hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 disabled:opacity-30"
                        >
                            Tiếp theo <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                            className={cn(
                                "flex items-center gap-2.5 px-10 py-4 text-white rounded-[2rem] ds-font-body font-black transition-all shadow-2xl disabled:opacity-50 active:scale-95 ds-bg-primary")}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Rocket size={18} />}
                            {isSubmitting ? "Đang chuẩn bị..." : (initialData ? "Cập nhật chiến dịch" : "Kích hoạt ngay")}
                        </button>
                    )}
                </div>
            }
        >
            <div className="min-h-[45rem]">
                <StepProgress
                    steps={CAMPAIGN_STEPS}
                    currentStep={step}
                    className="mb-12"
                />

                {/* Step 1: Name & Template */}
                {step === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <div className="space-y-3">
                            <label className="ds-font-subtitle font-black text-zinc-500 px-1">Loại chiến dịch</label>
                            <div className="flex bg-white/[0.03] p-1.5 rounded-[24px] border border-white/5">
                                <button
                                    onClick={() => setCampaignType("AUTO_POST")}
                                    className={cn(
                                        "flex-1 flex flex-col items-center gap-2 py-6 rounded-[20px] transition-all",
                                        campaignType === "AUTO_POST"
                                            ? "ds-bg-primary"
                                            : "text-zinc-600 hover:text-zinc-400"
                                    )}
                                >
                                    <Rocket size={24} />
                                    <span className="ds-font-subtitle font-black">Tự động Đăng Bài</span>
                                </button>
                                <button
                                    onClick={() => setCampaignType("AUTO_COMMENT")}
                                    className={cn(
                                        "flex-1 flex flex-col items-center gap-2 py-6 rounded-[20px] transition-all",
                                        campaignType === "AUTO_COMMENT"
                                            ? "ds-bg-primary"
                                            : "text-zinc-600 hover:text-zinc-400"
                                    )}
                                >
                                    <MessagesSquare size={24} />
                                    <span className="ds-font-subtitle font-black">Tự động Comment</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="ds-font-subtitle font-black text-zinc-500 px-1">Mã hiệu chiến dịch</label>
                            <input
                                className="ds-input ds-font-body !h-14 !px-6"
                                placeholder={campaignType === "AUTO_POST" ? "Vd: Viral Sản phẩm (Đăng bài)" : "Vd: Kéo Traffic nhóm (Comment)"}
                                value={campaignName}
                                onChange={(e) => setCampaignName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="ds-font-subtitle font-black text-zinc-500 px-1">Chọn nội dung (Post Template)</label>
                            <div className="grid grid-cols-1 gap-2">
                                {templates.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTemplateId(t.id)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl border transition-all text-left group",
                                            selectedTemplateId === t.id
                                                ? "ds-border-primary"
                                                : "ds-border-normal"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", selectedTemplateId === t.id ? "ds-border-success" : "ds-border-normal")}>
                                                <LayoutTemplate size={16} />
                                            </div>
                                            <span className={cn("ds-font-label transition-colors", selectedTemplateId === t.id ? "text-white" : "text-zinc-300")}>{t.name}</span>
                                        </div>
                                        {selectedTemplateId === t.id && <CheckCircle2 size={16} className="ds-success-color" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Select Accounts */}
                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl mb-4">
                            <AlertCircle size={18} className="text-emerald-500" />
                            <p className="ds-font-subtitle font-bold text-emerald-400/80 leading-relaxed italic">Hệ thống sẽ thay phiên các tài khoản này để đăng bài, giúp giãn cách hành vi và giảm phát sinh spam.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {accounts.map((acc: any) => (
                                <button
                                    key={acc.id}
                                    onClick={() => toggleAccount(acc.id)}
                                    className={cn(
                                        "flex items-center gap-3 p-4 rounded-2xl border transition-all text-left",
                                        selectedAccountIds.includes(acc.id)
                                            ? "ds-border-primary"
                                            : "bg-white/[0.02] border-white/5 hover:border-white/10"
                                    )}
                                >
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden">
                                        <Users size={14} className={cn(selectedAccountIds.includes(acc.id) ? "ds-text-success" : "ds-text-normal")} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className={cn("ds-font-label truncate transition-colors")}>{acc.username}</span>
                                        <span className="ds-font-subtitle ds-text-success font-bold">● Đã sẵn sàng</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Select Groups */}
                {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-violet-500" size={16} />
                            <input
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:bg-white/5 transition-all ds-font-body shadow-inner"
                                placeholder="Tìm chính xác Tên nhóm muốn nhắm đến..."
                                value={groupSearch}
                                onChange={(e) => setGroupSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <span className="ds-font-subtitle text-zinc-500">Đã chọn ({selectedGroupIds.length}) nhóm mục tiêu</span>
                            <button
                                onClick={() => setSelectedGroupIds(filteredGroups.map(g => g.id))}
                                className="ds-font-subtitle font-black ds-text-primary"
                            >
                                CHỌN TẤT CẢ ({filteredGroups.length})
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {filteredGroups.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-zinc-600 text-xs italic">Không tìm thấy nhóm mục tiêu khả dụng từ tài khoản đã chọn.</p>
                                </div>
                            ) : filteredGroups.map(group => (
                                <button
                                    key={group.id}
                                    onClick={() => toggleGroup(group.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                                        selectedGroupIds.includes(group.id)
                                            ? "ds-border-primary"
                                            : "ds-border-normal"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <MessagesSquare size={14} className={cn(selectedGroupIds.includes(group.id) ? "ds-text-primary" : "ds-text-normal")} />
                                        <span className={cn("ds-font-label transition-colors ds-text-normal")}>{group.name}</span>
                                    </div>
                                    {selectedGroupIds.includes(group.id) && <CheckCircle2 size={14} className="ds-text-success" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Finalize & Schedule */}
                {step === 4 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 text-center">
                        <div className="inline-flex w-24 h-24 rounded-full bg-violet-600/10 items-center justify-center border border-violet-500/20 shadow-2xl relative mb-4">
                            <Rocket size={40} className="text-violet-500 animate-bounce" />
                        </div>

                        <div>
                            <h2 className="ds-font-title tracking-tighter text-white capitalize font-black ds-text-lg">Chiến dịch đã sẵn sàng chờ xác nhận!</h2>
                            <p className="ds-font-subtitle leading-relaxed opacity-70 font-bold mt-3 mx-auto">Vui lòng kiểm tra lại cấu hình lần cuối. Khi nhấn kích hoạt, hệ thống sẽ lưu tiến trình.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto bg-white/5 p-6 rounded-[2rem] border border-white/5">
                            <div className="text-center">
                                <p className="ds-text-sm opacity-40">Số lượng Acc</p>
                                <span className="ds-text-xl font-black text-white">{selectedAccountIds.length}</span>
                            </div>
                            <div className="text-center">
                                <p className="ds-text-sm opacity-40">Số lượng nhóm</p>
                                <span className="ds-text-xl font-black text-white">{selectedGroupIds.length}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-3 ds-text-success ds-text-base font-bold bg-emerald-500/5 px-6 py-3 rounded-2xl border border-emerald-500/10 active:animate-pulse">
                            <Clock size={16} />
                            Dự kiến hoàn tất: ~{Math.ceil((selectedGroupIds.length * 7) / 60)} giờ (Độ trễ an toàn)
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
