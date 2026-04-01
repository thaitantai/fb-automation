"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[1.4rem] border border-transparent bg-clip-padding text-[1.4rem] font-black uppercase tracking-widest transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 disabled:pointer-events-none disabled:opacity-30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-hover shadow-glow-blue/20",
        outline:
          "border-border bg-transparent text-text-muted hover:bg-surface-2 hover:text-foreground hover:border-border",
        secondary:
          "bg-surface-2 text-foreground border border-border/50 hover:bg-surface-3 hover:border-border",
        ghost:
          "text-text-muted hover:bg-surface-2 hover:text-foreground",
        destructive:
          "bg-error/10 text-error border border-error/20 hover:bg-error hover:text-white hover:border-error shadow-glow-error/10",
        success:
          "bg-success/10 text-success border border-success/20 hover:bg-success hover:text-white hover:border-success shadow-glow-success/10",
        link: "text-primary underline-offset-8 hover:underline font-bold",
      },
      size: {
        default: "h-[4.2rem] gap-2 px-6",
        xs: "h-[3rem] gap-1.5 px-3 text-[1.1rem]",
        sm: "h-[3.6rem] gap-2 px-4 text-[1.2rem]",
        lg: "h-[5.2rem] gap-3 px-8 text-[1.5rem]",
        icon: "size-[4.2rem]",
        "icon-sm": "size-[3.6rem]",
        "icon-lg": "size-[5.2rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      suppressHydrationWarning={true}
      {...props}
    />
  )
}

export { Button, buttonVariants }
