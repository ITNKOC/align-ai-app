"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderGit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Calendar,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { ProfileSection } from "./ProfileSection";
import { EditableField } from "./EditableField";
import { listItem } from "@/lib/animations";
import type { Project } from "@/lib/types";

interface ProjectListProps {
  projects: Project[];
  onUpdate: (index: number, updates: Partial<Project>) => Promise<void>;
  onAdd: () => Promise<void>;
  onDelete: (index: number) => Promise<void>;
  isLoading?: boolean;
}

export function ProjectList({
  projects,
  onUpdate,
  onAdd,
  onDelete,
  isLoading = false,
}: ProjectListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTech, setNewTech] = useState<Record<number, string>>({});

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      await onAdd();
      setExpandedIndex(projects.length);
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
    field: keyof Project,
    value: string | string[]
  ) => {
    await onUpdate(index, { [field]: value });
  };

  const handleAddTech = async (index: number) => {
    const tech = newTech[index]?.trim();
    if (!tech) return;

    const project = projects[index];
    const newTechStack = [...project.techStack, tech];
    await onUpdate(index, { techStack: newTechStack });
    setNewTech((prev) => ({ ...prev, [index]: "" }));
  };

  const handleRemoveTech = async (projectIndex: number, techIndex: number) => {
    const project = projects[projectIndex];
    const newTechStack = project.techStack.filter((_, i) => i !== techIndex);
    await onUpdate(projectIndex, { techStack: newTechStack });
  };

  return (
    <ProfileSection
      title="Projets"
      icon={<FolderGit2 className="w-5 h-5" />}
      iconColor="from-cyan-500 to-blue-500"
      count={projects.length}
      onAdd={handleAdd}
      addLabel={isAdding ? "Ajout..." : "Ajouter"}
      isEmpty={projects.length === 0}
      emptyMessage="Aucun projet"
    >
      <AnimatePresence mode="popLayout">
        {projects.map((project, index) => {
          const isExpanded = expandedIndex === index;
          const isDeleting = deletingIndex === index;

          return (
            <motion.div
              key={`project-${index}`}
              variants={listItem}
              initial="initial"
              animate="animate"
              exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
              layout
              className={`rounded-lg sm:rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden transition-colors ${
                isDeleting ? "opacity-50" : ""
              }`}
            >
              {/* Project Header */}
              <div
                className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <FolderGit2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate text-sm sm:text-base">
                    {project.name || "Nouveau projet"}
                  </p>
                  <p className="text-xs sm:text-sm text-white/50 line-clamp-1">
                    {project.description || "Description..."}
                  </p>
                  {/* Tech stack chips */}
                  {project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-1.5 sm:mt-2">
                      {project.techStack.slice(0, 3).map((tech, i) => (
                        <span
                          key={i}
                          className="px-1.5 sm:px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] sm:text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 3 && (
                        <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-[10px] sm:text-xs">
                          +{project.techStack.length - 3}
                        </span>
                      )}
                    </div>
                  )}
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
                      {/* Name and Year */}
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-[10px] sm:text-xs text-white/50 mb-1 px-2 sm:px-3">
                            Nom du projet
                          </label>
                          <EditableField
                            value={project.name}
                            onSave={(v) => handleUpdateField(index, "name", v)}
                            placeholder="Nom du projet"
                            showEditIcon={false}
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-[10px] sm:text-xs text-white/50 mb-1 px-2 sm:px-3">Annee</label>
                          <EditableField
                            value={project.year}
                            onSave={(v) => handleUpdateField(index, "year", v)}
                            placeholder="2024"
                            showEditIcon={false}
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-[10px] sm:text-xs text-white/50 mb-1 px-2 sm:px-3">Description</label>
                        <EditableField
                          value={project.description}
                          onSave={(v) => handleUpdateField(index, "description", v)}
                          placeholder="Decrivez votre projet..."
                          multiline
                          showEditIcon={false}
                        />
                      </div>

                      {/* Tech Stack */}
                      <div>
                        <label className="block text-[10px] sm:text-xs text-white/50 mb-1.5 sm:mb-2 px-2 sm:px-3">Technologies</label>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3 px-2 sm:px-3">
                          <AnimatePresence mode="popLayout">
                            {project.techStack.map((tech, techIndex) => (
                              <motion.span
                                key={`${tech}-${techIndex}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                layout
                                className="group flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs sm:text-sm"
                              >
                                {tech}
                                <button
                                  onClick={() => handleRemoveTech(index, techIndex)}
                                  className="ml-0.5 sm:ml-1 p-0.5 rounded hover:bg-red-500/20 text-cyan-400/60 hover:text-red-400 transition-colors"
                                >
                                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </button>
                              </motion.span>
                            ))}
                          </AnimatePresence>
                        </div>
                        <div className="flex gap-1.5 sm:gap-2 px-2 sm:px-3">
                          <input
                            type="text"
                            value={newTech[index] || ""}
                            onChange={(e) =>
                              setNewTech((prev) => ({ ...prev, [index]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddTech(index);
                              }
                            }}
                            placeholder="React..."
                            className="flex-1 min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/30 text-xs sm:text-sm focus:outline-none focus:border-cyan-500/50"
                          />
                          <button
                            onClick={() => handleAddTech(index)}
                            disabled={!newTech[index]?.trim()}
                            className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs sm:text-sm font-medium hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
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
                        <h3 className="font-semibold text-white">Supprimer ce projet ?</h3>
                      </div>
                      <p className="text-sm text-white/60 mb-6">
                        Cette action est irreversible. Le projet "{project.name}" sera supprime de
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
