import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "solid",
      size = "md",
      isLoading = false,
      prefixIcon,
      suffixIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const baseStyles = cn(
      "inline-flex items-center justify-center gap-2",
      "font-semibold transition-transform transition-colors duration-150 ease-out cursor-pointer active:scale-[0.97]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
      "disabled:pointer-events-none disabled:opacity-50",
      
      size === "sm" && "h-8 px-3 text-xs rounded-xl",
      size === "md" && "h-10 px-4 text-sm rounded-xl",
      size === "lg" && "h-12 px-6 text-base rounded-2xl",
      
      variant === "solid" && [
        "bg-brand text-brand-fg",
        "hover:bg-brand-hover shadow-xs",
      ],
      variant === "outline" && [
        "border border-border bg-card/60 text-txt-main",
        "hover:bg-card hover:border-border-hover shadow-xs",
      ],
      variant === "ghost" && [
        "bg-transparent text-txt-main",
        "hover:bg-card",
      ],
      variant === "glass" && [
        "bg-white/10 backdrop-blur-md border border-white/20 text-txt-main",
        "hover:bg-white/20 hover:border-white/30 shadow-xs",
      ],
      
      className
    );

    return (
      <button
        ref={ref}
        className={baseStyles}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : prefixIcon ? (
          <span className="shrink-0">{prefixIcon}</span>
        ) : null}
        
        {children}
        
        {suffixIcon && !isLoading && (
          <span className="shrink-0">{suffixIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

