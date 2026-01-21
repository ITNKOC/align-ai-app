"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

const iconVariants = {
  initial: { scale: 0, rotate: -180, opacity: 0 },
  animate: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }
  },
  exit: {
    scale: 0,
    rotate: 180,
    opacity: 0,
    transition: { duration: 0.2 }
  },
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

// Helper to check if component is mounted (SSR-safe)
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  const { setTheme, resolvedTheme } = useTheme();

  if (!mounted) {
    // Return placeholder with same dimensions to avoid layout shift
    return (
      <div className="w-9 h-9 rounded-lg bg-white/5 dark:bg-white/5" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-9 h-9 flex items-center justify-center rounded-lg
        bg-white/5 hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10
        light:bg-slate-900/5 light:hover:bg-slate-900/10
        border border-transparent hover:border-white/10 dark:hover:border-white/10
        light:hover:border-slate-900/10
        transition-colors duration-200"
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Moon className="w-[18px] h-[18px] text-indigo-300" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Sun className="w-[18px] h-[18px] text-amber-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
