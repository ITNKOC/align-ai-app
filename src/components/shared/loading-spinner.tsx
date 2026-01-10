"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { spinnerRotate, pulseScale } from "@/lib/animations";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "primary" | "white" | "muted";
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-3",
};

const colorClasses = {
  primary: "border-primary/30 border-t-primary",
  white: "border-white/30 border-t-white",
  muted: "border-muted-foreground/30 border-t-muted-foreground",
};

export function LoadingSpinner({
  size = "md",
  className,
  color = "primary",
}: LoadingSpinnerProps) {
  return (
    <motion.div
      variants={spinnerRotate}
      animate="animate"
      className={cn(
        "rounded-full",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
}

interface LoadingDotsProps {
  className?: string;
  color?: "primary" | "white" | "muted";
}

export function LoadingDots({ className, color = "primary" }: LoadingDotsProps) {
  const dotColor = {
    primary: "bg-primary",
    white: "bg-white",
    muted: "bg-muted-foreground",
  }[color];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn("w-2 h-2 rounded-full", dotColor)}
          animate={{
            y: [0, -6, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

interface LoadingPulseProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const pulseSizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

export function LoadingPulse({ size = "md", className }: LoadingPulseProps) {
  return (
    <motion.div
      variants={pulseScale}
      animate="animate"
      className={cn(
        "rounded-full bg-primary/20",
        pulseSizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export function LoadingOverlay({ message, className }: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-3",
        "bg-background/80 backdrop-blur-sm z-50",
        className
      )}
    >
      <LoadingSpinner size="lg" />
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground"
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}
