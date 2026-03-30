import { Users, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { FbAccount } from "../types";

interface AccountStatsProps {
  accounts: FbAccount[];
}

export function AccountStats({ accounts = [] }: AccountStatsProps) {
  const stats = [
    { 
      label: "Tổng số tài khoản", 
      value: accounts?.length || 0, 
      icon: Users, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10" 
    },
    { 
      label: "Đang hoạt động", 
      value: accounts?.filter(a => a.status === 'ACTIVE').length || 0, 
      icon: ShieldCheck, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10" 
    },
    { 
      label: "Bị khóa / Checkpoint", 
      value: accounts?.filter(a => a.status !== 'ACTIVE').length || 0, 
      icon: ShieldAlert, 
      color: "text-rose-500", 
      bg: "bg-rose-500/10" 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="glass-card p-6 flex items-center gap-5">
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-xl", stat.bg)}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
