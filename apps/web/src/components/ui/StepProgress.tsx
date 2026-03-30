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
  const accentColor = "bg-primary shadow-primary/30";
  const glowColor = "bg-primary/40";
  const textColor = "text-primary";
  const bgGlow = "bg-primary";

  return (
    <div className={cn("flex items-center w-full gap-2", className)}>
      {steps.map((s, index) => {
        const isActive = currentStep === s.id;
        const isCompleted = currentStep > s.id;
        const Icon = s.icon;

        return (
          <div key={s.id} className="flex-1 flex flex-col gap-3 group relative">
            <div className="flex items-center w-full gap-2">
              {/* Bar segment */}
              <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/[0.2]">
                <div
                  className={cn(
                    "absolute inset-0 transition-all duration-700 ease-out",
                    isCompleted || isActive ? accentColor : "bg-white/5"
                  )}
                  style={{ width: isCompleted ? "100%" : isActive ? "100%" : "0%" }}
                />
                {isActive && (
                  <div className={cn("absolute inset-0 animate-pulse opacity-90", glowColor)} />
                )}
              </div>

              {/* Separator Dot (Inside bar row) */}
              {index < steps.length - 1 && (
                <div className="flex items-center justify-center">
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-colors duration-500",
                    isCompleted ? "bg-primary/40" : "bg-white/5"
                  )} />
                </div>
              )}
            </div>

            {/* Label & Icon */}
            <div className="flex items-center gap-2 px-1">
              <Icon
                size={12}
                className={cn(
                  "transition-colors duration-300",
                  isActive || isCompleted ? textColor : "text-zinc-700"
                )}
              />
              <span
                className={cn(
                  "ds-text-sm font-black transition-all duration-300",
                  isActive ? "text-white " : isCompleted ? "text-zinc-400" : "text-zinc-700"
                )}
              >
                {s.label}
              </span>
            </div>

            {/* Active Glow */}
            {isActive && (
              <div
                className={cn(
                  "absolute -inset-x-2 -top-4 -bottom-2 blur-2xl opacity-10 -z-10 rounded-full",
                  bgGlow
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
