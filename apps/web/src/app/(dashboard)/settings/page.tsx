import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-400/10 rounded-xl flex items-center justify-center border border-slate-400/20">
          <Settings className="w-6 h-6 text-slate-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
          <p className="text-white/50 mt-1">Configure global application variables and profiles.</p>
        </div>
      </div>
      
      <div className="w-full h-[600px] border border-white/5 bg-white/5 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md shadow-lg border-dashed">
        <Settings className="w-16 h-16 text-white/10 mb-4 animate-[spin_10s_linear_infinite]" />
        <p className="text-white/30 text-lg font-medium">Settings Form Coming Soon</p>
      </div>
    </div>
  );
}
