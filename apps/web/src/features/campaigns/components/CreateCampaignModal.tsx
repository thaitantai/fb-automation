"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
    Rocket, LayoutTemplate, Users, MessagesSquare,
    ArrowRight, ChevronLeft, CheckCircle2, Search,
    Loader2, AlertCircle, Clock, Sparkles, ShieldCheck,
    Zap, Globe, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { StepProgress, StepConfig } from "@/components/ui/StepProgress";
import { useTemplates } from "@/features/templates/hooks/useTemplates";
import { useGroupsMaster } from "@/features/groups/hooks/useGroupsMaster";
import { useCampaigns } from "../hooks/useCampaigns";
import { apiClient } from "@/lib/axios";
import { Campaign } from "../types";

const CAMPAIGN_STEPS: StepConfig[] = [
    { id: 1, label: "Loại chiến dịch", icon: Rocket },
    { id: 2, label: "Tài khoản", icon: Users },
    { id: 3, label: "Nhóm mục tiêu", icon: Globe },
    { id: 4, label: "Bảo vệ", icon: ShieldCheck },
    { id: 5, label: "Xác nhận", icon: Check }
];

interface ProtectionConfig {
    autoEmoji: boolean;
    autoHash: boolean;
    shuffleMedia: boolean;
    aiRewrite: boolean;
    aiPrompt: string;
    customEmojis?: string;
}

export interface CreateCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Campaign | null;
}

const DEFAULT_PROTECTION: ProtectionConfig = {
    autoEmoji: true,
    autoHash: true,
    shuffleMedia: false,
    aiRewrite: false,
    aiPrompt: ""
};

export function CreateCampaignModal({ isOpen, onClose, initialData }: CreateCampaignModalProps) {
    const { templates } = useTemplates();
    const { groups, accounts } = useGroupsMaster();
    const { createCampaign, updateCampaign } = useCampaigns();

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [campaignName, setCampaignName] = useState("");
    const [campaignType, setCampaignType] = useState<"AUTO_POST" | "AUTO_COMMENT">("AUTO_POST");
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
    const [protectionConfig, setProtectionConfig] = useState<ProtectionConfig>(DEFAULT_PROTECTION);
    const [delayConfig, setDelayConfig] = useState({ min: 3, max: 10 });
    const [groupSearch, setGroupSearch] = useState("");

    useEffect(() => {
        if (isOpen && initialData) {
            setCampaignName(initialData.name);
            setCampaignType(initialData.type as any || "AUTO_POST");
            setSelectedTemplateId(initialData.templateId || "");
            setSelectedAccountIds(
                Array.isArray(initialData.fbAccounts)
                    ? initialData.fbAccounts.map((a: any) => a.id)
                    : []
            );
            setSelectedGroupIds((initialData.targetConfigs as any)?.groupIds || []);
            const p = initialData.protectionConfig || {};
            setProtectionConfig({
                autoEmoji: Boolean(p.autoEmoji),
                autoHash: Boolean(p.autoHash),
                shuffleMedia: Boolean(p.shuffleMedia),
                aiRewrite: Boolean(p.aiRewrite),
                aiPrompt: p.aiPrompt || "",
                customEmojis: p.customEmojis || ""
            });
            setDelayConfig((initialData.delayConfig as any) || { min: 3, max: 10 });
        } else if (isOpen) {
            setCampaignName(""); setCampaignType("AUTO_POST");
            setSelectedTemplateId(""); setSelectedAccountIds([]);
            setSelectedGroupIds([]); setStep(1);
            setProtectionConfig(DEFAULT_PROTECTION);
            setDelayConfig({ min: 3, max: 10 });
        }
    }, [isOpen, initialData]);

    const relevantGroups = useMemo(
        () => groups.filter(g => selectedAccountIds.includes(g.fbAccountId)),
        [groups, selectedAccountIds]
    );
    const filteredGroups = useMemo(
        () => relevantGroups.filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase())),
        [relevantGroups, groupSearch]
    );

    const handleNext = () => setStep(p => p + 1);
    const handleBack = () => setStep(p => p - 1);

    const canNext =
        (step === 1 && !!campaignName && !!selectedTemplateId) ||
        (step === 2 && selectedAccountIds.length > 0) ||
        (step === 3 && selectedGroupIds.length > 0) ||
        step === 4;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const payload = {
            name: campaignName,
            type: campaignType,
            templateId: selectedTemplateId,
            fbAccountIds: selectedAccountIds,
            targetConfigs: { groupIds: selectedGroupIds },
            protectionConfig,
            delayConfig
        };
        const result = initialData
            ? await updateCampaign(initialData.id, payload)
            : await createCampaign(payload);
        setIsSubmitting(false);
        if (result.success) onClose();
    };

    const toggleAccount = (id: string) =>
        setSelectedAccountIds(p => p.includes(id) ? p.filter(a => a !== id) : [...p, id]);

    const toggleGroup = (id: string) =>
        setSelectedGroupIds(p => p.includes(id) ? p.filter(g => g !== id) : [...p, id]);

    const toggleProtection = (key: keyof ProtectionConfig) =>
        setProtectionConfig(p => ({ ...p, [key]: !p[key] }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            title={
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[2rem] bg-primary flex items-center justify-center text-white shadow-glow-blue border border-primary/20 shrink-0">
                        {initialData ? <ShieldCheck size={28} /> : <Rocket size={28} />}
                    </div>
                    <div>
                        <h2 className="text-foreground">
                            {initialData ? "Cập nhật chiến dịch" : "Tạo chiến dịch mới"}
                        </h2>
                        <h3 className="text-primary mt-2 opacity-80">
                            {initialData ? "Chỉnh sửa thông số cấu hình" : "Thiết lập robot tự động hóa chuyên nghiệp"}
                        </h3>
                    </div>
                </div>
            }
            footer={
                <div className="flex items-center justify-between w-full">
                    <button
                        disabled={step === 1 || isSubmitting}
                        onClick={handleBack}
                        className={cn(
                            "group flex items-center gap-2 px-6 py-3 rounded-2xl transition-all font-bold text-[1.4rem]",
                            step === 1 || isSubmitting
                                ? "opacity-30 cursor-not-allowed"
                                : "text-text-muted hover:text-foreground hover:bg-surface-3"
                        )}
                    >
                        <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                        Quay lại
                    </button>

                    <div className="flex items-center gap-4">
                        {step < 5 ? (
                            <button
                                disabled={!canNext}
                                onClick={handleNext}
                                className={cn(
                                    "group flex items-center gap-3 px-8 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-[1.3rem]",
                                    canNext
                                        ? "bg-primary text-white shadow-glow-blue hover:bg-primary-hover hover:-translate-y-0.5 active:scale-95"
                                        : "bg-surface-3 text-text-muted opacity-50 cursor-not-allowed"
                                )}
                            >
                                Tiếp tục
                                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </button>
                        ) : (
                            <button
                                disabled={isSubmitting}
                                onClick={handleSubmit}
                                className={cn(
                                    "flex items-center gap-3 px-10 py-5 rounded-[1.8rem] transition-all font-black uppercase tracking-widest text-[1.4rem] bg-primary text-white shadow-glow-blue hover:bg-primary-hover hover:-translate-y-1 active:scale-95",
                                    isSubmitting && "opacity-70 cursor-wait"
                                )}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                                {isSubmitting ? "Đang xử lý..." : (initialData ? "Lưu cấu hình" : "Kích hoạt Robot ngay")}
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <div className="min-h-[560px] flex flex-col gap-10">
                <StepProgress steps={CAMPAIGN_STEPS} currentStep={step} />

                {/* ─── Step 1: Type & Template ─────────────────── */}
                {step === 1 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                        {/* Campaign Type */}
                        <div className="space-y-4">
                            <label className="ds-font-label text-text-muted px-1">Loại chiến dịch mục tiêu</label>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { type: "AUTO_POST", label: "Robot Đăng Bài", icon: Rocket, desc: "Tự động đăng bài viết kèm hình ảnh/video lên các nhóm mục tiêu" },
                                    { type: "AUTO_COMMENT", label: "Robot Bình Luận", icon: MessagesSquare, desc: "Tự động tương tác bằng bình luận để duy trì traffic và seeding" }
                                ].map(opt => (
                                    <button
                                        key={opt.type}
                                        onClick={() => setCampaignType(opt.type as any)}
                                        className={cn(
                                            "relative flex flex-col items-start gap-4 p-6 rounded-[2rem] border transition-all duration-300 text-left group",
                                            campaignType === opt.type
                                                ? "bg-primary/5 border-primary shadow-[inset_0_0_20px_rgba(var(--primary),0.02)]"
                                                : "bg-surface-2 border-border hover:border-text-muted/30"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                            campaignType === opt.type
                                                ? "bg-primary text-white shadow-glow-blue"
                                                : "bg-surface-3 text-text-muted group-hover:text-foreground"
                                        )}>
                                            <opt.icon size={22} />
                                        </div>
                                        <div>
                                            <p className={cn(
                                                "text-[1.6rem] font-black uppercase tracking-tight transition-colors",
                                                campaignType === opt.type ? "text-primary" : "text-foreground"
                                            )}>
                                                {opt.label}
                                            </p>
                                            <p className="text-[1.3rem] text-text-muted mt-2 font-medium leading-relaxed italic opacity-70">
                                                {opt.desc}
                                            </p>
                                        </div>
                                        {campaignType === opt.type && (
                                            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-in zoom-in duration-300">
                                                <Check size={14} className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Campaign Name */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="ds-font-label text-text-muted px-1">Tên chiến dịch Robot</label>
                                <input
                                    className="h-[4.8rem] w-full bg-surface-2 border border-border rounded-2xl px-6 text-[1.4rem] font-bold focus:border-primary focus:bg-surface-3 transition-all outline-none"
                                    placeholder={campaignType === "AUTO_POST" ? "VD: Chiến dịch Sale Tết 2024" : "VD: Seeding Group Cộng Đồng"}
                                    value={campaignName}
                                    onChange={e => setCampaignName(e.target.value)}
                                />
                            </div>

                            {/* Template Selection */}
                            <div className="space-y-4">
                                <label className="ds-font-label text-text-muted px-1">Mẫu nội dung lập trình</label>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                                    {templates.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedTemplateId(t.id)}
                                            className={cn(
                                                "w-full flex items-center gap-4 rounded-2xl px-5 py-4 border transition-all duration-300 group",
                                                selectedTemplateId === t.id
                                                    ? "bg-primary/5 border-primary shadow-glow-blue/5"
                                                    : "bg-surface-2 border-border hover:bg-surface-3"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                                                selectedTemplateId === t.id ? "bg-primary text-white" : "bg-surface-3 text-text-muted group-hover:text-foreground"
                                            )}>
                                                <LayoutTemplate size={18} />
                                            </div>
                                            <span className={cn(
                                                "font-bold text-[1.5rem] flex-1 text-left truncate",
                                                selectedTemplateId === t.id ? "text-primary" : "text-foreground"
                                            )}>{t.name}</span>
                                            {selectedTemplateId === t.id && (
                                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                                                    <Check size={12} className="text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                    {templates.length === 0 && (
                                        <div className="p-10 border border-dashed border-border rounded-2xl text-center">
                                            <p className="text-[1.3rem] text-text-muted font-medium italic opacity-60">Bạn chưa tạo mẫu nội dung nào.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Step 2: Accounts ────────────────────────── */}
                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="callout-info">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <p className="text-[1.4rem] leading-relaxed">
                                Robot sẽ luân phiên sử dụng danh sách tài khoản dưới đây để mô phỏng hành vi người dùng thật. Hãy chọn ít nhất 1 tài khoản để bắt đầu.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-left">
                            {accounts.map((acc: any) => {
                                const sel = selectedAccountIds.includes(acc.id);
                                return (
                                    <button
                                        key={acc.id}
                                        onClick={() => toggleAccount(acc.id)}
                                        className={cn(
                                            "relative flex items-center gap-5 p-5 rounded-[2rem] border transition-all duration-300 group",
                                            sel
                                                ? "bg-primary/5 border-primary shadow-glow-blue/5"
                                                : "bg-surface-2 border-border hover:bg-surface-3"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0",
                                            sel ? "bg-primary text-white shadow-glow-blue" : "bg-surface-3 text-text-muted group-hover:text-foreground"
                                        )}>
                                            <Users size={22} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={cn(
                                                "text-[1.5rem] text-start font-bold truncate transition-colors",
                                                sel ? "text-primary" : "text-foreground"
                                            )}>
                                                {acc.username}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 px-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" />
                                                <span className="text-[1.1rem] text-success font-black uppercase tracking-wider">Sẵn sàng</span>
                                            </div>
                                        </div>
                                        {sel && (
                                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-in zoom-in duration-300">
                                                <Check size={14} className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ─── Step 3: Groups ──────────────────────────── */}
                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="relative group">
                            <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                className="h-[5.2rem] w-full bg-surface-2 border border-border rounded-[1.2rem] pl-16 pr-6 text-[1.5rem] font-medium focus:border-primary focus:bg-surface-3 transition-all outline-none"
                                placeholder="Tìm kiếm nhóm mục tiêu theo từ khóa..."
                                value={groupSearch}
                                onChange={e => setGroupSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "flex items-center justify-center p-2 rounded-lg bg-surface-2 border border-border font-black text-[1.1rem] uppercase tracking-widest",
                                    selectedGroupIds.length > 0 ? "text-primary border-primary/20 bg-primary/5" : "text-text-muted"
                                )}>
                                    Đã chọn {selectedGroupIds.length} nhóm
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedGroupIds(filteredGroups.map(g => g.id))}
                                className=" text-primary hover:underline hover:underline-offset-4"
                            >
                                Chọn tất cả nhóm
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide text-left">
                            {filteredGroups.length === 0 ? (
                                <div className="py-20 text-center space-y-4 opacity-40">
                                    <Globe size={48} className="mx-auto" />
                                    <p className="text-[1.4rem] font-medium">Không tìm thấy nhóm khả dụng nào.</p>
                                </div>
                            ) : filteredGroups.map(group => {
                                const sel = selectedGroupIds.includes(group.id);
                                return (
                                    <button
                                        key={group.id}
                                        onClick={() => toggleGroup(group.id)}
                                        className={cn(
                                            "flex items-center gap-5 p-4 rounded-2xl border transition-all duration-300 group",
                                            sel
                                                ? "bg-primary/5 border-primary shadow-glow-blue/5"
                                                : "bg-surface-2 border-border hover:bg-surface-3"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                            sel ? "bg-primary text-white" : "bg-surface-3 text-text-muted group-hover:text-foreground"
                                        )}>
                                            <Globe size={18} />
                                        </div>
                                        <span className={cn(
                                            "text-[1.4rem] text-start font-bold flex-1 truncate transition-colors",
                                            sel ? "text-primary" : "text-foreground"
                                        )}>
                                            {group.name}
                                        </span>
                                        {sel && (
                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-in zoom-in duration-300">
                                                <Check size={12} className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ─── Step 4: Protection Config ───────────────── */}
                {step === 4 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        {/* Top: AI Content Rewriter */}
                        <div className="space-y-4">
                            <label className="ds-font-label text-text-muted px-1">Trí tuệ nhân tạo (AI Content Rewriter)</label>
                            <div className={cn(
                                "relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden",
                                protectionConfig.aiRewrite
                                    ? "border-primary bg-primary/[0.03] shadow-glow-blue/5"
                                    : "bg-surface-2 border-border hover:border-text-muted/30"
                            )}>
                                {protectionConfig.aiRewrite && (
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-[100px] pointer-events-none" />
                                )}

                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "w-16 h-16 rounded-[2rem] flex items-center justify-center shrink-0 shadow-lg transition-all duration-700",
                                            protectionConfig.aiRewrite ? "bg-primary text-white shadow-glow-blue scale-110" : "bg-surface-3 text-text-muted"
                                        )}>
                                            <Sparkles size={32} />
                                        </div>
                                        <div>
                                            <p className="text-[1.8rem] font-black text-foreground tracking-tight">Gemini AI Rewrite</p>
                                            <p className="text-[1.3rem] text-text-muted font-medium opacity-80">Tự động tạo ra hàng ngàn biến thể nội dung duy nhất bằng trí tuệ nhân tạo</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleProtection("aiRewrite")}
                                        className={cn(
                                            "w-14 h-8 rounded-full transition-all duration-300 relative px-1 flex items-center shrink-0",
                                            protectionConfig.aiRewrite ? "bg-primary" : "bg-surface-3"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
                                            protectionConfig.aiRewrite ? "translate-x-6" : "translate-x-0"
                                        )} />
                                    </button>
                                </div>

                                {protectionConfig.aiRewrite ? (
                                    <div className="space-y-4 animate-in zoom-in-95 fade-in duration-500 relative z-10 text-left">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[1.1rem] font-black text-primary uppercase tracking-widest">Mô tả phong cách & Robot Prompt</label>
                                            <span className="text-[1.1rem] text-text-muted italic opacity-60">Robot sẽ học theo yêu cầu của bạn</span>
                                        </div>
                                        <textarea
                                            className="w-full bg-surface-1/50 border border-primary/20 rounded-2xl p-6 text-[1.4rem] font-medium leading-relaxed resize-none min-h-[160px] focus:border-primary transition-all outline-none"
                                            placeholder="VD: Hãy viết lại theo phong cách Gen Z năng động, thêm nhiều emoji phù hợp và hãy giữ nguyên thông tin quan trọng về giá bán và đường link."
                                            value={protectionConfig.aiPrompt}
                                            onChange={e => setProtectionConfig(p => ({ ...p, aiPrompt: e.target.value }))}
                                        />
                                    </div>
                                ) : (
                                    <div className="py-6 text-center border border-dashed border-border rounded-2xl bg-surface-3/30">
                                        <p className="text-[1.3rem] text-text-muted font-medium italic">Kích hoạt AI để bài viết của bạn không bao giờ bị Facebook đánh dấu trùng lặp.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom: Two-column grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                            <div className="space-y-4">
                                <label className="ds-font-label text-text-muted px-1">Bảo mật bổ sung</label>
                                <div className="space-y-3">
                                    {[
                                        { key: "autoEmoji", label: "Emoji Ngẫu Nhiên", desc: "Tự động chèn biểu cảm linh hoạt", icon: MessagesSquare },
                                        { key: "autoHash", label: "HashID Ẩn Danh", desc: "Gán mã định danh duy nhất cho bài viết", icon: ShieldCheck },
                                        { key: "shuffleMedia", label: "Xáo Trộn Media", desc: "Đổi thứ tự ảnh/video khi đăng", icon: LayoutTemplate }
                                    ].map(opt => {
                                        const isOn = Boolean((protectionConfig as any)[opt.key]);
                                        return (
                                            <div key={opt.key} className={cn(
                                                "p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300",
                                                isOn ? "bg-primary/5 border-primary shadow-glow-blue/5" : "bg-surface-2 border-border"
                                            )}>
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                        isOn ? "bg-primary text-white shadow-glow-blue" : "bg-surface-3 text-text-muted"
                                                    )}>
                                                        <opt.icon size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[1.4rem] font-bold text-foreground">{opt.label}</p>
                                                        <p className="text-[1.1rem] text-text-muted font-medium">{opt.desc}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleProtection(opt.key as any)}
                                                    className={cn(
                                                        "w-10 h-6 rounded-full transition-all duration-300 relative px-1 flex items-center shrink-0",
                                                        isOn ? "bg-primary" : "bg-surface-3"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300",
                                                        isOn ? "translate-x-4" : "translate-x-0"
                                                    )} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="ds-font-label text-text-muted px-1">Lập trình thời gian chờ (Delay)</label>
                                <div className="bg-surface-2 border border-border rounded-[2rem] p-6 space-y-6 flex flex-col h-full">
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: "Tối thiểu", key: "min" },
                                            { label: "Tối đa", key: "max" }
                                        ].map(item => (
                                            <div key={item.key} className="space-y-2">
                                                <label className="text-[1.1rem] font-black text-text-muted uppercase tracking-widest px-1">{item.label}</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={(delayConfig as any)[item.key]}
                                                        onChange={e => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            setDelayConfig(p => ({
                                                                ...p,
                                                                [item.key]: item.key === "max" ? Math.max(p.min + 1, val) : Math.min(p.max - 1, val)
                                                            }));
                                                        }}
                                                        className="h-[4.8rem] w-full bg-surface-1 border border-border rounded-xl px-4 pr-16 text-[1.6rem] font-black outline-none focus:border-primary transition-all"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[1rem] font-black text-text-muted uppercase">Phút</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-auto callout-success flex items-center gap-3 p-4 rounded-xl border border-success/10 bg-success/5">
                                        <ShieldCheck size={18} className="text-success shrink-0" />
                                        <p className="text-[1.2rem] font-medium leading-relaxed">
                                            Robot khuyên dùng: <strong className="text-foreground">3 – 10 phút</strong> cho các chiến dịch quy mô lớn để bảo vệ tài khoản tối đa.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Step 5: Confirm ─────────────────────────── */}
                {step === 5 && (
                    <div className="flex flex-col items-center text-center gap-12 animate-in zoom-in-95 fade-in duration-700 py-12 px-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
                            <div className="w-32 h-32 rounded-[2.5rem] bg-primary flex items-center justify-center text-white relative z-10 shadow-glow-blue border-4 border-white/10 scale-110">
                                <Rocket size={56} className="animate-bounce" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="ds-font-title text-foreground capitalize tracking-[0.2em]">Sẵn sàng khởi động!</h3>
                            <p className="text-text-secondary text-[1.6rem] max-w-lg mx-auto font-medium opacity-80 italic">
                                "Hành trình vạn dặm bắt đầu từ một cú Click. Robot của bạn đã sẵn sàng làm chủ cuộc chơi."
                            </p>
                        </div>

                        <div className="w-full max-w-2xl bg-surface-2 border-2 border-dashed border-border rounded-[2.5rem] p-8 grid grid-cols-2 gap-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl" />

                            <div className="col-span-2 flex items-center justify-between pb-6 border-b border-border">
                                <div className="text-left">
                                    <label className="ds-font-label text-text-muted">Chiến dịch lập trình</label>
                                    <p className="text-[2.4rem] font-black text-foreground truncate max-w-[300px] mt-1 tracking-tight">{campaignName}</p>
                                </div>
                                <div className="px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[1.1rem] uppercase tracking-widest">
                                    {campaignType === "AUTO_POST" ? "Robot Đăng Bài" : "Robot Bình Luận"}
                                </div>
                            </div>

                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-[1.8rem] bg-surface-3 flex items-center justify-center text-primary group hover:scale-110 transition-transform">
                                    <Users size={32} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[3.2rem] font-black text-foreground leading-none tracking-tight">{selectedAccountIds.length}</p>
                                    <p className="ds-font-label text-text-muted mt-1">Tài khoản</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-[1.8rem] bg-surface-3 flex items-center justify-center text-primary group hover:scale-110 transition-transform">
                                    <Globe size={32} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[3.2rem] font-black text-foreground leading-none tracking-tight">{selectedGroupIds.length}</p>
                                    <p className="ds-font-label text-text-muted mt-1">Nhóm mục tiêu</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 py-4 px-8 rounded-2xl bg-primary/5 border border-primary/10 text-text-secondary ds-font-label">
                            <Clock size={16} className="text-primary animate-spin-slow" />
                            <span>Ước tính robot hoàn tất: <strong className="text-primary">~{Math.max(1, Math.ceil((selectedGroupIds.length * 7) / 60))} giờ làm việc</strong></span>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
