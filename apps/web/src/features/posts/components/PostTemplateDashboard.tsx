"use client";

import React, { useState, useMemo } from "react";
import { 
    LayoutTemplate, Plus, Search, Trash2, Save, 
    Image as ImageIcon, Type, Sparkles, AlertCircle, 
    MoreVertical, ChevronRight, Eye, RefreshCcw, Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePostTemplates } from "../hooks/usePostTemplates";
import { PostTemplate } from "../types";

export function PostTemplateDashboard() {
    const { 
        templates, 
        loading, 
        createTemplate, 
        updateTemplate, 
        deleteTemplate 
    } = usePostTemplates();

    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"ALL" | "POST" | "COMMENT">("ALL");
    const [isSaving, setIsSaving] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [type, setType] = useState<"POST" | "COMMENT">("POST");
    const [content, setContent] = useState("");
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [newMediaUrl, setNewMediaUrl] = useState("");

    const filteredTemplates = useMemo(() => 
        templates.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTab = activeTab === "ALL" || t.type === activeTab;
            return matchesSearch && matchesTab;
        }),
        [templates, searchTerm, activeTab]
    );

    const selectedTemplate = useMemo(() => 
        templates.find(t => t.id === selectedTemplateId),
        [templates, selectedTemplateId]
    );

    // Handle Template Change
    const handleSelectTemplate = (template: PostTemplate) => {
        setSelectedTemplateId(template.id);
        setName(template.name);
        setType(template.type || "POST");
        setContent(template.contentSpintax);
        setMediaUrls(Array.isArray(template.mediaUrls) ? template.mediaUrls : []);
    };

    const resetForm = () => {
        setSelectedTemplateId(null);
        setName("");
        setType("POST");
        setContent("");
        setMediaUrls([]);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const payload = { 
            name, 
            type,
            contentSpintax: content, 
            mediaUrls 
        };

        if (selectedTemplateId) {
            await updateTemplate(selectedTemplateId, payload);
        } else {
            const result = await createTemplate(payload);
            if (result.success) setSelectedTemplateId(result.data.id);
        }
        setIsSaving(false);
    };

    // Spintax Preview Logic (Simple)
    const previewText = useMemo((): string => {
        if (!content) return "";
        return content.replace(/\{([^{}]+)\}/g, (_match: string, options: string) => {
            const parts = options.split("|");
            return String(parts[0] || ""); 
        });
    }, [content]);

    return (
        <div className="flex bg-[#070707] border border-white/[0.02] rounded-[32px] overflow-hidden h-[calc(100vh-160px)] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative">
            
            {/* Left Column: Template Library (Balanced 280px) */}
            <div className="w-[280px] border-r border-white/[0.03] bg-black/40 flex flex-col h-full overflow-hidden">
                <div className="p-6 border-b border-white/[0.03] bg-white/[0.005]">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                             <div className="w-7 h-7 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/10">
                                <LayoutTemplate size={14} />
                            </div>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Kho Mẫu Robot</span>
                        </div>
                        <button 
                            onClick={resetForm}
                            className="w-9 h-9 flex items-center justify-center hover:bg-white bg-blue-600/10 text-blue-500 hover:text-black rounded-xl transition-all border border-blue-500/10 active:scale-90"
                            title="Tạo mới"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Visible Filter Tabs */}
                    <div className="flex bg-white/[0.01] p-1 rounded-xl mb-5 border border-white/[0.03]">
                        {["ALL", "POST", "COMMENT"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    activeTab === tab 
                                        ? "text-white bg-white/[0.05] shadow-lg border border-white/5" 
                                        : "text-zinc-600 hover:text-zinc-400"
                                )}
                            >
                                {tab === "ALL" ? "Tất cả" : tab === "POST" ? "Post" : "Comment"}
                            </button>
                        ))}
                    </div>

                    <div className="relative group/search">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within/search:text-blue-500 transition-colors" size={16} />
                        <input
                            placeholder="Tìm kiếm mẫu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/[0.01] border border-white/[0.03] rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-400 focus:bg-white/[0.03] transition-all outline-none placeholder:text-zinc-900"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {loading && templates.length === 0 ? (
                        <div className="flex items-center justify-center py-20 text-blue-600 animate-pulse">
                            <Loader2 className="animate-spin mr-3" size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Đang nạp Robot...</span>
                        </div>
                    ) : filteredTemplates.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => handleSelectTemplate(template)}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all border group relative overflow-hidden",
                                selectedTemplateId === template.id 
                                    ? "bg-white/[0.02] border-white/5 text-white shadow-xl" 
                                    : "bg-transparent border-transparent text-zinc-600 hover:bg-white/[0.01] hover:text-zinc-300"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-500",
                                selectedTemplateId === template.id 
                                    ? (template.type === "POST" ? "bg-blue-600/20 text-blue-500" : "bg-violet-600/20 text-violet-500")
                                    : "bg-white/[0.02] border-white/5"
                            )}>
                                {template.type === "POST" ? <Plus size={18} /> : <Sparkles size={18} />}
                            </div>
                            <div className="flex flex-col items-start min-w-0 flex-1">
                                <span className={cn("text-xs font-black truncate mb-0.5 tracking-tight", selectedTemplateId === template.id ? "text-white" : "group-hover:text-white")}>
                                    {template.name}
                                </span>
                                <span className="text-[8px] font-black uppercase tracking-widest opacity-40">
                                    {template.type === "POST" ? "Campaign Timeline" : "Auto Interactive"}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Area: Balanced Workspace */}
            <div className="flex-1 flex flex-col min-w-0 bg-transparent">
                {/* Balanced Header */}
                <div className="px-8 py-8 flex items-center justify-between border-b border-white/[0.03] bg-white/[0.005]">
                    <div className="flex items-center gap-8 flex-1">
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-2xl transition-all duration-700",
                            type === "POST" ? "bg-blue-600/5 text-blue-500 border-blue-500/20" : "bg-violet-600/5 text-violet-500 border-violet-500/20"
                        )}>
                            {selectedTemplateId ? <Sparkles size={24} /> : <Plus size={24} />}
                        </div>
                        <div className="space-y-2 flex-1 max-w-xl">
                            <input 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nhập tên mẫu Robot..."
                                className="bg-transparent border-none outline-none text-white font-black text-2xl focus:ring-0 placeholder:text-zinc-900 tracking-tighter w-full"
                            />
                            <div className="flex items-center gap-4">
                                <div className="flex bg-white/[0.01] p-1 rounded-xl border border-white/[0.02]">
                                    {["POST", "COMMENT"].map((t) => (
                                        <button 
                                            key={t}
                                            onClick={() => setType(t as any)}
                                            className={cn(
                                                "px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                                type === t 
                                                    ? (t === "POST" ? "bg-blue-600 text-white shadow-lg" : "bg-violet-600 text-white shadow-lg")
                                                    : "text-zinc-700 hover:text-zinc-400"
                                            )}
                                        >
                                            {t === "POST" ? "Đăng bài" : "Comment dạo"}
                                        </button>
                                    ))}
                                </div>
                                <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">Cấu hình robot</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedTemplateId && (
                            <button 
                                onClick={() => deleteTemplate(selectedTemplateId).then(() => resetForm())}
                                className="w-10 h-10 flex items-center justify-center text-zinc-800 hover:text-rose-500 rounded-xl transition-all border border-transparent"
                                title="Xóa mẫu"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button 
                            disabled={isSaving || !name || !content}
                            onClick={handleSave}
                            className="flex items-center gap-3 px-8 py-3 bg-zinc-100 text-black rounded-2xl text-xs font-black hover:bg-white transition-all shadow-2xl active:scale-95 disabled:opacity-20 pointer-events-auto"
                        >
                            {isSaving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
                            {selectedTemplateId ? "CẬP NHẬT MẪU" : "LƯU MẪU MỚI"}
                        </button>
                    </div>
                </div>

                {/* Workspace Split */}
                <div className="flex-1 flex overflow-hidden p-8 gap-8">
                    {/* Writing Column (70%) */}
                    <div className="flex-[7] flex flex-col space-y-4">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] px-3 flex items-center gap-2">
                             <Type size={14} className="text-blue-500" /> Nội dung soạn thảo (Spintax)
                        </label>
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={type === "POST" ? "Nhập nội dung bài đăng ({Chào|Hi} bạn)..." : "Nhập nội dung comment..."}
                            className="flex-1 bg-white/[0.005] border border-white/[0.03] rounded-[32px] p-8 text-white text-lg font-medium leading-relaxed focus:border-white/10 transition-all outline-none resize-none shadow-inner placeholder:text-zinc-900 custom-scrollbar mt-2"
                        />
                    </div>

                    {/* Utils Column (30%) */}
                    <div className="flex-[3] flex flex-col space-y-8">
                        {/* Media Section */}
                        {type === "POST" ? (
                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] px-3 flex items-center gap-2">
                                     <ImageIcon size={14} className="text-blue-500" /> Tệp Truyền Thông (URL)
                                </label>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <input 
                                            value={newMediaUrl}
                                            onChange={(e) => setNewMediaUrl(e.target.value)}
                                            placeholder="Https://..."
                                            className="flex-1 bg-white/[0.01] border border-white/[0.03] rounded-xl px-4 py-2.5 text-xs text-zinc-500 outline-none focus:border-white/10 transition-all placeholder:text-zinc-900"
                                        />
                                        <button 
                                            onClick={() => {
                                                if (newMediaUrl) {
                                                    setMediaUrls(prev => [...prev, newMediaUrl]);
                                                    setNewMediaUrl("");
                                                }
                                            }}
                                            className="px-5 py-2.5 bg-white/[0.02] hover:bg-white text-zinc-700 hover:text-black rounded-xl text-[9px] font-black transition-all border border-white/[0.03]"
                                        >
                                            THÊM
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 max-h-48 overflow-y-auto custom-scrollbar p-1">
                                        {mediaUrls.map((url, idx) => (
                                            <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-white/[0.01] group shadow-xl">
                                                <img src={url} alt="Media" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                                                <button 
                                                    onClick={() => setMediaUrls(prev => prev.filter((_, i) => i !== idx))}
                                                    className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-violet-600/[0.01] border border-violet-500/10 rounded-[32px] p-8 space-y-4">
                                <Sparkles size={24} className="text-violet-500/50" />
                                <h4 className="text-white text-[10px] font-black uppercase tracking-widest">Lời nhắc Robot</h4>
                                <p className="text-zinc-700 text-[11px] leading-relaxed font-bold italic">
                                    "Comment dạo nên tự nhiên và vui vẻ để Robot hoạt động tốt nhất!"
                                </p>
                            </div>
                        )}

                        <div className="mt-auto p-8 rounded-[32px] bg-white/[0.005] border border-white/[0.01] space-y-4">
                            <AlertCircle size={24} className="text-zinc-900" />
                            <div>
                                <h5 className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-1">Mẹo Spintax</h5>
                                <p className="text-zinc-800 text-[10px] items-center leading-relaxed font-bold">
                                    Ưu tiên mẫu {"{ }"} để tránh bị trùng nội dung giữa các chiến dịch Robot.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
