"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { cardEnter, cardHover, staggerContainer, staggerItem, DURATION, EASE } from "@/lib/animations";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  glass?: boolean;
  glow?: boolean;
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  glass = true,
  glow = false,
}: AnimatedCardProps) {
  return (
    <motion.div
      variants={cardEnter}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: DURATION.pageTransition,
        delay,
        ease: EASE.default,
      }}
      {...cardHover}
      className={cn(
        "relative rounded-2xl p-5 md:p-6 transition-all duration-300",
        glass
          ? "glass border border-white/10 hover:border-white/20"
          : "bg-white/5 border border-white/5",
        glow && "glow-primary",
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

interface AnimatedListProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function AnimatedList({
  children,
  className,
  staggerDelay = 0.1,
}: AnimatedListProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer(staggerDelay)}
      className={className}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={staggerItem}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
