"use client";

import { motion, useReducedMotion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { staggerContainer, staggerItem, DURATION } from "@/lib/animations";
import {
  Clock,
  Plus,
  Send,
  Calendar,
  Trophy,
  ArrowRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import type { ActivityAction, ActivityItem } from "@/actions/dashboard-actions";

// Re-export for backwards compatibility
export type ActivityItemData = ActivityItem;

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

// Icon and color config for each action type
const actionConfig: Record<
  ActivityAction,
  { icon: React.ElementType; color: string; bgColor: string; label: string }
> = {
  created: {
    icon: Plus,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    label: "Candidature creee",
  },
  status_changed: {
    icon: ArrowRight,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    label: "Statut modifie",
  },
  applied: {
    icon: Send,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/20",
    label: "Candidature envoyee",
  },
  interview_scheduled: {
    icon: Calendar,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    label: "Entretien planifie",
  },
  offer_received: {
    icon: Trophy,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    label: "Offre recue",
  },
};

function ActivityTimelineItem({
  activity,
  isLast,
  delay,
}: {
  activity: ActivityItem;
  isLast: boolean;
  delay: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const config = actionConfig[activity.action];
  const Icon = config.icon;

  const relativeTime = formatDistanceToNow(new Date(activity.timestamp), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: DURATION.normal, delay: prefersReducedMotion ? 0 : delay }}
      className="relative flex gap-3"
    >
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-4 top-10 w-px h-[calc(100%-8px)] bg-white/10" />
      )}

      {/* Icon */}
      <div
        className={`relative z-10 w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}
      >
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-4">
        <Link href={`/application/${activity.applicationId}`}>
          <div className="group cursor-pointer">
            <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors truncate">
              {activity.company || activity.jobTitle || "Candidature"}
            </p>
            <p className="text-xs text-white/50 mt-0.5">{config.label}</p>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-white/30" />
              <span className="text-xs text-white/30">{relativeTime}</span>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const prefersReducedMotion = useReducedMotion();

  if (activities.length === 0) {
    return (
      <div className="p-5 rounded-xl bg-white/[0.05] border border-white/10">
        <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          Activite recente
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-white/20" />
          </div>
          <p className="text-sm text-white/50">Aucune activite recente</p>
          <p className="text-xs text-white/30 mt-1">
            Vos actions apparaitront ici
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-xl bg-white/[0.05] border border-white/10">
      <motion.div
        variants={prefersReducedMotion ? undefined : staggerContainer(0.08)}
        initial="initial"
        animate="animate"
      >
        <motion.h3
          variants={prefersReducedMotion ? undefined : staggerItem}
          className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2"
        >
          <Activity className="w-4 h-4 text-indigo-400" />
          Activite recente
        </motion.h3>

        <div className="space-y-0">
          {activities.map((activity, index) => (
            <ActivityTimelineItem
              key={activity.id}
              activity={activity}
              isLast={index === activities.length - 1}
              delay={index * 0.08}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
