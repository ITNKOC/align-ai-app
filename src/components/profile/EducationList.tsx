"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Trash2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react";
import { ProfileSection } from "./ProfileSection";
import { EditableField } from "./EditableField";
import { listItem } from "@/lib/animations";
import type { Education } from "@/lib/types";

interface EducationListProps {
  education: Education[];
  onUpdate: (index: number, updates: Partial<Education>) => Promise<void>;
  onAdd: () => Promise<void>;
  onDelete: (index: number) => Promise<void>;
  isLoading?: boolean;
}

export function EducationList({
  education,
  onUpdate,
  onAdd,
  onDelete,
  isLoading = false,
}: EducationListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      await onAdd();
      setExpandedIndex(education.length);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (index: number) => {
    setDeletingIndex(index);
    try {
      await onDelete(index);
      setShowDeleteConfirm(null);
      if (expandedIndex === index) {
        setExpandedIndex(null);
      }
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleUpdateField = async (index: number, field: keyof Education, value: string) => {
    await onUpdate(index, { [field]: value });
  };

  return (
    <ProfileSection
      title="Formation"
      icon={<GraduationCap className="w-5 h-5" />}
      iconColor="from-purple-500 to-pink-500"
      count={education.length}
      onAdd={handleAdd}
      addLabel={isAdding ? "Ajout..." : "Ajouter"}
      isEmpty={education.length === 0}
      emptyMessage="Aucune formation"
    >
      <AnimatePresence mode="popLayout">
        {education.map((edu, index) => {
          const isExpanded = expandedIndex === index;
          const isDeleting = deletingIndex === index;

          return (
            <motion.div
              key={`edu-${index}`}
              variants={listItem}
              initial="initial"
              animate="animate"
              exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
              layout
              className={`rounded-lg sm:rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden transition-colors ${
                isDeleting ? "opacity-50" : ""
              }`}
            >
              {/* Education Header */}
              <div
                className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate text-sm sm:text-base">
                    {edu.degree || "Nouveau diplome"}
                  </p>
                  <p className="text-xs sm:text-sm text-emerald-400 truncate">{edu.school || "Etablissement"}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs text-white/40">
                    {edu.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="truncate max-w-[60px] sm:max-w-none">{edu.location}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {edu.startDate || "?"} - {edu.endDate || "Actuel"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(index);
                    }}
                    disabled={isDeleting}
                    className="p-1.5 sm:p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                  )}
                </div>
              </div>

              {/* Expanded Edit Form */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-white/5"
                  >
                    <div className="p-2.5 sm:p-4 space-y-3 sm:space-y-4">
                      {/* Degree and School */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                        <div>
                          <label className="block text-[10px] sm:text-xs text-white/50 mb-1 px-2 sm:px-3">Diplome</label>
                          <EditableField
                            value={edu.degree}
                            onSave={(v) => handleUpdateField(index, "degree", v)}
                            placeholder="Master, Licence..."
                            showEditIcon={false}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-xs text-white/50 mb-1 px-2 sm:px-3">
                            Etablissement
                          </label>
                          <EditableField
                            value={edu.school}
                            onSave={(v) => handleUpdateField(index, "school", v)}
                            placeholder="Ecole/universite"
                            showEditIcon={false}
                          />
                        </div>
                      </div>

                      {/* Location and Dates */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-[10px] sm:text-xs text-white/50 mb-1 px-2 sm:px-3">Lieu</label>
                          <EditableField
                            value={edu.location}
                            onSave={(v) => handleUpdateField(index, "location", v)}
                            placeholder="Ville, Pays"
                            showEditIcon={false}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-xs text-white/50 mb-1 px-2 sm:px-3">Debut</label>
                          <EditableField
                            value={edu.startDate}
                            onSave={(v) => handleUpdateField(index, "startDate", v)}
                            placeholder="2018"
                            showEditIcon={false}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-xs text-white/50 mb-1 px-2 sm:px-3">Fin</label>
                          <EditableField
                            value={edu.endDate}
                            onSave={(v) => handleUpdateField(index, "endDate", v)}
                            placeholder="2022"
                            emptyText="En cours"
                            showEditIcon={false}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Delete Confirmation */}
              <AnimatePresence>
                {showDeleteConfirm === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setShowDeleteConfirm(null)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="card-modern p-6 max-w-sm w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="font-semibold text-white">Supprimer cette formation ?</h3>
                      </div>
                      <p className="text-sm text-white/60 mb-6">
                        Cette action est irreversible. La formation "{edu.degree}" sera supprimee de
                        votre profil.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="btn-ghost flex-1 py-2.5"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          disabled={isDeleting}
                          className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Supprimer
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </ProfileSection>
  );
}
