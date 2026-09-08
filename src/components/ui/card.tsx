import * as React from "react"
import { cn } from "@/lib/utils"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-[var(--radius)] border border-border bg-surface py-(--card-spacing) text-sm text-card-foreground transition-[border-color,transform] duration-200 hover:-translate-y-px hover:border-border-hover [--card-spacing:--spacing(5)] has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] *:[img:first-child]:rounded-t-[var(--radius)] *:[img:last-child]:rounded-b-[var(--radius)]",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
}
