"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { buttonHover, iconButtonHover, iconButtonPulse } from "@/lib/animations";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

interface AnimatedButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function AnimatedButton({
  children,
  className,
  variant,
  size,
  asChild = false,
  disabled,
  ...props
}: AnimatedButtonProps) {
  // When disabled, don't apply hover animations
  if (disabled) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
        asChild={asChild}
        {...props}
      >
        {children}
      </Button>
    );
  }

  return (
    <motion.div
      {...buttonHover}
      className="inline-block"
    >
      <Button
        variant={variant}
        size={size}
        className={cn("w-full", className)}
        asChild={asChild}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}

interface AnimatedIconButtonProps {
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
}

export function AnimatedIconButton({
  children,
  className,
  pulse = false,
  disabled,
  onClick,
  type = "button",
  "aria-label": ariaLabel,
}: AnimatedIconButtonProps) {
  if (disabled) {
    return (
      <button
        type={type}
        aria-label={ariaLabel}
        className={cn(
          "inline-flex items-center justify-center rounded-md p-2 transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        disabled
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  return (
    <motion.button
      type={type}
      aria-label={ariaLabel}
      {...iconButtonHover}
      variants={pulse ? iconButtonPulse : undefined}
      animate={pulse ? "animate" : undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
