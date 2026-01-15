import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: "solid" | "outline" | "ghost" | "glass";
  /** Size of the button */
  size?: "sm" | "md" | "lg";
  /** Show loading spinner and disable */
  isLoading?: boolean;
  /** Icon to show before text */
  prefixIcon?: React.ReactNode;
  /** Icon to show after text */
  suffixIcon?: React.ReactNode;
}

/**
 * Button component with multiple variants and sizes
 * Follows Shadcn/UI patterns with custom Nostree theming
 */
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
      // Base styles
      "inline-flex items-center justify-center gap-2",
      "font-medium transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
      "disabled:pointer-events-none disabled:opacity-50",
      
      // Size variants
      size === "sm" && "h-8 px-3 text-sm rounded-md",
      size === "md" && "h-10 px-4 text-sm rounded-lg",
      size === "lg" && "h-12 px-6 text-base rounded-xl",
      
      // Style variants
      variant === "solid" && [
        "bg-brand text-brand-fg",
        "hover:bg-brand-hover active:scale-[0.98]",
      ],
      variant === "outline" && [
        "border border-border bg-transparent text-txt-main",
        "hover:bg-card hover:border-border-hover",
      ],
      variant === "ghost" && [
        "bg-transparent text-txt-main",
        "hover:bg-card",
      ],
      variant === "glass" && [
        "bg-white/10 backdrop-blur-md border border-white/20 text-txt-main",
        "hover:bg-white/20 hover:border-white/30",
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
