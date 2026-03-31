"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
}

const sizeClasses = {
  xs: "max-w-[32rem]", // 320px
  sm: "max-w-[40rem]", // 400px
  md: "max-w-[50rem]", // 500px
  lg: "max-w-[72rem]", // 720px
  xl: "max-w-[96rem]", // 960px
  "2xl": "max-w-[120rem]", // 1200px
  full: "max-w-[95vw] h-[95vh]",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          "bg-[hsl(var(--ds-bg-deep))] border border-white/[0.05] shadow-[0_40px_100px_rgba(0,0,0,0.9)] rounded-[3rem] w-full flex flex-col relative z-10 overflow-hidden",
          "animate-in zoom-in-95 fade-in slide-in-from-bottom-8 duration-500",
          "max-h-[92vh]",
          sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md,
          className
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-12 py-10 flex items-start justify-between">
            <div className="space-y-2">
              {title && (
                <h2 className="ds-font-title tracking-tighter text-white capitalize font-black">
                  {title}
                </h2>
              )}
              {description && (
                <div className="ds-font-subtitle leading-relaxed opacity-50 font-bold">
                  {description}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/5 rounded-[1.5rem] transition-all text-muted-foreground hover:text-foreground hover:rotate-180 active:scale-75 translate-x-2 -translate-y-2 border border-white/5"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {!title && !description && (
          <button
            onClick={onClose}
            className="absolute right-10 top-10 z-20 p-3 hover:bg-white/5 rounded-[1.5rem] transition-all text-muted-foreground hover:text-foreground hover:rotate-180 active:scale-75 border border-white/5"
          >
            <X size={20} />
          </button>
        )}

        {/* Body */}
        <div className={cn(
          "flex-1 overflow-y-auto custom-scrollbar",
          (title || description) ? "px-12 pb-12" : "p-12"
        )}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-12 py-8 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
