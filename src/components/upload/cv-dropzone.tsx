"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CVDropzoneProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  maxSizeMB?: number;
}

export function CVDropzone({
  onFileSelect,
  isUploading = false,
  maxSizeMB = 5,
}: CVDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    if (file.type !== "application/pdf") {
      setError("Seuls les fichiers PDF sont acceptés");
      return false;
    }

    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`La taille du fichier doit être inférieure à ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    },
    [maxSizeMB]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  }, [selectedFile, onFileSelect]);

  return (
    <div className="w-full max-w-xl">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <label
              htmlFor="cv-upload"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 md:p-12 transition-all duration-500 overflow-hidden",
                isDragging
                  ? "border-indigo-500 bg-indigo-500/10 glow-primary"
                  : "border-white/20 glass hover:border-indigo-500/50 hover:glow-primary"
              )}
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Grid pattern */}
              <div className="absolute inset-0 dot-pattern opacity-30" />

              <motion.div
                animate={{
                  y: isDragging ? -10 : 0,
                  scale: isDragging ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative z-10"
              >
                <div
                  className={cn(
                    "rounded-2xl p-4 md:p-5 transition-all duration-500",
                    isDragging
                      ? "bg-indigo-500/30 ring-2 ring-indigo-500/50"
                      : "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 ring-1 ring-white/10 group-hover:ring-indigo-500/30"
                  )}
                >
                  <Upload
                    className={cn(
                      "h-8 w-8 md:h-10 md:w-10 transition-colors duration-300",
                      isDragging
                        ? "text-indigo-400"
                        : "text-white/50 group-hover:text-indigo-400"
                    )}
                  />
                </div>
              </motion.div>

              <motion.div
                className="relative z-10 mt-4 md:mt-6 text-center"
                animate={{ opacity: isDragging ? 0.7 : 1 }}
              >
                <p className="text-base md:text-lg font-medium text-white">
                  {isDragging
                    ? "Déposez votre CV ici"
                    : "Glissez-déposez votre CV"}
                </p>
                <p className="mt-1 md:mt-2 text-sm text-white/50">
                  ou <span className="text-indigo-400">cliquez pour sélectionner</span>
                </p>
                <p className="mt-3 md:mt-4 text-xs text-white/30">
                  PDF uniquement, max {maxSizeMB}MB
                </p>
              </motion.div>

              <input
                id="cv-upload"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleInputChange}
                className="hidden"
              />
            </label>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl p-5 md:p-6"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <motion.div
                className="rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 p-3 md:p-4 ring-1 ring-white/10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FileText className="h-6 w-6 md:h-8 md:w-8 text-indigo-400" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{selectedFile.name}</p>
                <p className="text-sm text-white/50">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={removeFile}
                className="rounded-full p-2 text-white/40 transition-all hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 md:mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={removeFile}
                disabled={isUploading}
                className="flex-1 glass border-white/10 text-white hover:bg-white/10"
              >
                Changer de fichier
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isUploading}
                className="flex-1 btn-futuristic"
              >
                {isUploading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                  />
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyser mon CV
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 flex items-center gap-2 rounded-xl glass bg-rose-500/10 border-rose-500/30 px-4 py-3 text-sm text-rose-400"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
