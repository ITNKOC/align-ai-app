"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Trash2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { ProfileSection } from "./ProfileSection";
import { EditableField } from "./EditableField";
import { listItem } from "@/lib/animations";
import type { Experience } from "@/lib/types";

interface ExperienceListProps {
  experiences: Experience[];
  onUpdate: (index: number, updates: Partial<Experience>) => Promise<void>;
  onAdd: () => Promise<void>;
  onDelete: (index: number) => Promise<void>;
  isLoading?: boolean;
}

export function ExperienceList({
  experiences,
  onUpdate,
  onAdd,
  onDelete,
  isLoading = false,
}: ExperienceListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      await onAdd();
      // Expand the new item (last in list)
      setExpandedIndex(experiences.length);
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

  const handleUpdateField = async (
    index: number,
    field: keyof Experience,
    value: string | string[]
  ) => {
    await onUpdate(index, { [field]: value });
  };

  const handleAddBullet = async (index: number) => {
    const exp = experiences[index];
    const newBullets = [...exp.bullets, ""];
    await onUpdate(index, { bullets: newBullets });
  };

  const handleUpdateBullet = async (expIndex: number, bulletIndex: number, value: string) => {
    const exp = experiences[expIndex];
    const newBullets = [...exp.bullets];
    newBullets[bulletIndex] = value;
    await onUpdate(expIndex, { bullets: newBullets });
  };

  const handleRemoveBullet = async (expIndex: number, bulletIndex: number) => {
    const exp = experiences[expIndex];
    const newBullets = exp.bullets.filter((_, i) => i !== bulletIndex);
    await onUpdate(expIndex, { bullets: newBullets });
  };

  return (
    <ProfileSection
      title="Experiences"
      icon={<Briefcase className="w-5 h-5" />}
      iconColor="from-amber-500 to-orange-500"
      count={experiences.length}
      onAdd={handleAdd}
      addLabel={isAdding ? "Ajout..." : "Ajouter"}
      isEmpty={experiences.length === 0}
      emptyMessage="Aucune experience professionnelle"
    >
      <AnimatePresence mode="popLayout">
        {experiences.map((exp, index) => {
          const isExpanded = expandedIndex === index;
          const isDeleting = deletingIndex === index;

          return (
            <motion.div
              key={`exp-${index}`}
              variants={listItem}
              initial="initial"
              animate="animate"
              exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
              layout
              className={`rounded-lg sm:rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden transition-colors ${
                isDeleting ? "opacity-50" : ""
              }`}
            >
              {/* Experience Header (always visible) */}
              <div
                className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate text-sm sm:text-base">{exp.title || "Nouveau poste"}</p>
                  <p className="text-xs sm:text-sm text-indigo-400 truncate">
                    {exp.company || "Entreprise"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs text-white/40">
                    {exp.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="truncate max-w-[80px] sm:max-w-none">{exp.location}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {exp.startDate || "?"} - {exp.endDate || "Actuel"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  {/* Delete button */}
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
                  {/* Expand/collapse */}
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
                      {/* Title and Company */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                        <div>
                          <label className="block text-[10px] sm:text-xs text-white/50 mb-1 px-2 sm:px-3">Poste</label>
                          <EditableField
                            value={exp.title}
                            onSave={(v) => handleUpdateField(index, "title", v)}
                            placeholder="Titre du poste"
                            showEditIcon={false}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-xs text-white/50 mb-1 px-2 sm:px-3">
                            Entreprise
                          </label>
                          <EditableField
                            value={exp.company}
                            onSave={(v) => handleUpdateField(index, "company", v)}
                            placeholder="Nom de l'entreprise"
                            showEditIcon={false}
                          />
                        </div>
                      </div>

                      {/* Location and Dates */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-[10px] sm:text-xs text-white/50 mb-1 px-2 sm:px-3">Lieu</label>
                          <EditableField
                            value={exp.location}
                            onSave={(v) => handleUpdateField(index, "location", v)}
                            placeholder="Ville, Pays"
                            showEditIcon={false}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-xs text-white/50 mb-1 px-2 sm:px-3">Debut</label>
                          <EditableField
                            value={exp.startDate}
                            onSave={(v) => handleUpdateField(index, "startDate", v)}
                            placeholder="Jan 2020"
                            showEditIcon={false}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-xs text-white/50 mb-1 px-2 sm:px-3">Fin</label>
                          <EditableField
                            value={exp.endDate}
                            onSave={(v) => handleUpdateField(index, "endDate", v)}
                            placeholder="Actuel"
                            emptyText="Actuel"
                            showEditIcon={false}
                          />
                        </div>
                      </div>

                      {/* Bullet Points */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] sm:text-xs text-white/50 px-2 sm:px-3">Realisations</label>
                          <button
                            onClick={() => handleAddBullet(index)}
                            className="text-[10px] sm:text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-indigo-500/10 transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="hidden sm:inline">Ajouter</span>
                            <span className="sm:hidden">+</span>
                          </button>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          {exp.bullets.map((bullet, bulletIndex) => (
                            <div key={bulletIndex} className="flex items-start gap-1.5 sm:gap-2">
                              <span className="text-indigo-400 mt-2 sm:mt-2.5 text-xs sm:text-base">•</span>
                              <div className="flex-1 min-w-0">
                                <EditableField
                                  value={bullet}
                                  onSave={(v) => handleUpdateBullet(index, bulletIndex, v)}
                                  placeholder="Description..."
                                  showEditIcon={false}
                                />
                              </div>
                              <button
                                onClick={() => handleRemoveBullet(index, bulletIndex)}
                                className="p-1 sm:p-1.5 rounded text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors mt-0.5 sm:mt-1 flex-shrink-0"
                              >
                                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              </button>
                            </div>
                          ))}
                          {exp.bullets.length === 0 && (
                            <p className="text-xs sm:text-sm text-white/30 italic px-2 sm:px-3 py-2">
                              Ajoutez des realisations
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Delete Confirmation Modal */}
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
                        <h3 className="font-semibold text-white">Supprimer cette experience ?</h3>
                      </div>
                      <p className="text-sm text-white/60 mb-6">
                        Cette action est irreversible. L'experience "{exp.title}" sera supprimee
                        de votre profil.
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
