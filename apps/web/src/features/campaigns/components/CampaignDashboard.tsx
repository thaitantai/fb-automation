"use client";

import React, { useState } from "react";
import { 
    Rocket, Plus, Search, Filter, Play, Pause, 
    Trash2, ExternalLink, Calendar, Clock, 
    LayoutTemplate, Users, Component, CheckCircle2, 
    AlertCircle, RefreshCw, Loader2, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCampaigns } from "../hooks/useCampaigns";
import { CampaignStatus, Campaign } from "../types";
import { CreateCampaignModal } from "./CreateCampaignModal";
import { CampaignDetailsModal } from "./CampaignDetailsModal";

export function CampaignDashboard() {
    const { campaigns, loading, updateCampaignStatus, deleteCampaign, fetchCampaigns } = useCampaigns();
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

    const getStatusColor = (status: CampaignStatus) => {
        switch (status) {
            case "PROCESSING": return "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]";
            case "COMPLETED": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "PAUSED": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case "SCHEDULED": return "bg-violet-500/10 text-violet-400 border-violet-500/20";
            default: return "bg-zinc-500/10 text-zinc-500 border-zinc-500/10";
        }
    };

    const handleRowClick = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setIsDetailsModalOpen(true);
    };

    const filteredCampaigns = campaigns.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Action Bar (Compact) */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input
                        placeholder="Tìm tên chiến dịch..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:bg-white/[0.06] transition-all outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={fetchCampaigns}
                        className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 rounded-xl border border-white/5 transition-all"
                        title="Tải lại ngay"
                    >
                        <RefreshCw size={18} className={cn(loading && "animate-spin")} />
                    </button>
                    <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-95 duration-200"
                    >
                        <Plus size={18} />
                        Chiến dịch mới
                    </button>
                </div>
            </div>

            {/* Modal for creating campaign or Details */}
            <CreateCampaignModal 
                isOpen={isEditModalOpen}
                initialData={selectedCampaign}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCampaign(null);
                    fetchCampaigns();
                }} 
            />

            <CampaignDetailsModal 
                isOpen={isDetailsModalOpen}
                campaign={selectedCampaign}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedCampaign(null);
                }}
                onEdit={(campaign) => {
                    setIsDetailsModalOpen(false);
                    setIsEditModalOpen(true);
                }}
            />

            {/* Campaign Master List */}
            <div className="flex-1 overflow-auto border border-white/5 rounded-2xl bg-white/[0.01] relative custom-scrollbar shadow-xl">
                {loading && campaigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                        <p className="text-zinc-500 text-sm font-medium">Đang điều phối các chiến dịch bài đăng...</p>
                    </div>
                ) : filteredCampaigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-6">
                        <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5 text-zinc-700 shadow-inner">
                            <Rocket size={32} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-zinc-300">Chưa có chiến dịch nào được khởi tạo</h3>
                            <p className="text-zinc-500 text-sm mt-1 max-w-xs mx-auto">Tạo chiến dịch đầu tiên để bắt đầu tự động hóa quy trình Marketing của bạn.</p>
                        </div>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse relative">
                        <thead className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl z-[30]">
                            <tr className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold border-b border-white/5">
                                <th className="px-6 py-4">Tên chiến dịch / Loại</th>
                                <th className="px-6 py-4">Mẫu bài viết</th>
                                <th className="px-6 py-4 text-center">Tình trạng</th>
                                <th className="px-6 py-4 text-center">Tài khoản & Nhóm</th>
                                <th className="px-6 py-4">Ngày bắt đầu</th>
                                <th className="px-6 py-4 text-right">Lệnh</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {filteredCampaigns.map((campaign) => (
                                <tr 
                                    key={campaign.id} 
                                    onClick={() => handleRowClick(campaign)}
                                    className="hover:bg-white/[0.04] transition-all group/row cursor-pointer border-b border-white/[0.02]"
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center border border-white/5 group-hover/row:border-blue-500/30 transition-all overflow-hidden relative">
                                                <Rocket size={18} className="text-zinc-600 group-hover/row:text-blue-500 group-hover/row:scale-110 duration-300" />
                                                {campaign.status === "PROCESSING" && (
                                                    <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm text-zinc-200 font-bold truncate max-w-[220px] group-hover/row:text-white transition-colors">
                                                    {campaign.name}
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-500/80 mt-0.5">
                                                    {campaign.type || 'HÀNH ĐỘNG CƠ BẢN'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 w-fit group-hover:bg-white/10 transition-all">
                                            <LayoutTemplate size={14} className="text-amber-500" />
                                            <span className="text-xs font-bold text-zinc-300">
                                                {campaign.template?.name || "Mẫu đã bị gỡ"}
                                            </span>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black flex items-center gap-1.5 uppercase tracking-tighter border",
                                                getStatusColor(campaign.status)
                                            )}>
                                                {campaign.status === "PROCESSING" && <RefreshCw size={10} className="animate-spin" />}
                                                {campaign.status === "COMPLETED" && <CheckCircle2 size={10} />}
                                                {campaign.status === "PAUSED" && <Pause size={10} />}
                                                {campaign.status}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                                                    <Users size={10}/> {campaign.fbAccounts?.length || 0}
                                                </div>
                                                <ArrowRight size={10} className="text-zinc-700" />
                                                <div className="flex items-center gap-1 text-[10px] text-pink-500 font-bold bg-pink-500/5 px-1.5 py-0.5 rounded border border-pink-500/10">
                                                    <Component size={10}/> {campaign.targetConfigs.groupIds.length}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex flex-col text-[10px] text-zinc-500 font-medium font-mono leading-tight">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={10} className="opacity-40" />
                                                {new Date(campaign.createdAt || Date.now()).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1.5 opacity-60">
                                                <Clock size={10} className="opacity-40" />
                                                {new Date(campaign.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                            {campaign.status === "PROCESSING" ? (
                                                <button 
                                                    onClick={() => updateCampaignStatus(campaign.id, "PAUSED")}
                                                    className="p-2.5 text-zinc-600 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
                                                    title="Tạm dừng chiến dịch"
                                                >
                                                    <Pause size={18} />
                                                </button>
                                            ) : campaign.status !== "COMPLETED" && (
                                                <button 
                                                    onClick={() => updateCampaignStatus(campaign.id, "PROCESSING")}
                                                    className="p-2.5 text-zinc-600 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                                                    title="Bắt đầu ngay"
                                                >
                                                    <Play size={18} />
                                                </button>
                                            )}
                                            
                                            <button 
                                                onClick={() => deleteCampaign(campaign.id)}
                                                className="p-2.5 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                                title="Gỡ bỏ"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
