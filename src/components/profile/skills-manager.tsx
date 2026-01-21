"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code,
  Plus,
  X,
  Sparkles,
  Brain,
  Wrench,
  Database,
  Cloud,
  Users,
  Check,
  Loader2,
} from "lucide-react";
import type { Skills } from "@/lib/types";

interface SkillsManagerProps {
  skills: Skills;
  onUpdateSkills: (skills: Skills) => Promise<void>;
  isLoading?: boolean;
}

// Only include editable string[] categories (exclude dynamicCategories)
type EditableSkillCategory = "languages" | "frameworks" | "aiAndData" | "toolsAndCloud" | "softSkills";

const categoryConfig: Record<EditableSkillCategory, { label: string; icon: React.ReactNode; color: string }> = {
  languages: {
    label: "Langages",
    icon: <Code className="w-4 h-4" />,
    color: "from-blue-500 to-cyan-500",
  },
  frameworks: {
    label: "Frameworks",
    icon: <Wrench className="w-4 h-4" />,
    color: "from-purple-500 to-pink-500",
  },
  aiAndData: {
    label: "IA & Data",
    icon: <Brain className="w-4 h-4" />,
    color: "from-emerald-500 to-teal-500",
  },
  toolsAndCloud: {
    label: "Outils & Cloud",
    icon: <Cloud className="w-4 h-4" />,
    color: "from-orange-500 to-amber-500",
  },
  softSkills: {
    label: "Soft Skills",
    icon: <Users className="w-4 h-4" />,
    color: "from-rose-500 to-red-500",
  },
};

export function SkillsManager({ skills, onUpdateSkills, isLoading }: SkillsManagerProps) {
  const [editingCategory, setEditingCategory] = useState<EditableSkillCategory | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Skills | null>(null);

  const currentSkills = pendingChanges || skills;

  const handleAddSkill = (category: EditableSkillCategory) => {
    if (!newSkill.trim()) return;

    const updatedSkills = {
      ...currentSkills,
      [category]: [...(currentSkills[category] || []), newSkill.trim()],
    };

    setPendingChanges(updatedSkills);
    setNewSkill("");
  };

  const handleRemoveSkill = (category: EditableSkillCategory, skillToRemove: string) => {
    const updatedSkills = {
      ...currentSkills,
      [category]: (currentSkills[category] || []).filter((s) => s !== skillToRemove),
    };

    setPendingChanges(updatedSkills);
  };

  const handleSave = async () => {
    if (!pendingChanges) return;

    setIsSaving(true);
    try {
      await onUpdateSkills(pendingChanges);
      setPendingChanges(null);
      setEditingCategory(null);
    } catch (error) {
      console.error("Failed to save skills:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setPendingChanges(null);
    setEditingCategory(null);
    setNewSkill("");
  };

  const hasChanges = pendingChanges !== null;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base">Mes Competences</h3>
            <p className="text-[10px] sm:text-xs text-white/50">
              {(Object.keys(categoryConfig) as EditableSkillCategory[]).reduce((acc, cat) => acc + (currentSkills[cat]?.length || 0), 0)} competences
            </p>
          </div>
        </div>

        {/* Save/Cancel buttons */}
        <AnimatePresence>
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 sm:gap-2"
            >
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors flex items-center gap-1.5 sm:gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
                <span className="hidden sm:inline">Enregistrer</span>
                <span className="sm:hidden">OK</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skills by category */}
      <div className="space-y-3">
        {(Object.keys(categoryConfig) as EditableSkillCategory[]).map((category) => {
          const config = categoryConfig[category];
          const categorySkills = currentSkills[category] || [];
          const isEditing = editingCategory === category;

          return (
            <motion.div
              key={category}
              layout
              className="p-2.5 sm:p-4 rounded-lg sm:rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors"
            >
              {/* Category header */}
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center text-white [&>svg]:w-3 [&>svg]:h-3 sm:[&>svg]:w-4 sm:[&>svg]:h-4`}
                  >
                    {config.icon}
                  </div>
                  <span className="font-medium text-white text-sm sm:text-base">{config.label}</span>
                  <span className="text-[10px] sm:text-xs text-white/40">({categorySkills.length})</span>
                </div>
                <button
                  onClick={() => setEditingCategory(isEditing ? null : category)}
                  className={`p-1 sm:p-1.5 rounded-lg transition-colors ${
                    isEditing
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "hover:bg-white/10 text-white/50 hover:text-white"
                  }`}
                >
                  {isEditing ? <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>
              </div>

              {/* Skills list */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {categorySkills.map((skill, index) => (
                  <motion.span
                    key={`${skill}-${index}`}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`group px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm transition-all ${
                      isEditing
                        ? "bg-white/10 text-white pr-1.5 sm:pr-2"
                        : "bg-white/[0.06] text-white/80"
                    }`}
                  >
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveSkill(category, skill)}
                        className="ml-1 sm:ml-2 p-0.5 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                      >
                        <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </button>
                    )}
                  </motion.span>
                ))}

                {categorySkills.length === 0 && !isEditing && (
                  <span className="text-xs sm:text-sm text-white/30 italic">Aucune competence</span>
                )}
              </div>

              {/* Add skill input */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/10"
                  >
                    <div className="flex gap-1.5 sm:gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddSkill(category);
                          }
                        }}
                        placeholder="Ajouter..."
                        className="flex-1 min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/30 text-xs sm:text-sm focus:outline-none focus:border-indigo-500/50"
                      />
                      <button
                        onClick={() => handleAddSkill(category)}
                        disabled={!newSkill.trim()}
                        className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg bg-indigo-500/20 text-indigo-400 text-xs sm:text-sm font-medium hover:bg-indigo-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
