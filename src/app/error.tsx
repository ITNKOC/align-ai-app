"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { scaleIn, fadeIn } from "@/lib/animations";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
    console.error("[APP_ERROR]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950">
      <motion.div
        variants={scaleIn}
        initial="initial"
        animate="animate"
        className="glass rounded-2xl p-8 max-w-md w-full text-center border border-white/10"
      >
        {/* Error Icon */}
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="mb-6"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mb-4 ring-2 ring-red-500/30">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Oups ! Une erreur est survenue
          </h1>
          <p className="text-white/60 text-sm">
            Ne vous inquietez pas, nous pouvons reessayer.
          </p>
        </motion.div>

        {/* Error Details (dev mode) */}
        {process.env.NODE_ENV === "development" && (
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-left"
          >
            <p className="text-xs font-mono text-red-300 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-white/40 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => reset()}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reessayer
          </motion.button>
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary flex items-center justify-center gap-2 w-full"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </motion.button>
          </Link>
        </motion.div>

        {/* Back link */}
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="mt-6"
        >
          <button
            onClick={() => window.history.back()}
            className="text-sm text-white/40 hover:text-white/60 transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Retourner a la page precedente
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
