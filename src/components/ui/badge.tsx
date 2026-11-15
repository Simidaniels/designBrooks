import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.12em]",
  {
    variants: {
      tone: {
        neutral: "border-line-strong bg-white/70 text-muted",
        ink: "border-ink/15 bg-ink text-ivory-50",
        accent: "border-accent/30 bg-accent/10 text-accent-dark",
        success: "border-success/30 bg-success-soft text-success",
        warning: "border-warning/30 bg-warning-soft text-warning",
        danger: "border-danger/30 bg-danger-soft text-danger",
        gold: "border-gold/40 bg-gold/15 text-[#7a5c22]",
        dark: "border-white/10 bg-white/10 text-ivory-100",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
