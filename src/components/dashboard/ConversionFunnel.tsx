"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  staggerContainer,
  staggerItem,
  DURATION,
  EASE,
} from "@/lib/animations";
import { TrendingUp, Users, Trophy, Briefcase } from "lucide-react";

interface ConversionFunnelProps {
  stats: {
    total: number;
    applied: number;
    interviews: number;
    offers: number;
  };
  conversionRates: {
    appliedToInterview: number;
    interviewToOffer: number;
    overallSuccess: number;
  };
}

// SVG Gauge component for conversion rate
function ConversionGauge({
  percentage,
  label,
  color,
  delay = 0,
}: {
  percentage: number;
  label: string;
  color: string;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-white/10"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={
              prefersReducedMotion
                ? { strokeDashoffset }
                : { strokeDashoffset }
            }
            transition={{
              duration: 1.2,
              ease: EASE.smooth,
              delay: prefersReducedMotion ? 0 : delay,
            }}
          />
        </svg>
        {/* Center percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : delay + 0.5 }}
            className="text-xl font-bold text-white"
          >
            {percentage}%
          </motion.span>
        </div>
      </div>
      <span className="text-xs text-white/50 text-center">{label}</span>
    </div>
  );
}

// Funnel bar component
function FunnelBar({
  label,
  value,
  maxValue,
  color,
  bgColor,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  bgColor: string;
  icon: React.ElementType;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.normal, delay: prefersReducedMotion ? 0 : delay }}
      className="flex items-center gap-3"
    >
      <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-white/70">{label}</span>
          <span className="text-sm font-semibold text-white">{value}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: percentage / 100 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.8,
              ease: EASE.smooth,
              delay: prefersReducedMotion ? 0 : delay + 0.2,
            }}
            className="h-full rounded-full origin-left"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function ConversionFunnel({ stats, conversionRates }: ConversionFunnelProps) {
  const prefersReducedMotion = useReducedMotion();

  const funnelData = [
    {
      label: "Total candidatures",
      value: stats.total,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/20",
      barColor: "#818cf8",
      icon: Briefcase,
    },
    {
      label: "Postulees",
      value: stats.applied,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      barColor: "#60a5fa",
      icon: TrendingUp,
    },
    {
      label: "Entretiens",
      value: stats.interviews,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
      barColor: "#22d3ee",
      icon: Users,
    },
    {
      label: "Offres",
      value: stats.offers,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
      barColor: "#34d399",
      icon: Trophy,
    },
  ];

  return (
    <div className="p-5 rounded-xl bg-white/[0.05] border border-white/10">
      <motion.div
        variants={prefersReducedMotion ? undefined : staggerContainer(0.1)}
        initial="initial"
        animate="animate"
      >
      <motion.h3
        variants={prefersReducedMotion ? undefined : staggerItem}
        className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2"
      >
        <TrendingUp className="w-4 h-4 text-indigo-400" />
        Tunnel de conversion
      </motion.h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel bars */}
        <motion.div
          variants={prefersReducedMotion ? undefined : staggerItem}
          className="space-y-3"
        >
          {funnelData.map((item, index) => (
            <FunnelBar
              key={item.label}
              label={item.label}
              value={item.value}
              maxValue={stats.total || 1}
              color={item.barColor}
              bgColor={item.bgColor}
              icon={item.icon}
              delay={index * 0.1}
            />
          ))}
        </motion.div>

        {/* Conversion gauges */}
        <motion.div
          variants={prefersReducedMotion ? undefined : staggerItem}
          className="flex items-center justify-around"
        >
          <ConversionGauge
            percentage={conversionRates.appliedToInterview}
            label="Candidatures → Entretiens"
            color="#22d3ee"
            delay={0.4}
          />
          <ConversionGauge
            percentage={conversionRates.interviewToOffer}
            label="Entretiens → Offres"
            color="#34d399"
            delay={0.6}
          />
        </motion.div>
      </div>

      {/* Overall success rate */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.8, duration: DURATION.normal }}
        className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between"
      >
        <span className="text-sm text-white/50">Taux de succes global</span>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-emerald-400">
            {conversionRates.overallSuccess}%
          </span>
          <Trophy className="w-5 h-5 text-emerald-400" />
        </div>
      </motion.div>
      </motion.div>
    </div>
  );
}
