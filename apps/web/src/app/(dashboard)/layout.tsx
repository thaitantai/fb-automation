"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <AuthGuard>
      <div className={cn(
        "grid h-screen overflow-hidden bg-background transition-all duration-500",
        isCollapsed ? "grid-cols-[90px_1fr]" : "grid-cols-[320px_1fr]"
      )}>
        <aside className="h-full border-r border-border/10">
          <Sidebar 
            isCollapsed={isCollapsed} 
            onToggle={() => setIsCollapsed(!isCollapsed)} 
          />
        </aside>
        <main className="overflow-y-auto relative bg-ds-workspace">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative z-10 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
