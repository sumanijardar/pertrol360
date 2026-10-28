import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, size = "default", ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card"
    data-size={size}
    className={cn(
      "flex flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-xs transition-colors",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-header"
    className={cn("flex flex-col gap-1 p-3.5 pb-2.5", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-title"
    className={cn("text-xs font-semibold leading-tight text-foreground tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-description"
    className={cn("text-[11px] text-muted-foreground leading-normal", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardAction = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-action"
    className={cn("ms-auto flex items-center gap-1.5", className)}
    {...props}
  />
))
CardAction.displayName = "CardAction"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-content"
    className={cn("p-3.5 pt-0 text-xs", className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-footer"
    className={cn("flex items-center p-3.5 pt-0 border-t border-border/40 text-xs mt-auto", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
}
