import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-[4.2rem] w-full min-w-0 rounded-2xl border border-border bg-surface-2 px-5 py-2 text-[1.4rem] font-medium transition-all outline-none",
        "placeholder:text-text-muted/30 placeholder:font-black placeholder:uppercase placeholder:text-[1.1rem] placeholder:tracking-tighter",
        "focus:bg-surface-3 focus:border-primary/40 focus:ring-4 focus:ring-primary/5",
        "disabled:pointer-events-none disabled:opacity-30 disabled:bg-surface-1",
        "aria-invalid:border-error aria-invalid:ring-error/20",
        className
      )}
      suppressHydrationWarning={true}
      {...props}
    />
  )
}

export { Input }
