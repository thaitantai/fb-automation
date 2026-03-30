import { Users, Component, Rocket, Activity } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="h1 text-foreground tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Active Accounts", value: "0", icon: Users, color: "text-primary" },
          { title: "Synced Groups", value: "0", icon: Component, color: "text-pink-500" },
          { title: "Running Campaigns", value: "0", icon: Rocket, color: "text-blue-500" },
          { title: "Total Actions Today", value: "0", icon: Activity, color: "text-amber-500" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-tiny font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</span>
              <stat.icon className={`h-5 w-5 ${stat.color} opacity-80`} />
            </div>
            <div className="text-3xl font-bold text-foreground">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Visual Chart Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="col-span-4 glass-card min-h-[350px] flex flex-col p-6">
          <h2 className="h2 text-foreground mb-6">Posting Activity</h2>
          <div className="flex-1 flex items-center justify-center text-muted-foreground/30 border-2 border-dashed border-white/5 rounded-2xl">
            <Activity className="w-12 h-12 mb-2 opacity-20" />
            <span className="ml-4 font-medium">[Chart Component Placeholder]</span>
          </div>
        </div>
        <div className="col-span-3 glass-card min-h-[350px] p-6">
          <h2 className="h2 text-foreground mb-6">Recent Actions</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-center h-[200px] text-muted-foreground/30">
              No recent activity recorded.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
