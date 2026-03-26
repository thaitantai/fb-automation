import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Component, Rocket, Activity } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-white/50 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Active Accounts", value: "0", icon: Users, color: "text-emerald-500" },
          { title: "Synced Groups", value: "0", icon: Component, color: "text-pink-500" },
          { title: "Running Campaigns", value: "0", icon: Rocket, color: "text-blue-500" },
          { title: "Total Actions Today", value: "0", icon: Activity, color: "text-amber-500" },
        ].map((stat, i) => (
          <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/70">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Visual Chart Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <Card className="col-span-4 bg-white/5 border-white/10 backdrop-blur-xl min-h-[300px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-white/90">Posting Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center text-white/30 border-2 border-dashed border-white/5 rounded-xl m-6 mt-0">
            [Chart Component Goes Here]
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-white/5 border-white/10 backdrop-blur-xl min-h-[300px]">
          <CardHeader>
            <CardTitle className="text-white/90">Recent Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center h-[200px] text-white/30">
              No recent actions found.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
