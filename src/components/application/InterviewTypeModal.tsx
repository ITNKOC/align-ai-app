"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Users, UserCog, Calendar, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { modalOverlay, modalContent, staggerContainer, staggerItem, buttonHover } from "@/lib/animations";

export type InterviewType = "technical" | "hr" | "manager";

interface InterviewTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: InterviewType, date?: Date) => Promise<void>;
}

const interviewTypes = [
  {
    id: "technical" as const,
    label: "Technique",
    description: "Evaluation des competences techniques, code, architecture",
    icon: Briefcase,
    color: "indigo",
    bgClass: "bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30",
    selectedClass: "bg-indigo-500/30 border-indigo-500",
    iconClass: "text-indigo-400",
  },
  {
    id: "hr" as const,
    label: "RH / Recruteur",
    description: "Entretien de motivation, culture fit, parcours",
    icon: Users,
    color: "emerald",
    bgClass: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30",
    selectedClass: "bg-emerald-500/30 border-emerald-500",
    iconClass: "text-emerald-400",
  },
  {
    id: "manager" as const,
    label: "Manager / N+1",
    description: "Evaluation manageriale, leadership, vision",
    icon: UserCog,
    color: "amber",
    bgClass: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30",
    selectedClass: "bg-amber-500/30 border-amber-500",
    iconClass: "text-amber-400",
  },
];

export function InterviewTypeModal({ isOpen, onClose, onConfirm }: InterviewTypeModalProps) {
  const [selectedType, setSelectedType] = useState<InterviewType | null>(null);
  const [interviewDate, setInterviewDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!selectedType) return;
    setIsSubmitting(true);
    try {
      await onConfirm(selectedType, interviewDate ? new Date(interviewDate) : undefined);
      // Reset state after successful submission
      setSelectedType(null);
      setInterviewDate("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setSelectedType(null);
    setInterviewDate("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="bg-zinc-900/95 backdrop-blur-xl border-white/10 sm:max-w-lg"
        showCloseButton={!isSubmitting}
      >
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            Preparation a l'entretien
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Selectionnez le type d'entretien pour generer un document de preparation personnalise.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          className="space-y-4 py-4"
          variants={staggerContainer(0.1)}
          initial="initial"
          animate="animate"
        >
          {/* Interview Type Selection */}
          <div className="space-y-3">
            {interviewTypes.map((type, index) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;

              return (
                <motion.button
                  key={type.id}
                  variants={staggerItem}
                  onClick={() => setSelectedType(type.id)}
                  disabled={isSubmitting}
                  className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                    isSelected ? type.selectedClass : type.bgClass
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  whileHover={!isSubmitting ? { scale: 1.02 } : undefined}
                  whileTap={!isSubmitting ? { scale: 0.98 } : undefined}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-white/10" : "bg-white/5"}`}>
                      <Icon className={`h-5 w-5 ${type.iconClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{type.label}</span>
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`text-xs px-2 py-0.5 rounded-full ${type.iconClass} bg-white/10`}
                          >
                            Selectionne
                          </motion.span>
                        )}
                      </div>
                      <p className="text-sm text-white/50 mt-1">{type.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Optional Date Picker */}
          <motion.div
            variants={staggerItem}
            className="space-y-2"
          >
            <label className="flex items-center gap-2 text-sm font-medium text-white/70">
              <Calendar className="h-4 w-4" />
              Date de l'entretien (optionnel)
            </label>
            <input
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </motion.div>
        </motion.div>

        <DialogFooter className="gap-3 sm:gap-3">
          <motion.button
            {...buttonHover}
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </motion.button>
          <motion.button
            {...buttonHover}
            onClick={handleConfirm}
            disabled={!selectedType || isSubmitting}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generation en cours...
              </>
            ) : (
              "Generer la preparation"
            )}
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
