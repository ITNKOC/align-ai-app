"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion, useSpring, useTransform, useInView } from "framer-motion";
import { toast } from "sonner";
import {
  staggerContainer,
  staggerItem,
  dashboardHero,
  statsCardHover,
  cardHover,
  buttonHover,
  iconHover,
  skeletonPulse,
} from "@/lib/animations";

// Animated counter component for stats
function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    if (isInView && !prefersReducedMotion) {
      spring.set(value);
    }
  }, [spring, value, isInView, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <span className={className}>{value}</span>;
  }

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  Building2,
  FileText,
  Mail,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  Target,
  Bell,
  Loader2,
  Trash2,
  ChevronRight,
  AlertCircle,
  Flame,
  Trophy,
  Zap,
  ArrowRight,
  Filter,
  BarChart3,
  CalendarDays,
  Send,
  Eye,
  Star,
  Sparkles,
} from "lucide-react";
import { AppNavbar } from "@/components/shared/app-navbar";
import {
  getApplications,
  getDashboardStats,
  getFollowUpReminders,
  getRecentActivity,
  deleteApplication,
  type DashboardApplication,
  type DashboardStats,
  type ApplicationStatus,
  type ActivityItem,
} from "@/actions/dashboard-actions";
import { ConversionFunnel } from "@/components/dashboard/ConversionFunnel";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";

// Status configuration with icons
const statusConfig: Record<
  ApplicationStatus,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  analyzing: { label: "Analyse", color: "text-blue-400", bgColor: "bg-blue-500/15", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  chatting: { label: "Chat", color: "text-purple-400", bgColor: "bg-purple-500/15", icon: <Zap className="w-3 h-3" /> },
  strategies_complete: { label: "Pret", color: "text-amber-400", bgColor: "bg-amber-500/15", icon: <CheckCircle2 className="w-3 h-3" /> },
  documents_ready: { label: "Documents", color: "text-emerald-400", bgColor: "bg-emerald-500/15", icon: <FileText className="w-3 h-3" /> },
  applied: { label: "Postule", color: "text-indigo-400", bgColor: "bg-indigo-500/15", icon: <Send className="w-3 h-3" /> },
  interview_scheduled: { label: "Entretien", color: "text-cyan-400", bgColor: "bg-cyan-500/15", icon: <Calendar className="w-3 h-3" /> },
  interview_done: { label: "Entretien fait", color: "text-teal-400", bgColor: "bg-teal-500/15", icon: <CheckCircle2 className="w-3 h-3" /> },
  offer_received: { label: "Offre", color: "text-green-400", bgColor: "bg-green-500/15", icon: <Trophy className="w-3 h-3" /> },
  accepted: { label: "Accepte", color: "text-green-300", bgColor: "bg-green-500/20", icon: <Star className="w-3 h-3" /> },
  rejected: { label: "Refuse", color: "text-red-400", bgColor: "bg-red-500/15", icon: <XCircle className="w-3 h-3" /> },
  withdrawn: { label: "Retire", color: "text-zinc-400", bgColor: "bg-zinc-500/15", icon: <XCircle className="w-3 h-3" /> },
};

const DAILY_GOAL = 20;

export default function DashboardPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [applications, setApplications] = useState<DashboardApplication[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reminders, setReminders] = useState<{ id: string; jobTitle: string | null; company: string | null }[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "in_progress" | "applied" | "completed">("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appsResult, statsResult, remindersResult, activitiesResult] = await Promise.all([
        getApplications(),
        getDashboardStats(),
        getFollowUpReminders(),
        getRecentActivity(),
      ]);

      if (appsResult.success && appsResult.applications) {
        setApplications(appsResult.applications);
      }
      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }
      if (remindersResult.success && remindersResult.reminders) {
        setReminders(remindersResult.reminders);
      }
      if (activitiesResult.success && activitiesResult.activities) {
        setActivities(activitiesResult.activities);
      }
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Supprimer cette candidature ?")) return;

    setDeletingId(id);
    const result = await deleteApplication(id);
    if (result.success) {
      setApplications((prev) => prev.filter((a) => a.id !== id));
      toast.success("Candidature supprimee");
    } else {
      toast.error(result.error);
    }
    setDeletingId(null);
  };

  // Calculate today's applications
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayApplied = applications.filter(app => {
    if (!app.appliedAt) return false;
    const appliedDate = new Date(app.appliedAt);
    appliedDate.setHours(0, 0, 0, 0);
    return appliedDate.getTime() === today.getTime();
  }).length;

  const todayCreated = applications.filter(app => {
    const createdDate = new Date(app.createdAt);
    createdDate.setHours(0, 0, 0, 0);
    return createdDate.getTime() === today.getTime();
  }).length;

  const dailyProgress = Math.min((todayCreated / DAILY_GOAL) * 100, 100);

  // Memoized tab counts - only recalculate when applications change
  const tabCounts = useMemo(() => ({
    all: applications.length,
    in_progress: applications.filter(a => ["analyzing", "chatting", "strategies_complete", "documents_ready"].includes(a.status)).length,
    applied: applications.filter(a => ["applied", "interview_scheduled", "interview_done"].includes(a.status)).length,
    completed: applications.filter(a => ["offer_received", "accepted", "rejected", "withdrawn"].includes(a.status)).length,
  }), [applications]);

  // Memoized filtered applications - only recalculate when dependencies change
  const filteredApplications = useMemo(() => {
    let filtered = applications;

    // Filter by tab
    if (activeTab === "in_progress") {
      filtered = filtered.filter(a => ["analyzing", "chatting", "strategies_complete", "documents_ready"].includes(a.status));
    } else if (activeTab === "applied") {
      filtered = filtered.filter(a => ["applied", "interview_scheduled", "interview_done"].includes(a.status));
    } else if (activeTab === "completed") {
      filtered = filtered.filter(a => ["offer_received", "accepted", "rejected", "withdrawn"].includes(a.status));
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.jobTitle?.toLowerCase().includes(query) ||
        app.company?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [applications, activeTab, searchQuery]);

  const getScoreClass = (score: number | null) => {
    if (score === null) return "";
    if (score >= 70) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-red-400";
  };

  // Calculate streak (consecutive days with applications)
  const calculateStreak = () => {
    let streak = 0;
    const dateSet = new Set<string>();

    applications.forEach(app => {
      if (app.appliedAt) {
        const date = new Date(app.appliedAt);
        dateSet.add(date.toDateString());
      }
    });

    const checkDate = new Date();
    while (dateSet.has(checkDate.toDateString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  };

  const streak = calculateStreak();

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 md:pb-8">
        <AppNavbar />
        <main className="container-app py-6">
          {/* Skeleton Hero */}
          <motion.div
            variants={skeletonPulse}
            animate="animate"
            className="h-40 rounded-2xl bg-white/[0.03] border border-white/10 mb-6"
          />

          {/* Skeleton Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                variants={skeletonPulse}
                animate="animate"
                className="h-20 rounded-xl bg-white/[0.03] border border-white/10"
              />
            ))}
          </div>

          {/* Skeleton Tabs */}
          <motion.div
            variants={skeletonPulse}
            animate="animate"
            className="h-12 rounded-xl bg-white/[0.03] border border-white/10 mb-4"
          />

          {/* Skeleton Search */}
          <motion.div
            variants={skeletonPulse}
            animate="animate"
            className="h-11 rounded-xl bg-white/[0.03] border border-white/10 mb-6"
          />

          {/* Skeleton Application Cards */}
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                variants={skeletonPulse}
                animate="animate"
                className="h-24 rounded-xl bg-white/[0.03] border border-white/10"
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <AppNavbar />

      <main className="container-app py-6">
        {/* Hero Section - Daily Goal */}
        <motion.div
          variants={prefersReducedMotion ? undefined : dashboardHero}
          initial="initial"
          animate="animate"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent border border-white/10 p-6 mb-6"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left side - Goal info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">Objectif du jour</h1>
                  <p className="text-sm text-white/50">Creez {DAILY_GOAL} candidatures aujourd'hui</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-white">{todayCreated}</span>
                  <span className="text-sm text-white/50">/ {DAILY_GOAL} candidatures</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dailyProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      dailyProgress >= 100
                        ? "bg-gradient-to-r from-emerald-500 to-green-400"
                        : "bg-gradient-to-r from-indigo-500 to-purple-500"
                    }`}
                  />
                </div>
                {dailyProgress >= 100 && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-emerald-400 flex items-center gap-1"
                  >
                    <Trophy className="w-4 h-4" />
                    Objectif atteint ! Continuez comme ca !
                  </motion.p>
                )}
              </div>
            </div>

            {/* Right side - Stats & Streak */}
            <div className="flex items-center gap-4">
              {/* Streak */}
              {streak > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-500/30">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-lg font-bold text-orange-400">{streak}</p>
                    <p className="text-xs text-orange-400/70">jours</p>
                  </div>
                </div>
              )}

              {/* Quick action */}
              <Link href="/upload">
                <motion.button
                  {...(prefersReducedMotion ? {} : buttonHover)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
                >
                  <motion.span {...(prefersReducedMotion ? {} : iconHover)}>
                    <Plus className="w-5 h-5" />
                  </motion.span>
                  <span className="hidden sm:inline">Nouvelle candidature</span>
                  <span className="sm:hidden">Nouveau</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={prefersReducedMotion ? undefined : staggerContainer(0.08)}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
        >
          <motion.div
            variants={prefersReducedMotion ? undefined : staggerItem}
            {...(prefersReducedMotion ? {} : statsCardHover)}
            className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/30 transition-colors cursor-default"
          >
            <div className="flex items-center gap-3">
              <motion.div
                {...(prefersReducedMotion ? {} : iconHover)}
                className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center"
              >
                <Briefcase className="w-5 h-5 text-indigo-400" />
              </motion.div>
              <div>
                <p className="text-2xl font-bold text-white">
                  <AnimatedCounter value={stats?.totalApplications || 0} />
                </p>
                <p className="text-xs text-white/50">Total</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={prefersReducedMotion ? undefined : staggerItem}
            {...(prefersReducedMotion ? {} : statsCardHover)}
            className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition-colors cursor-default"
          >
            <div className="flex items-center gap-3">
              <motion.div
                {...(prefersReducedMotion ? {} : iconHover)}
                className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center"
              >
                <Clock className="w-5 h-5 text-amber-400" />
              </motion.div>
              <div>
                <p className="text-2xl font-bold text-white">
                  <AnimatedCounter value={stats?.pendingApplications || 0} />
                </p>
                <p className="text-xs text-white/50">En attente</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={prefersReducedMotion ? undefined : staggerItem}
            {...(prefersReducedMotion ? {} : statsCardHover)}
            className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition-colors cursor-default"
          >
            <div className="flex items-center gap-3">
              <motion.div
                {...(prefersReducedMotion ? {} : iconHover)}
                className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center"
              >
                <Users className="w-5 h-5 text-cyan-400" />
              </motion.div>
              <div>
                <p className="text-2xl font-bold text-white">
                  <AnimatedCounter value={stats?.interviewsScheduled || 0} />
                </p>
                <p className="text-xs text-white/50">Entretiens</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={prefersReducedMotion ? undefined : staggerItem}
            {...(prefersReducedMotion ? {} : statsCardHover)}
            className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-colors cursor-default"
          >
            <div className="flex items-center gap-3">
              <motion.div
                {...(prefersReducedMotion ? {} : iconHover)}
                className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center"
              >
                <Trophy className="w-5 h-5 text-emerald-400" />
              </motion.div>
              <div>
                <p className="text-2xl font-bold text-white">
                  <AnimatedCounter value={stats?.offersReceived || 0} />
                </p>
                <p className="text-xs text-white/50">Offres</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Conversion Funnel & Activity Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ConversionFunnel
            stats={{
              total: stats?.totalApplications || 0,
              applied: stats?.statusBreakdown
                ? stats.statusBreakdown.applied +
                  stats.statusBreakdown.interview_scheduled +
                  stats.statusBreakdown.interview_done +
                  stats.statusBreakdown.offer_received +
                  stats.statusBreakdown.accepted +
                  stats.statusBreakdown.rejected
                : 0,
              interviews: stats?.interviewsScheduled || 0,
              offers: stats?.offersReceived || 0,
            }}
            conversionRates={
              stats?.conversionRates || {
                appliedToInterview: 0,
                interviewToOffer: 0,
                overallSuccess: 0,
              }
            }
          />
          <ActivityTimeline activities={activities} />
        </div>

        {/* Follow-up Reminders */}
        <AnimatePresence>
          {reminders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-amber-300">Relances a effectuer</p>
                    <p className="text-sm text-white/50 mt-0.5">
                      {reminders.length} candidature{reminders.length > 1 ? "s" : ""} en attente de relance
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {reminders.slice(0, 3).map((r) => (
                        <Link key={r.id} href={`/application/${r.id}`}>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-xs text-amber-300 hover:bg-amber-500/30 transition-colors">
                            {r.company || r.jobTitle}
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </Link>
                      ))}
                      {reminders.length > 3 && (
                        <span className="text-xs text-amber-400/70">+{reminders.length - 3} autres</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs & Search */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Tabs - optimized with memoized counts */}
          <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl overflow-x-auto">
            {[
              { id: "all" as const, label: "Toutes", count: tabCounts.all },
              { id: "in_progress" as const, label: "En cours", count: tabCounts.in_progress },
              { id: "applied" as const, label: "Postulees", count: tabCounts.applied },
              { id: "completed" as const, label: "Terminees", count: tabCounts.completed },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 min-w-[80px] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-indigo-300 bg-indigo-500/20"
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.02]"
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs transition-colors duration-150 ${
                  activeTab === tab.id ? "bg-indigo-500/30" : "bg-white/10"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par poste ou entreprise..."
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Applications List - optimized with CSS transitions */}
        <div className="space-y-3">
          {filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
                <Briefcase className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchQuery ? "Aucun resultat" : "Aucune candidature"}
              </h3>
              <p className="text-sm text-white/50 max-w-sm mb-6">
                {searchQuery
                  ? "Essayez avec d'autres mots-cles"
                  : "Commencez par creer votre premiere candidature pour atteindre votre objectif quotidien"
                }
              </p>
              {!searchQuery && (
                <Link href="/upload">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-opacity">
                    <Sparkles className="w-5 h-5" />
                    Creer ma premiere candidature
                  </button>
                </Link>
              )}
            </div>
          ) : (
            filteredApplications.map((app) => (
              <Link key={app.id} href={`/application/${app.id}`}>
                <div className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all duration-150 hover:-translate-y-0.5">
                      <div className="flex items-start gap-4">
                        {/* Company icon with score */}
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-indigo-400" />
                          </div>
                          {app.score !== null && (
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-zinc-900 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold ${getScoreClass(app.score)}`}>
                              {app.score}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                                {app.jobTitle || "Poste non defini"}
                              </h3>
                              <p className="text-sm text-white/50 truncate">
                                {app.company || "Entreprise"}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/40 group-hover:translate-x-1 transition-all flex-shrink-0" />
                          </div>

                          {/* Meta row */}
                          <div className="flex items-center flex-wrap gap-2 mt-3">
                            {/* Status */}
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${statusConfig[app.status]?.bgColor} ${statusConfig[app.status]?.color}`}>
                              {statusConfig[app.status]?.icon}
                              {statusConfig[app.status]?.label}
                            </span>

                            {/* Documents */}
                            <div className="flex items-center gap-1">
                              {app.hasCV && (
                                <span className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center" title="CV">
                                  <FileText className="w-3 h-3 text-emerald-400" />
                                </span>
                              )}
                              {app.hasCoverLetter && (
                                <span className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center" title="Lettre">
                                  <FileText className="w-3 h-3 text-blue-400" />
                                </span>
                              )}
                              {app.hasFollowUpEmail && (
                                <span className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center" title="Email">
                                  <Mail className="w-3 h-3 text-purple-400" />
                                </span>
                              )}
                            </div>

                            {/* Date */}
                            <span className="text-xs text-white/30 ml-auto">
                              {app.appliedAt
                                ? `Postule le ${new Date(app.appliedAt).toLocaleDateString("fr-FR")}`
                                : new Date(app.createdAt).toLocaleDateString("fr-FR")
                              }
                            </span>
                          </div>

                          {/* Follow-up alert */}
                          {app.nextFollowUpAt && new Date(app.nextFollowUpAt) <= new Date() && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-amber-400">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Relance recommandee</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1">
                          {app.jobUrl && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(app.jobUrl!, "_blank", "noopener,noreferrer");
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                              title="Voir l'offre"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(e, app.id)}
                            disabled={deletingId === app.id}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Supprimer"
                          >
                            {deletingId === app.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
              </Link>
            ))
          )}
        </div>

        {/* Floating CTA for mobile */}
        <div className="fixed bottom-20 right-4 md:hidden z-40">
          <Link href="/upload">
            <motion.button
              {...(prefersReducedMotion ? {} : buttonHover)}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center"
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </Link>
        </div>
      </main>
    </div>
  );
}
