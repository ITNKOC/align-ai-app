/**
 * Centralized Animation Library
 * Single source of truth for all Framer Motion animations
 * @module lib/animations
 */

import type { Transition, Variants } from "framer-motion";

// ============================================================================
// TIMING CONSTANTS
// ============================================================================

export const DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  pageTransition: 0.4,
} as const;

export const EASE = {
  default: [0.25, 0.46, 0.45, 0.94] as const,
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
  smooth: [0.4, 0, 0.2, 1] as const,
} as const;

export const SPRING = {
  gentle: { type: "spring", stiffness: 100, damping: 15 } as const,
  bouncy: { type: "spring", stiffness: 300, damping: 20 } as const,
  stiff: { type: "spring", stiffness: 400, damping: 30 } as const,
} as const;

// ============================================================================
// PAGE TRANSITIONS
// ============================================================================

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.pageTransition, ease: EASE.default },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: DURATION.fast },
  },
};

// ============================================================================
// CARD ANIMATIONS
// ============================================================================

export const cardHover = {
  whileHover: { y: -4, transition: { duration: DURATION.fast } },
  whileTap: { scale: 0.98 },
};

export const cardEnter: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASE.default },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: DURATION.fast },
  },
};

// ============================================================================
// LIST ITEM ANIMATIONS
// ============================================================================

export const listItem: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const listItemVertical: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// ============================================================================
// BASIC ANIMATIONS
// ============================================================================

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: DURATION.normal },
  },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASE.default },
  },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASE.default },
  },
};

export const slideLeft: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.normal, ease: EASE.default },
  },
};

export const slideRight: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.normal, ease: EASE.default },
  },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.normal, ease: EASE.bounce },
  },
};

export const scaleOut: Variants = {
  initial: { opacity: 1, scale: 1 },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: DURATION.fast },
  },
};

// ============================================================================
// MODAL / DIALOG ANIMATIONS
// ============================================================================

export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: DURATION.fast } },
  exit: { opacity: 0, transition: { duration: DURATION.fast } },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASE.default },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: DURATION.fast },
  },
};

// ============================================================================
// STAGGER UTILITIES
// ============================================================================

export const stagger = (delay = 0.1): Variants => ({
  animate: {
    transition: {
      staggerChildren: delay,
    },
  },
});

export const staggerContainer = (
  staggerDelay = 0.1,
  delayChildren = 0
): Variants => ({
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASE.default },
  },
};

// ============================================================================
// BUTTON ANIMATIONS
// ============================================================================

export const buttonHover = {
  whileHover: { scale: 1.02, transition: { duration: DURATION.fast } },
  whileTap: { scale: 0.98 },
};

export const buttonPulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.02, 1],
    transition: { repeat: Infinity, duration: 2, ease: "easeInOut" },
  },
};

// ============================================================================
// SPINNER / LOADING ANIMATIONS
// ============================================================================

export const spinnerRotate: Variants = {
  animate: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 1,
      ease: "linear",
    },
  },
};

export const pulseScale: Variants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.7, 1],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "easeInOut",
    },
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a delayed transition
 */
export const withDelay = (delay: number): Transition => ({
  delay,
  duration: DURATION.normal,
  ease: EASE.default,
});

/**
 * Creates variants with custom delay
 */
export const fadeInWithDelay = (delay: number): Variants => ({
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { delay, duration: DURATION.normal },
  },
});

/**
 * Creates slide up variants with custom delay
 */
export const slideUpWithDelay = (delay: number): Variants => ({
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { delay, duration: DURATION.normal, ease: EASE.default },
  },
});

// ============================================================================
// DROPDOWN ANIMATIONS
// ============================================================================

export const dropdownMenu: Variants = {
  initial: { opacity: 0, y: 8, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.fast },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.96,
    transition: { duration: DURATION.fast },
  },
};

// ============================================================================
// ICON BUTTON ANIMATIONS
// ============================================================================

export const iconButtonHover = {
  whileHover: { scale: 1.05, transition: { duration: DURATION.fast } },
  whileTap: { scale: 0.95 },
};

export const iconButtonPulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: { repeat: Infinity, duration: 2, ease: "easeInOut" },
  },
};

// ============================================================================
// PHASE INDICATOR ANIMATIONS
// ============================================================================

export const phaseItem = (index: number): Variants => ({
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { delay: index * 0.08, type: "spring" },
  },
});

export const phaseItemDesktop = (index: number): Variants => ({
  initial: { scale: 0.8, opacity: 0, y: 20 },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.1, type: "spring", stiffness: 200 },
  },
});

export const phaseCardHover = {
  whileHover: { scale: 1.08, y: -4 },
  whileTap: { scale: 0.98 },
};

export const phaseConnector = (index: number): Variants => ({
  initial: { scaleX: 0 },
  animate: {
    scaleX: 1,
    transition: { delay: index * 0.1 + 0.4, duration: 0.6, ease: "easeOut" },
  },
});

export const phaseLabel = (index: number): Variants => ({
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.1 + 0.2 },
  },
});

export const phaseBadge = (index: number): Variants => ({
  initial: { opacity: 0, scale: 0 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { delay: index * 0.1 + 0.3, type: "spring" },
  },
});

export const phaseCheck: Variants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 300, delay: 0.2 },
  },
};

export const phaseMobileInfo: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.4 },
  },
};

export const phaseConnectorDot = (index: number): Variants => ({
  initial: { left: 0 },
  animate: {
    left: "100%",
    transition: { delay: index * 0.1 + 0.4, duration: 0.6, ease: "easeOut" as const },
  },
});

// ============================================================================
// GAUGE ANIMATIONS (Coverage, Progress)
// ============================================================================

export const gaugeContainer: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASE.default },
  },
};

export const gaugeProgress = (percentage: number): Variants => ({
  initial: { pathLength: 0 },
  animate: {
    pathLength: percentage / 100,
    transition: { duration: 1.2, ease: EASE.smooth, delay: 0.3 },
  },
});

export const gaugeNumber: Variants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { delay: 0.5, type: "spring", stiffness: 200 },
  },
};

export const gaugeLabel: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.7, duration: DURATION.normal },
  },
};

// ============================================================================
// DASHBOARD SPECIFIC ANIMATIONS
// ============================================================================

export const dashboardHero: Variants = {
  initial: { opacity: 0, y: 30, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.slow, ease: EASE.smooth },
  },
};

export const statsCardHover = {
  whileHover: {
    y: -4,
    scale: 1.02,
    boxShadow: "0 10px 30px rgba(99, 102, 241, 0.15)",
    transition: { duration: 0.2 },
  },
  whileTap: { scale: 0.98 },
};

export const progressBarFill = (percentage: number): Variants => ({
  initial: { scaleX: 0, originX: 0 },
  animate: {
    scaleX: percentage / 100,
    originX: 0,
    transition: { duration: 1, ease: EASE.smooth, delay: 0.3 },
  },
});

export const tabSwitchContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: DURATION.fast },
  },
  exit: {
    opacity: 0,
    transition: { duration: DURATION.fast },
  },
};

export const numberCounter = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

export const toastSlideIn: Variants = {
  initial: { opacity: 0, y: 50, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.normal, ease: EASE.smooth },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: DURATION.fast },
  },
};

export const skeletonPulse: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "easeInOut",
    },
  },
};

export const iconHover = {
  whileHover: {
    rotate: 15,
    scale: 1.1,
    transition: { duration: DURATION.fast },
  },
};
