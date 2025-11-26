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
    <div className="w-full max-w-2xl">
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
                "group relative flex cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed p-10 md:p-16 transition-all duration-500 overflow-hidden",
                isDragging
                  ? "border-indigo-500 bg-indigo-500/10 scale-105"
                  : "border-white/20 glass hover:border-indigo-500/50"
              )}
            >
              {/* Animated background gradient */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-cyan-500/5 transition-opacity duration-500",
                isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )} />

              {/* Grid pattern */}
              <div className="absolute inset-0 grid-pattern opacity-20" />

              {/* Top gradient accent */}
              <motion.div
                className={cn(
                  "absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent transition-opacity",
                  isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isDragging ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />

              <motion.div
                animate={{
                  y: isDragging ? -15 : 0,
                  scale: isDragging ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative z-10"
              >
                {/* Icon container with premium styling */}
                <div className="relative">
                  {/* Glow effect */}
                  <motion.div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-2xl transition-opacity",
                      isDragging ? "opacity-60" : "opacity-0 group-hover:opacity-40"
                    )}
                  />

                  {/* Icon box */}
                  <div
                    className={cn(
                      "relative rounded-3xl p-6 md:p-8 transition-all duration-500",
                      isDragging
                        ? "bg-gradient-to-br from-indigo-500 to-purple-500 shadow-2xl shadow-indigo-500/50"
                        : "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 ring-2 ring-white/10 group-hover:ring-indigo-500/30"
                    )}
                  >
                    <Upload
                      className={cn(
                        "h-12 w-12 md:h-16 md:w-16 transition-colors duration-300",
                        isDragging
                          ? "text-white"
                          : "text-white/50 group-hover:text-indigo-400"
                      )}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="relative z-10 mt-8 md:mt-10 text-center max-w-md"
                animate={{ opacity: isDragging ? 0.9 : 1 }}
              >
                <p className="text-xl md:text-2xl font-bold text-white mb-3">
                  {isDragging
                    ? "Déposez votre CV ici"
                    : "Glissez-déposez votre CV"}
                </p>
                <p className="text-base md:text-lg text-white/60 mb-4">
                  ou{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-bold">
                    cliquez pour sélectionner
                  </span>
                </p>

                {/* Format info badge */}
                <div className="inline-flex items-center gap-2 rounded-full glass border border-white/10 px-4 py-2 backdrop-blur-xl">
                  <FileText className="h-4 w-4 text-indigo-400" />
                  <span className="text-sm text-white/50">
                    PDF uniquement · max {maxSizeMB}MB
                  </span>
                </div>
              </motion.div>

              <input
                id="cv-upload"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleInputChange}
                className="hidden"
              />

              {/* Bottom shine */}
              <motion.div
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent transition-opacity",
                  isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isDragging ? 1 : 0 }}
                transition={{ duration: 0.3 }}
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
            className="glass rounded-[28px] p-6 md:p-8 border border-white/10 backdrop-blur-xl relative overflow-hidden"
          >
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

            {/* File info */}
            <div className="flex items-center gap-4 md:gap-5 mb-6">
              <div className="relative flex-shrink-0">
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-2xl blur-xl opacity-40" />

                {/* Icon container */}
                <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center shadow-xl">
                  <FileText className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-lg md:text-xl font-bold text-white truncate mb-1">{selectedFile.name}</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/60">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <div className="h-1 w-1 rounded-full bg-white/30" />
                  <span className="text-sm text-cyan-400 font-semibold">PDF</span>
                </div>
              </div>

              <button
                onClick={removeFile}
                className="rounded-full p-2.5 text-white/40 transition-all hover:bg-white/10 hover:text-white hover:scale-110"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={removeFile}
                disabled={isUploading}
                className="flex-1 glass border-white/20 hover:border-indigo-500/50 text-white hover:bg-white/10 py-6 text-base font-semibold rounded-2xl"
              >
                Changer de fichier
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isUploading}
                className="flex-1 btn-futuristic py-6 text-base font-bold rounded-2xl shadow-2xl shadow-indigo-500/50"
              >
                {isUploading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                  />
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyser mon CV
                  </>
                )}
              </Button>
            </div>

            {/* Bottom shine */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
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
            className="mt-4 flex items-center gap-3 rounded-2xl glass bg-rose-500/10 border border-rose-500/30 px-5 py-4 backdrop-blur-xl"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-400" />
            <span className="text-sm md:text-base text-rose-300 font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
