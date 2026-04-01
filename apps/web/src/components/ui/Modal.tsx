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
          "bg-surface-raised border border-border shadow-[0_40px_100px_rgba(0,0,0,0.9)] rounded-[2.5rem] w-full flex flex-col relative z-10 overflow-hidden",
          "animate-in zoom-in-95 fade-in slide-in-from-bottom-8 duration-500",
          "max-h-[90vh]",
          sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md,
          className
        )}
      >
        {/* Header - Header chuẩn mượt mà */}
        {(title || description) && (
          <div className="px-10 py-10 flex items-start justify-between">
            <div className="space-y-1.5">
              {title && (
                <h2 className="ds-font-title text-foreground capitalize">
                  {title}
                </h2>
              )}
              {description && (
                <div className="text-[1.4rem] text-text-secondary font-medium leading-relaxed">
                  {description}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-surface-3 rounded-2xl transition-all text-text-muted hover:text-foreground hover:rotate-180 active:scale-90 border border-border-subtle shadow-sm"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {!title && !description && (
          <button
            onClick={onClose}
            className="absolute right-8 top-8 z-20 p-3 hover:bg-surface-3 rounded-2xl transition-all text-text-muted hover:text-foreground hover:rotate-180 active:scale-90 border border-border-subtle shadow-sm"
          >
            <X size={18} />
          </button>
        )}

        {/* Body - Nội dung cuộn mượt */}
        <div className={cn(
          "flex-1 overflow-y-auto scrollbar-hide",
          (title || description) ? "px-10 pb-10" : "p-10"
        )}>
          {children}
        </div>

        {/* Footer - Chân trang đồng bộ */}
        {footer && (
          <div className="px-10 py-8 border-t border-border bg-surface-2/30 flex items-center justify-end gap-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
