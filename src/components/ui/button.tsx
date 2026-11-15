import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-ink text-ivory-50 hover:bg-accent-dark",
        dark: "bg-ink-900 text-ivory-50 hover:bg-ink-800",
        accent: "bg-accent text-white hover:bg-accent-dark",
        outline: "border border-line-strong bg-white/60 text-ink hover:border-accent hover:text-accent-dark",
        ghost: "text-muted hover:bg-ink/5 hover:text-ink",
        danger: "bg-danger text-white hover:bg-danger/90",
        dangerOutline: "border border-danger/40 text-danger hover:bg-danger-soft",
        gold: "bg-gold text-ink-900 hover:bg-gold/90",
      },
      size: {
        sm: "h-9 rounded-lg px-3.5 text-[0.8rem]",
        md: "h-11 rounded-xl px-5 text-[0.875rem]",
        lg: "h-13 rounded-2xl px-7 text-[0.95rem] min-h-[52px]",
        icon: "h-10 w-10 rounded-xl",
      },
      shape: {
        pill: "rounded-full",
        default: "",
      },
    },
    defaultVariants: { variant: "primary", size: "md", shape: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, shape }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };
