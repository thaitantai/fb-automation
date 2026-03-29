"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
    X, Rocket, LayoutTemplate, Users, Component, 
    ArrowRight, ChevronLeft, CheckCircle2, Search,
    Loader2, AlertCircle, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePostTemplates } from "@/features/posts/hooks/usePostTemplates";
import { useGroupsMaster } from "@/features/groups/hooks/useGroupsMaster";
import { useCampaigns } from "../hooks/useCampaigns";

import { Campaign } from "../types";

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
            setSelectedTemplateId(initialData.templateId || "");
            setSelectedAccountIds(Array.isArray(initialData.fbAccounts) ? initialData.fbAccounts.map((a: any) => a.id) : []);
            setSelectedGroupIds((initialData.targetConfigs as any)?.groupIds || []);
        } else if (isOpen) {
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
            type: "AUTO_POST",
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

    if (!isOpen || !mounted) return null;

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

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#0c0c0c] border border-white/5 w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]">
                
                {/* Header (Premium Gradient) */}
                <div className="p-6 bg-gradient-to-r from-violet-600/10 to-transparent flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/20">
                            <Rocket size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">
                                {initialData ? "Cập nhật Cấu hình Robot" : "Ký gửi Chiến dịch mới"}
                            </h3>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Bước {step} của 4: Hoàn tất cấu hình Robot</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-white/5 text-zinc-500 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Content (Body) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    
                    {/* Step 1: Name & Template */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Mã hiệu chiến dịch</label>
                                <input 
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white focus:border-violet-500/50 outline-none transition-all placeholder:text-zinc-700 font-bold"
                                    placeholder="Vd: Chiến dịch Viral Sản phẩm Tháng 4"
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Chọn nội dung (Post Template)</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {templates.map(t => (
                                        <button 
                                            key={t.id}
                                            onClick={() => setSelectedTemplateId(t.id)}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-2xl border transition-all text-left group",
                                                selectedTemplateId === t.id 
                                                    ? "bg-violet-600/10 border-violet-500 shadow-lg" 
                                                    : "bg-white/[0.02] border-white/5 hover:border-white/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", selectedTemplateId === t.id ? "bg-violet-600 text-white" : "bg-white/5 text-zinc-600")}>
                                                    <LayoutTemplate size={16} />
                                                </div>
                                                <span className={cn("text-xs font-bold transition-colors", selectedTemplateId === t.id ? "text-white" : "text-zinc-400")}>{t.name}</span>
                                            </div>
                                            {selectedTemplateId === t.id && <CheckCircle2 size={16} className="text-violet-500" />}
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
                                <p className="text-[11px] text-emerald-400/80 leading-relaxed italic">Hệ thống sẽ thay phiên các tài khoản này để đăng bài, giúp giãn cách hành vi và giảm phát sinh spam.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {accounts.map((acc: any) => (
                                    <button 
                                        key={acc.id}
                                        onClick={() => toggleAccount(acc.id)}
                                        className={cn(
                                            "flex items-center gap-3 p-4 rounded-2xl border transition-all text-left",
                                            selectedAccountIds.includes(acc.id)
                                                ? "bg-emerald-600/10 border-emerald-500 shadow-md"
                                                : "bg-white/[0.02] border-white/5 hover:border-white/10"
                                        )}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden">
                                           <Users size={14} className={cn(selectedAccountIds.includes(acc.id) ? "text-emerald-500" : "text-zinc-600")} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className={cn("text-[11px] font-bold truncate transition-colors", selectedAccountIds.includes(acc.id) ? "text-emerald-400" : "text-zinc-400")}>{acc.username}</span>
                                            <span className="text-[9px] text-zinc-600 uppercase tracking-tighter">Đã sẵn sàng</span>
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
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:bg-white/5 transition-all"
                                    placeholder="Tìm chính xác Tên nhóm muốn nhắm đến..."
                                    value={groupSearch}
                                    onChange={(e) => setGroupSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] font-bold text-zinc-500">Đã chọn {selectedGroupIds.length} nhóm mục tiêu</span>
                                <button 
                                    onClick={() => setSelectedGroupIds(filteredGroups.map(g => g.id))}
                                    className="text-[10px] font-bold text-violet-500 hover:underline"
                                >
                                    Chọn tất cả kết quả
                                </button>
                            </div>

                            <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
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
                                                ? "bg-pink-600/10 border-pink-500/30"
                                                : "bg-white/[0.01] border-white/5 hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Component size={14} className={cn(selectedGroupIds.includes(group.id) ? "text-pink-500" : "text-zinc-700")} />
                                            <span className={cn("text-xs transition-colors", selectedGroupIds.includes(group.id) ? "text-white" : "text-zinc-400")}>{group.name}</span>
                                        </div>
                                        {selectedGroupIds.includes(group.id) && <CheckCircle2 size={14} className="text-pink-500" />}
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
                                <h3 className="text-2xl font-black text-white px-10">Huấn lệnh Robot sẵn sàng cất cánh!</h3>
                                <p className="text-zinc-500 text-sm mt-3 max-w-md mx-auto">Vui lòng kiểm tra lại cấu hình lần cuối. Khi nhấn kích hoạt, hệ thống sẽ tự động đăng bài theo lịch trình của bạn.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto bg-white/5 p-6 rounded-3xl border border-white/5">
                                <div className="text-center">
                                    <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1">Tài khoản</p>
                                    <span className="text-lg font-bold text-white">{selectedAccountIds.length}</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1">Nhóm đích</p>
                                    <span className="text-lg font-bold text-white">{selectedGroupIds.length}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-zinc-600 text-[11px] italic">
                                <Clock size={12} />
                                Dự kiến hoàn tất sau {Math.ceil((selectedGroupIds.length * 7) / 60)} giờ (An toàn tối đa)
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer (Controls) */}
                <div className="p-6 bg-black/40 border-t border-white/5 flex items-center justify-between">
                    <button 
                        disabled={step === 1 || isSubmitting}
                        onClick={handleBack}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white/5 text-zinc-400 rounded-xl text-sm font-bold hover:bg-white/10 transition-all disabled:opacity-0"
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
                            className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-2xl text-sm font-bold hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 disabled:opacity-30"
                        >
                            Tiếp theo <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button 
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-10 py-3 bg-violet-600 text-white rounded-2xl text-sm font-black hover:bg-violet-500 transition-all shadow-2xl shadow-violet-600/40 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Rocket size={18} />}
                            {isSubmitting ? "Đang chuẩn bị..." : (initialData ? "CẬP NHẬT NGAY" : "KÍCH HOẠT NGAY")}
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
