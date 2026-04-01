"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "ds-font-label text-text-muted flex items-center gap-2.5 select-none transition-colors",
        "group-data-[disabled=true]:opacity-30 peer-disabled:opacity-30",
        className
      )}
      {...props}
    />
  )
}

export { Label }
