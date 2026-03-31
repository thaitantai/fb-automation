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
import { usePostTemplates } from "@/features/posts/hooks/usePostTemplates";
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
    const { templates } = usePostTemplates();
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

    /* ── Render ──────────────────────────────────────── */
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            title={
                <div className="flex items-center gap-4">
                    <div style={{ background: "hsl(var(--primary))", boxShadow: "var(--shadow-glow-blue)" }}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white">
                        {initialData ? <ShieldCheck size={22} /> : <Rocket size={22} />}
                    </div>
                    <div>
                        <h2 className="text-[22px] font-bold tracking-tight text-white leading-none">
                            {initialData ? "Cập nhật chiến dịch" : "Tạo chiến dịch mới"}
                        </h2>
                        <p className="section-label mt-1">
                            {initialData ? "Chỉnh sửa thông số cấu hình" : "Thiết lập robot tự động hóa từng bước"}
                        </p>
                    </div>
                </div>
            }
            footer={
                <div className="flex items-center justify-between w-full">
                    <button
                        disabled={step === 1 || isSubmitting}
                        onClick={handleBack}
                        className="btn-secondary btn-md"
                    >
                        <ChevronLeft size={16} /> Quay lại
                    </button>
                    {step < 5 ? (
                        <button
                            disabled={!canNext}
                            onClick={handleNext}
                            className="btn-primary btn-md"
                        >
                            Tiếp theo <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                            className="btn-primary btn-lg"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                            {isSubmitting ? "Đang xử lý..." : (initialData ? "Lưu thay đổi" : "Kích hoạt ngay")}
                        </button>
                    )}
                </div>
            }
        >
            <div className="min-h-[520px] flex flex-col gap-8">
                <StepProgress steps={CAMPAIGN_STEPS} currentStep={step} />

                {/* ─── Step 1: Type & Template ─────────────────── */}
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Campaign Type */}
                        <div className="space-y-3">
                            <p className="section-label">Loại chiến dịch</p>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { type: "AUTO_POST", label: "Tự động đăng bài", icon: Rocket, desc: "Bot sẽ đăng bài lên các nhóm" },
                                    { type: "AUTO_COMMENT", label: "Tự động bình luận", icon: MessagesSquare, desc: "Bot sẽ comment để kéo traffic" }
                                ].map(opt => (
                                    <button
                                        key={opt.type}
                                        onClick={() => setCampaignType(opt.type as any)}
                                        className={cn("option-card flex-col items-start gap-3 p-5", campaignType === opt.type && "selected")}
                                    >
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                            campaignType === opt.type
                                                ? "bg-blue-500 text-white"
                                                : "bg-surface-2 text-muted"
                                        )}>
                                            <opt.icon size={20} />
                                        </div>
                                        <div>
                                            <p className={cn("font-semibold text-[14px]", campaignType === opt.type ? "text-white" : "text-secondary")}>
                                                {opt.label}
                                            </p>
                                            <p className="text-[12px] text-muted mt-0.5">{opt.desc}</p>
                                        </div>
                                        {campaignType === opt.type && (
                                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                                <Check size={12} className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Campaign Name */}
                        <div className="space-y-3">
                            <p className="section-label">Tên chiến dịch</p>
                            <input
                                className="input"
                                placeholder={campaignType === "AUTO_POST" ? "VD: Đăng bài sản phẩm tháng 4" : "VD: Comment kéo traffic nhóm lớn"}
                                value={campaignName}
                                onChange={e => setCampaignName(e.target.value)}
                            />
                        </div>

                        {/* Template Selection */}
                        <div className="space-y-3">
                            <p className="section-label">Mẫu nội dung</p>
                            <div className="space-y-2">
                                {templates.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTemplateId(t.id)}
                                        className={cn(
                                            "list-item w-full flex flex-nowrap items-center justify-between rounded-2xl px-4 py-3",
                                            selectedTemplateId === t.id
                                                ? "ds-border ds-border-primary ds-bg-primary/10 glow-blue"
                                                : "ds-border ds-border-normal"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden px-1">
                                            <div className={cn(
                                                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                                                selectedTemplateId === t.id ? "bg-blue-500 text-white" : "bg-surface-2"
                                            )}>
                                                <LayoutTemplate size={16} className={selectedTemplateId === t.id ? "text-white" : "text-muted"} />
                                            </div>
                                            <span className={cn(
                                                "font-medium text-[16px] truncate block",
                                                selectedTemplateId === t.id ? "text-white" : "text-secondary"
                                            )}>{t.name}</span>
                                        </div>
                                        {selectedTemplateId === t.id && (
                                            <CheckCircle2 size={18} className="text-blue-400 shrink-0 ml-3" />
                                        )}
                                    </button>
                                ))}
                                {templates.length === 0 && (
                                    <div className="empty-state py-10">
                                        <p className="empty-state-desc">Chưa có mẫu nội dung nào. Hãy tạo mẫu trước.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Step 2: Accounts ────────────────────────── */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="callout-info">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <p>Hệ thống sẽ luân phiên các tài khoản này để đảm bảo an toàn. Chọn nhiều tài khoản để phủ rộng hơn.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {accounts.map((acc: any) => {
                                const sel = selectedAccountIds.includes(acc.id);
                                return (
                                    <button
                                        key={acc.id}
                                        onClick={() => toggleAccount(acc.id)}
                                        className={cn(
                                            "option-card flex flex-nowrap items-center gap-4 rounded-2xl",
                                            sel
                                                ? "ds-border ds-border-primary ds-bg-primary/10"
                                                : "ds-border ds-border-normal"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                                            sel ? "bg-blue-500 text-white" : "bg-surface-2"
                                        )}>
                                            <Users size={18} className={sel ? "text-white" : "text-muted"} />
                                        </div>
                                        <div className="min-w-0 flex-1 overflow-hidden px-1">
                                            <p className={cn("font-semibold text-[16px] truncate", sel ? "text-white" : "text-secondary")}>
                                                {acc.username}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                                                <span className="text-[11px] text-emerald-500 font-medium truncate">Đang hoạt động</span>
                                            </div>
                                        </div>
                                        {sel && <CheckCircle2 size={18} className="text-blue-400 shrink-0 ml-auto" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ─── Step 3: Groups ──────────────────────────── */}
                {step === 3 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                className="input pl-11"
                                placeholder="Tìm nhóm theo tên..."
                                value={groupSearch}
                                onChange={e => setGroupSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] text-secondary">
                                Đã chọn <strong className="text-white">{selectedGroupIds.length}</strong> / {filteredGroups.length} nhóm
                            </span>
                            <button
                                onClick={() => setSelectedGroupIds(filteredGroups.map(g => g.id))}
                                className="btn-ghost btn-sm"
                            >
                                Chọn tất cả
                            </button>
                        </div>
                        <div className="space-y-2">
                            {filteredGroups.length === 0 ? (
                                <div className="empty-state py-12">
                                    <Globe size={40} className="empty-state-icon" />
                                    <p className="empty-state-desc">Không tìm thấy nhóm nào từ tài khoản đã chọn.</p>
                                </div>
                            ) : filteredGroups.map(group => {
                                const sel = selectedGroupIds.includes(group.id);
                                return (
                                    <button
                                        key={group.id}
                                        onClick={() => toggleGroup(group.id)}
                                        className={cn(
                                            "p-3 list-item w-full flex flex-nowrap items-center justify-between rounded-2xl",
                                            sel
                                                ? "ds-border ds-border-primary ds-bg-primary/10"
                                                : "ds-border ds-border-normal"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden px-1">
                                            <Globe size={16} className={cn("shrink-0", sel ? "text-blue-400" : "text-muted")} />
                                            <span className={cn(
                                                "text-[14px] font-medium truncate block",
                                                sel ? "text-white" : "text-secondary"
                                            )}>
                                                {group.name}
                                            </span>
                                        </div>
                                        {sel && <CheckCircle2 size={16} className="text-blue-400 shrink-0 ml-3" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ─── Step 4: Protection Config ───────────────── */}
                {step === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Top: AI Content Rewriter (Full Width for Maximum Space) */}
                        <div className="space-y-3">
                            <p className="section-label">Trí tuệ nhân tạo (AI Content Rewriter)</p>
                            <div className={cn(
                                "card p-6 transition-all duration-300 border-2",
                                protectionConfig.aiRewrite
                                    ? "border-amber-500/30 bg-amber-500/[0.02] glow-amber"
                                    : "border-border-subtle hover:border-border-strong"
                            )}>
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform",
                                            protectionConfig.aiRewrite ? "bg-amber-500 text-white scale-105" : "bg-surface-2 text-muted"
                                        )}>
                                            <Sparkles size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-[16px] text-white">AI Content Rewriter</p>
                                            <p className="text-[12px] text-muted">Sử dụng Gemini AI để tạo ra hàng ngàn biến thể nội dung duy nhất</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleProtection("aiRewrite")}
                                        className={cn("toggle-track scale-125", protectionConfig.aiRewrite && "active")}
                                    >
                                        <div className="toggle-thumb" />
                                    </button>
                                </div>

                                {protectionConfig.aiRewrite ? (
                                    <div className="space-y-3 animate-in zoom-in-95 duration-300">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">Mô tả phong cách & Prompt</label>
                                            <span className="text-[10px] text-muted italic">Mẹo: Prompt càng chi tiết nội dung càng tự nhiên</span>
                                        </div>
                                        <textarea
                                            className="input w-full text-[14px] leading-relaxed resize-none min-h-[140px] border-amber-500/20 focus:border-amber-500/50 bg-amber-500/[0.01]"
                                            placeholder="VD: Viết lại nội dung trên theo phong cách hài hước của Gen Z, sử dụng nhiều emoji liên quan đến sản phẩm, hãy giữ nguyên các thông tin quan trọng về giá và link liên hệ..."
                                            value={protectionConfig.aiPrompt}
                                            onChange={e => setProtectionConfig(p => ({ ...p, aiPrompt: e.target.value }))}
                                        />
                                    </div>
                                ) : (
                                    <div className="py-4 text-center border border-dashed border-border-subtle rounded-xl bg-surface-2/50">
                                        <p className="text-[13px] text-muted">Bật AI Rewriter để bài viết của bạn không bao giờ bị trùng lặp</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom: Two-column grid for Toggles and Delay */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left: Secondary Protection Toggles */}
                            <div className="space-y-3">
                                <p className="section-label">Lớp bảo vệ bổ sung</p>
                                <div className="grid grid-cols-1 gap-2.5">
                                    {[
                                        { key: "autoEmoji", label: "Emoji ngẫu nhiên", desc: "Chèn linh hoạt", icon: MessagesSquare },
                                        { key: "autoHash", label: "Hash ID ẩn danh", desc: "Mã định danh unique", icon: ShieldCheck },
                                        { key: "shuffleMedia", label: "Xáo trộn Media", desc: "Đổi thứ tự ảnh/video", icon: LayoutTemplate }
                                    ].map(opt => {
                                        const isOn = Boolean((protectionConfig as any)[opt.key]);
                                        return (
                                            <div key={opt.key} className={cn(
                                                "card p-4 flex items-center justify-between gap-4 transition-all duration-200",
                                                isOn && "ds-border ds-border-primary/20 bg-primary/[0.02]"
                                            )}>
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                                                        isOn ? "bg-blue-500/20 text-blue-400" : "bg-surface-2 text-muted"
                                                    )}>
                                                        <opt.icon size={18} />
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="font-bold text-[13px] text-white truncate">{opt.label}</p>
                                                        <p className="text-[11px] text-muted truncate">{opt.desc}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleProtection(opt.key as any)}
                                                    className={cn("toggle-track", isOn && "active")}
                                                >
                                                    <div className="toggle-thumb" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right: Delay Settings (Ultra Compact) */}
                            <div className="space-y-3">
                                <p className="section-label">Thời gian chờ (Delay)</p>
                                <div className="card p-5 space-y-4 relative overflow-hidden h-full">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-3xl pointer-events-none" />

                                    <div className="grid grid-cols-2 gap-3 pb-2">
                                        {[
                                            { label: "Tối thiểu", key: "min", min: 1, max: 60 },
                                            { label: "Tối đa", key: "max", min: 2, max: 120 }
                                        ].map(item => (
                                            <div key={item.key} className="space-y-1.5">
                                                <label className="text-[10px] text-secondary font-black uppercase tracking-wider pl-1">{item.label}</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min={item.min}
                                                        max={item.max}
                                                        value={(delayConfig as any)[item.key]}
                                                        onChange={e => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            setDelayConfig(p => ({
                                                                ...p,
                                                                [item.key]: item.key === "max"
                                                                    ? Math.max(p.min + 1, val)
                                                                    : Math.min(p.max - 1, val)
                                                            }));
                                                        }}
                                                        className="input w-full pr-14 font-black text-[15px]"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-muted font-black uppercase">Phút</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="callout-success py-3 px-3 rounded-xl border border-success/10 bg-success/[0.03] mt-auto">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck size={14} className="shrink-0 text-success" />
                                            <span className="text-[10px] leading-tight flex-1">Khuyên dùng: <strong className="text-white">3–10 phút</strong> để hoạt động bền vững.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Step 5: Confirm ─────────────────────────── */}
                {step === 5 && (
                    <div className="flex flex-col items-center text-center gap-10 animate-in zoom-in-95 fade-in duration-500 py-12 px-6">
                        {/* Launch Icon with enhanced glow */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/30 blur-[40px] rounded-full" />
                            <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white relative z-10 shadow-2xl scale-110 border-4 border-white/10">
                                <Rocket size={48} className="animate-bounce-slow" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-[32px] font-black text-white tracking-widest uppercase">Sẵn sàng kích hoạt!</h3>
                            <p className="text-secondary text-[16px] max-w-sm mx-auto font-medium">
                                Mọi thứ đã sẵn sàng. Robot sẽ thay bạn thực hiện các chiến dịch ngay bây giờ.
                            </p>
                        </div>

                        {/* Summary Info Card */}
                        <div className="w-full max-w-xl card p-6 bg-white/[0.03] space-y-4 border-dashed border-2 border-white/10">
                            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                <div className="text-left">
                                    <p className="text-[11px] text-muted font-black uppercase tracking-widest">Chiến dịch</p>
                                    <p className="text-[18px] font-bold text-white truncate max-w-[240px]">{campaignName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] text-muted font-black uppercase tracking-widest">Loại</p>
                                    <div className="badge-blue mt-1">
                                        {campaignType === "AUTO_POST" ? "Đăng bài" : "Bình luận"}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 pt-2">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <Globe size={28} className="text-purple-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[32px] font-black text-white leading-none tracking-tight">{selectedAccountIds.length}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <Users size={28} className="text-blue-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[32px] font-black text-white leading-none tracking-tight">{selectedGroupIds.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-3 py-3 px-6 rounded-2xl bg-surface-2 border border-white/5 text-muted-foreground text-[14px]">
                            <Clock size={16} className="text-blue-400" />
                            <span>Ước tính hoàn thành: <strong className="text-white">~{Math.max(1, Math.ceil((selectedGroupIds.length * 7) / 60))} giờ</strong></span>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
