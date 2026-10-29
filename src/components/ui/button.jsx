import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-xs font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive/10 text-destructive border border-destructive/25 hover:bg-destructive/20 focus-visible:ring-destructive/30",
        outline:
          "border border-border bg-background text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-3.5 text-xs gap-2 [&_svg]:size-3.5",
        xs: "h-6 rounded px-2 text-[10px] gap-1 [&_svg]:size-2.5",
        sm: "h-7 px-3 text-xs gap-1.5 [&_svg]:size-3",
        lg: "h-9 px-4 text-xs gap-2 [&_svg]:size-4",
        icon: "size-8 [&_svg]:size-3.5",
        "icon-sm": "size-7 [&_svg]:size-3",
        "icon-lg": "size-9 [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
