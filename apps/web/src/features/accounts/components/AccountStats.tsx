import { Users, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { FbAccount } from "../types";

interface AccountStatsProps {
  accounts: FbAccount[];
}

export function AccountStats({ accounts = [] }: AccountStatsProps) {
  const stats = [
    { 
      label: "Tổng tài khoản", 
      value: accounts?.length || 0, 
      icon: Users, 
      color: "text-primary", 
      bg: "bg-primary/12" 
    },
    { 
      label: "Đang hoạt động", 
      value: accounts?.filter(a => a.status === 'ACTIVE').length || 0, 
      icon: ShieldCheck, 
      color: "text-success", 
      bg: "bg-success/12" 
    },
    { 
      label: "Bị khóa / Checkpoint", 
      value: accounts?.filter(a => a.status !== 'ACTIVE').length || 0, 
      icon: ShieldAlert, 
      color: "text-error", 
      bg: "bg-error/12" 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="glass-card p-6 transition-all hover:border-primary/20">
          <div className="flex items-center gap-5">
            <div className={cn("p-4 rounded-2xl flex items-center justify-center", stat.bg)}>
              <stat.icon size={22} className={stat.color} />
            </div>
            <div>
              <p className="ds-font-label text-text-muted mb-1">{stat.label}</p>
              <h2 className="text-3xl font-black text-foreground leading-tight tracking-tight">
                {stat.value}
              </h2>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
