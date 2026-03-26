import { Sidebar } from "@/components/layout/Sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | FB Automation",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#050505]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 min-h-full text-white">
          {children}
        </div>
      </main>
    </div>
  );
}
