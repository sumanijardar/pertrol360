import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex h-5 items-center justify-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-[10.5px] font-medium leading-none whitespace-nowrap transition-colors focus:outline-none focus:ring-1 focus:ring-ring [&_svg]:size-2.5",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs",
        secondary:
          "bg-secondary text-secondary-foreground",
        outline:
          "border-border bg-background text-foreground",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/25",
        success:
          "bg-emerald-500/10 text-emerald-600 border-emerald-500/25",
        warning:
          "bg-amber-500/10 text-amber-600 border-amber-500/25",
        info:
          "bg-blue-500/10 text-blue-600 border-blue-500/25",
        neutral:
          "bg-muted text-muted-foreground border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
