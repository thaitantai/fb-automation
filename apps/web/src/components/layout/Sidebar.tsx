"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Users, Component, LayoutTemplate,
  Rocket, History, Settings, LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const routes = [
  { label: "Dashboard", icon: Home, href: "/", color: "text-sky-500" },
  { label: "Accounts", icon: Users, href: "/accounts", color: "text-emerald-500" },
  { label: "Groups", icon: Component, href: "/groups", color: "text-pink-500" },
  { label: "Templates", icon: LayoutTemplate, href: "/templates", color: "text-amber-500" },
  { label: "Campaigns", icon: Rocket, href: "/campaigns", color: "text-violet-500" },
  { label: "Job Logs", icon: History, href: "/logs", color: "text-zinc-400" },
  { label: "Settings", icon: Settings, href: "/settings", color: "text-slate-400" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-white/5 text-white w-72 transition-all shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-50">
      <div className="px-6 py-8 flex items-center mb-4">
        <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30 mr-4 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
          <Rocket className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">FB Automate</h1>
          <p className="text-xs text-white/40 font-medium tracking-wider uppercase">Pro Edition</p>
        </div>
      </div>
      
      <div className="px-4 py-2 flex-grow overflow-y-auto space-y-2">
        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 group",
                isActive 
                  ? "bg-white/10 text-white font-medium shadow-sm" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("w-5 h-5 mr-4 transition-transform group-hover:scale-110 duration-300", route.color)} />
                {route.label}
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5 mt-auto">
        <button 
          onClick={logout}
          className="flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 text-white/60 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 group cursor-pointer"
        >
          <LogOut className="w-5 h-5 mr-4 text-red-400 transition-transform group-hover:-translate-x-1 duration-300" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
