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
    { label: "Dashboard", icon: Home, href: "/", color: "text-sky-500" },
    { label: "Accounts", icon: Users, href: "/accounts", color: "text-emerald-500" },
    { label: "Groups", icon: Component, href: "/groups", color: "text-pink-500" },
    { label: "Templates", icon: LayoutTemplate, href: "/templates", color: "text-amber-500" },
    { label: "Campaigns", icon: Rocket, href: "/campaigns", color: "text-violet-500" },
    { label: "Job Logs", icon: History, href: "/logs", color: "text-zinc-400" },
    { label: "Settings", icon: Settings, href: "/settings", color: "text-slate-400" },
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
            "flex flex-col h-full bg-ds-sidebar text-foreground transition-all duration-500 ease-in-out shadow-ds z-50 relative",
            isCollapsed ? "w-[90px]" : "w-[320px]"
        )}>
            <div className={cn(
                "px-6 py-8 flex items-center mb-6 overflow-hidden transition-all duration-500",
                isCollapsed ? "justify-center px-0" : "px-6"
            )}>
                <div className={cn(
                    "w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(37,99,235,0.3)] shrink-0 transition-transform duration-500",
                    isCollapsed ? "" : "mr-5"
                )}>
                    <Rocket className="w-10 h-10 text-primary" />
                </div>
                {!isCollapsed && (
                    <div className="h-16 flex flex-col justify-between py-1 transition-all duration-500 animate-in fade-in slide-in-from-left-2">
                        <h1 className="text-[2.2rem] font-bold tracking-tight text-foreground leading-none truncate">
                            FB Automate
                        </h1>
                        <p className="text-[1.1rem] text-primary/70 font-bold tracking-[0.2em] uppercase flex items-center gap-2 leading-none whitespace-nowrap">
                            <span className="w-1 h-1 rounded-full bg-primary/40" />
                            Pro Edition
                        </p>
                    </div>
                )}
            </div>

            <div className={cn(
                "px-4 py-2 flex-grow overflow-y-auto space-y-2 custom-scrollbar transition-all duration-500",
                isCollapsed ? "px-2" : "px-4"
            )}>
                {routes.map((route) => {
                    const isActive = pathname === route.href;
                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "sidebar-item group relative",
                                isActive && "active",
                                isCollapsed ? "justify-center p-4" : "p-4"
                            )}
                            title={isCollapsed ? route.label : ""}
                        >
                            <div className={cn(
                                "flex items-center flex-1 transition-all duration-500",
                                isCollapsed ? "justify-center" : ""
                            )}>
                                <route.icon className={cn(
                                    "transition-all duration-500 group-hover:scale-110",
                                    isCollapsed ? "w-8 h-8" : "w-6 h-6 mr-4",
                                    isActive ? "text-primary" : "text-muted-foreground/70"
                                )} />
                                {!isCollapsed && (
                                    <span className="text-[1.7rem] font-medium transition-all duration-500 animate-in fade-in slide-in-from-left-2">
                                        {route.label}
                                    </span>
                                )}
                            </div>

                            {/* Tooltip for collapsed mode is handled by title attribute, 
                                and visual active indicator below */}
                            {isActive && (
                                <div className={cn(
                                    "absolute right-0 w-1 bg-primary rounded-l-full shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-500",
                                    isCollapsed ? "h-6 top-1/2 -translate-y-1/2" : "h-10 top-1/2 -translate-y-1/2"
                                )} />
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className={cn(
                "p-4 border-t border-border/40 mt-auto transition-all duration-500",
                isCollapsed ? "p-2" : "p-4"
            )}>
                {/* Collapse Toggle at Bottom */}
                <button
                    onClick={onToggle}
                    className={cn(
                        "flex items-center w-full rounded-xl transition-all duration-300 text-muted-foreground hover:bg-white/5 group mb-2",
                        isCollapsed ? "justify-center p-4" : "px-4 py-3"
                    )}
                    title={isCollapsed ? "Mở rộng" : "Thu gọn"}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-6 h-6" />
                    ) : (
                        <>
                            <ChevronLeft className="w-6 h-6 mr-4" />
                            <span className="font-medium text-[1.4rem]">Thu gọn</span>
                        </>
                    )}
                </button>

                <button
                    onClick={logout}
                    className={cn(
                        "flex items-center w-full rounded-xl transition-all duration-300 text-muted-foreground hover:text-destructive hover:bg-destructive/10 group cursor-pointer",
                        isCollapsed ? "justify-center p-4" : "px-4 py-3"
                    )}
                    title={isCollapsed ? "Logout" : ""}
                >
                    <LogOut className={cn(
                        "w-6 h-6 transition-transform group-hover:-translate-x-1 duration-300",
                        !isCollapsed && "mr-4"
                    )} />
                    {!isCollapsed && (
                        <span className="font-medium text-[1.4rem] transition-all animate-in fade-in">Logout</span>
                    )}
                </button>
            </div>
        </div>
    );
}
