"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

interface EditableFieldProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  inputClassName?: string;
  showEditIcon?: boolean;
  emptyText?: string;
}

export function EditableField({
  value,
  onSave,
  placeholder = "Cliquez pour editer...",
  multiline = false,
  className = "",
  inputClassName = "",
  showEditIcon = true,
  emptyText = "Non renseigne",
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Sync local value when prop changes
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value);
    }
  }, [value, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  // Debounced auto-save (500ms)
  const debouncedSave = useDebouncedCallback(async (newValue: string) => {
    if (newValue === value) return;

    setIsSaving(true);
    setError(null);
    try {
      await onSave(newValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de sauvegarde");
      // Revert on error
      setLocalValue(value);
    } finally {
      setIsSaving(false);
    }
  }, 500);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedSave(newValue);
  }, [debouncedSave]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      debouncedSave.flush();
      setIsEditing(false);
    }
    if (e.key === "Escape") {
      setLocalValue(value);
      setIsEditing(false);
      setError(null);
    }
  };

  const handleBlur = () => {
    debouncedSave.flush();
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const displayValue = localValue || emptyText;
  const isEmpty = !localValue;

  return (
    <div className={`relative group ${className}`}>
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative"
          >
            {multiline ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={localValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder={placeholder}
                rows={3}
                className={`w-full px-3 py-2 rounded-lg bg-white/10 border border-indigo-500/50 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none ${inputClassName}`}
              />
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={localValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder={placeholder}
                className={`w-full px-3 py-2 rounded-lg bg-white/10 border border-indigo-500/50 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${inputClassName}`}
              />
            )}

            {/* Saving indicator */}
            <AnimatePresence>
              {isSaving && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleStartEdit}
            className={`cursor-pointer px-3 py-2 rounded-lg transition-colors hover:bg-white/5 ${
              isEmpty ? "text-white/40 italic" : "text-white/80"
            }`}
          >
            <span className={multiline ? "whitespace-pre-wrap" : ""}>
              {displayValue}
            </span>

            {/* Edit icon on hover */}
            {showEditIcon && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Pencil className="w-3.5 h-3.5 text-indigo-400" />
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-red-400 mt-1 px-3"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
