"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  pageTransition,
  fadeIn as fadeInVariant,
  slideUp as slideUpVariant,
  DURATION,
  EASE,
} from "@/lib/animations";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeInVariant}
      initial="initial"
      animate="animate"
      transition={{ duration: DURATION.normal, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={slideUpVariant}
      initial="initial"
      animate="animate"
      transition={{
        duration: DURATION.slow,
        delay,
        ease: EASE.default,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
