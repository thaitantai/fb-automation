import { Users } from "lucide-react";

export default function AccountsPage() {
  return (
    <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
          <Users className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Facebook Accounts</h1>
          <p className="text-white/50 mt-1">Manage attached Facebook cookies, tokens, and proxies.</p>
        </div>
      </div>
      
      <div className="w-full h-[600px] border border-white/5 bg-white/5 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md shadow-lg border-dashed">
        <Users className="w-16 h-16 text-white/10 mb-4" />
        <p className="text-white/30 text-lg font-medium">Data Table Component Coming Soon</p>
      </div>
    </div>
  );
}
