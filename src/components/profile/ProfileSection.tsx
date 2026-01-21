"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface ProfileSectionProps {
  title: string;
  icon: ReactNode;
  iconColor?: string;
  count?: number;
  children: ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export function ProfileSection({
  title,
  icon,
  iconColor = "from-indigo-500 to-purple-600",
  count,
  children,
  onAdd,
  addLabel = "Ajouter",
  isEmpty = false,
  emptyMessage = "Aucun element",
}: ProfileSectionProps) {
  return (
    <motion.div
      variants={staggerContainer(0.1)}
      initial="initial"
      animate="animate"
      className="card-modern p-3 sm:p-4 md:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${iconColor} flex items-center justify-center text-white`}
          >
            <span className="[&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5">{icon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
              {title}
              {typeof count === "number" && (
                <span className="text-[10px] sm:text-xs text-white/40 font-normal">({count})</span>
              )}
            </h3>
          </div>
        </div>

        {/* Add button */}
        {onAdd && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAdd}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs sm:text-sm font-medium hover:bg-indigo-500/30 transition-colors"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{addLabel}</span>
            <span className="sm:hidden">+</span>
          </motion.button>
        )}
      </div>

      {/* Content */}
      {isEmpty ? (
        <motion.div variants={staggerItem} className="py-6 sm:py-8 text-center">
          <p className="text-white/40 text-xs sm:text-sm italic">{emptyMessage}</p>
          {onAdd && (
            <button
              onClick={onAdd}
              className="mt-2 sm:mt-3 text-indigo-400 text-xs sm:text-sm hover:text-indigo-300 transition-colors"
            >
              + {addLabel}
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-2 sm:space-y-3">{children}</div>
      )}
    </motion.div>
  );
}
