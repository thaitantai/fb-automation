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
          toast: "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:p-5",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:border-emerald-500/50 group-[.toast]:bg-emerald-500/5",
          error: "group-[.toast]:border-destructive/50 group-[.toast]:bg-destructive/5",
          info: "group-[.toast]:border-sky-500/50 group-[.toast]:bg-sky-500/5",
          warning: "group-[.toast]:border-amber-500/50 group-[.toast]:bg-amber-500/5",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
