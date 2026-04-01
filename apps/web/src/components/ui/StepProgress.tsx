"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepConfig {
  id: number;
  label: string;
  icon: LucideIcon;
}

interface StepProgressProps {
  steps: StepConfig[];
  currentStep: number;
  className?: string;
}

export function StepProgress({
  steps,
  currentStep,
  className,
}: StepProgressProps) {
  return (
    <div className={cn("flex items-center w-full gap-4", className)}>
      {steps.map((s, index) => {
        const isActive = currentStep === s.id;
        const isCompleted = currentStep > s.id;
        const Icon = s.icon;

        return (
          <div key={s.id} className="flex-1 flex flex-col gap-4 group relative">
            <div className="flex items-center w-full gap-3">
              {/* Bar segment - Đoạn bar tiến độ */}
              <div className="relative h-2 w-full bg-surface-2 rounded-full overflow-hidden border border-border/40">
                <div
                  className={cn(
                    "absolute inset-0 transition-all duration-700 ease-out",
                    isCompleted || isActive ? "bg-primary shadow-glow-blue" : "bg-transparent"
                  )}
                  style={{ width: isCompleted ? "100%" : isActive ? "100%" : "0%" }}
                />
                {isActive && (
                  <div className="absolute inset-0 animate-pulse bg-primary/40" />
                )}
              </div>

              {/* Separator Dot - Dấu phân cách */}
              {index < steps.length - 1 && (
                <div className="flex items-center justify-center shrink-0">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors duration-500",
                    isCompleted ? "bg-primary/40" : "bg-border/40"
                  )} />
                </div>
              )}
            </div>

            {/* Label & Icon - Nhãn và Biểu tượng */}
            <div className="flex items-center gap-3 px-1">
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center border transition-all duration-500",
                isActive ? "bg-primary border-primary text-white shadow-glow-blue/20" : isCompleted ? "bg-primary/10 border-primary/20 text-primary" : "bg-surface-2 border-border text-text-muted"
              )}>
                <Icon size={14} />
              </div>
              <span
                className={cn(
                  "ds-font-label transition-all duration-300 uppercase",
                  isActive ? "text-foreground font-black" : isCompleted ? "text-text-muted font-bold" : "text-text-muted/40"
                )}
              >
                {s.label}
              </span>
            </div>

            {/* Premium Active Glow - Hiệu ứng phát sáng bước hiện tại */}
            {isActive && (
              <div
                className="absolute -inset-x-4 -top-8 -bottom-4 bg-primary/5 blur-3xl -z-10 rounded-full animate-in fade-in duration-1000"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
