"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home, Users, Component, LayoutTemplate,
    Rocket, History, Settings, LogOut, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";

const routes = [
    { label: "Trang chủ",      icon: Home,           href: "/" },
    { label: "Tài khoản FB",   icon: Users,          href: "/accounts" },
    { label: "Quản lý Nhóm",   icon: Component,      href: "/groups" },
    { label: "Mẫu nội dung",   icon: LayoutTemplate, href: "/templates" },
    { label: "Chiến dịch",     icon: Rocket,         href: "/campaigns" },
    { label: "Nhật ký chạy",   icon: History,        href: "/logs" },
    { label: "Cài đặt hệ thống", icon: Settings,      href: "/settings" },
];

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <div className={cn(
            "flex flex-col h-full bg-surface-raised/80 backdrop-blur-xl text-foreground transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border-r border-border z-50 relative",
            isCollapsed ? "w-[10rem]" : "w-[30rem]"
        )}>
            {/* Logo Section - Khu vực Logo */}
            <div className={cn(
                "px-8 py-10 flex items-center mb-8 overflow-hidden transition-all duration-500",
                isCollapsed ? "justify-center px-0" : ""
            )}>
                <div className={cn(
                    "w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-glow-blue border border-primary/20 shrink-0 transition-all duration-500",
                    isCollapsed ? "scale-90" : "mr-5"
                )}>
                    <Rocket className="w-8 h-8 text-white" />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
                        <h1 className="text-[2rem] font-black tracking-tighter text-foreground leading-none">
                            FB AUTOMATE
                        </h1>
                        <p className="ds-font-label text-primary mt-1 opacity-80">
                            PRO EDITION
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation Section - Danh sách Menu */}
            <div className={cn(
                "px-6 flex-grow overflow-y-auto space-y-3 scrollbar-hide transition-all duration-500",
                isCollapsed ? "px-3" : ""
            )}>
                {routes.map((route) => {
                    const isActive = pathname === route.href;
                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 group relative",
                                isActive 
                                    ? "bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]" 
                                    : "text-text-muted hover:bg-surface-2 hover:text-foreground",
                                isCollapsed ? "justify-center" : ""
                            )}
                            title={isCollapsed ? route.label : ""}
                        >
                            <route.icon className={cn(
                                "transition-all duration-300 group-hover:scale-110 shrink-0",
                                isCollapsed ? "w-7 h-7" : "w-6 h-6",
                                isActive ? "text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : ""
                            )} />
                            
                            {!isCollapsed && (
                                <span className={cn(
                                    "text-[1.5rem] font-bold tracking-tight transition-all truncate",
                                    isActive ? "text-primary" : ""
                                )}>
                                    {route.label}
                                </span>
                            )}

                            {isActive && (
                                <div className={cn(
                                    "absolute right-2 w-1.5 bg-primary rounded-full shadow-glow-blue animate-in fade-in zoom-in duration-500",
                                    isCollapsed ? "h-6" : "h-7"
                                )} />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Section - Nút hệ thống */}
            <div className={cn(
                "p-6 border-t border-border bg-surface-2/20 mt-auto transition-all duration-500",
                isCollapsed ? "p-3" : ""
            )}>
                {/* Toggle Button */}
                <button
                    onClick={onToggle}
                    className={cn(
                        "flex items-center w-full rounded-xl transition-all duration-300 text-text-muted hover:bg-surface-3 group mb-2 p-4",
                        isCollapsed ? "justify-center" : ""
                    )}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-6 h-6" />
                    ) : (
                        <>
                            <ChevronLeft className="w-5 h-5 mr-4" />
                            <span className="font-bold text-[1.4rem] uppercase tracking-widest opacity-60 group-hover:opacity-100">Thu gọn</span>
                        </>
                    )}
                </button>

                <button
                    onClick={logout}
                    className={cn(
                        "flex items-center w-full rounded-xl transition-all duration-300 text-text-muted hover:text-error hover:bg-error/10 group cursor-pointer p-4",
                        isCollapsed ? "justify-center" : ""
                    )}
                >
                    <LogOut className={cn(
                        "w-6 h-6 transition-transform group-hover:-translate-x-1 duration-300",
                        !isCollapsed && "mr-4"
                    )} />
                    {!isCollapsed && (
                        <span className="font-black text-[1.4rem] uppercase tracking-widest">Đăng xuất</span>
                    )}
                </button>
            </div>
        </div>
    );
}
