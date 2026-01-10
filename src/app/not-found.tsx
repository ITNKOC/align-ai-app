"use client";

import { motion } from "framer-motion";
import { Search, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { scaleIn, fadeIn } from "@/lib/animations";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950">
      <motion.div
        variants={scaleIn}
        initial="initial"
        animate="animate"
        className="glass rounded-2xl p-8 max-w-md w-full text-center border border-white/10"
      >
        {/* 404 Icon */}
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="mb-6"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4 ring-2 ring-indigo-500/30">
            <Search className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-6xl font-bold gradient-text mb-2">404</h1>
          <h2 className="text-xl font-semibold text-white mb-2">
            Page introuvable
          </h2>
          <p className="text-white/60 text-sm">
            La page que vous recherchez n&apos;existe pas ou a ete deplacee.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary flex items-center justify-center gap-2 w-full"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </motion.button>
          </Link>
          <Link href="/upload">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary flex items-center justify-center gap-2 w-full"
            >
              Nouvelle candidature
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
