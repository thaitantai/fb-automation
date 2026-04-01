"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group font-sans"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-surface-raised group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-[.toaster]:rounded-[1.4rem] group-[.toaster]:p-6 group-[.toaster]:gap-4",
          description: "group-[.toast]:text-text-muted group-[.toast]:text-[1.2rem] group-[.toast]:font-medium",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-surface-2 group-[.toast]:text-text-muted",
          success: "group-[.toast]:border-success/30 group-[.toast]:bg-success/5 group-[.toast]:text-success",
          error: "group-[.toast]:border-error/30 group-[.toast]:bg-error/5 group-[.toast]:text-error",
          info: "group-[.toast]:border-primary/30 group-[.toast]:bg-primary/5 group-[.toast]:text-primary",
          warning: "group-[.toast]:border-warning/30 group-[.toast]:bg-warning/5 group-[.toast]:text-warning",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
