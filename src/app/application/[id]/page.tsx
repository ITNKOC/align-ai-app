"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  Mail,
  ExternalLink,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit3,
  Send,
  Loader2,
  Copy,
  Link2,
  MessageSquare,
} from "lucide-react";
import { getSession } from "@/actions/auth-actions";
import {
  getApplicationDetail,
  updateApplicationStatus,
  markAsApplied,
  recordFollowUp,
  type ApplicationDetail,
  type ApplicationStatus,
} from "@/actions/dashboard-actions";

// Status steps for timeline
const statusSteps: {
  key: ApplicationStatus;
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: "documents_ready", label: "Documents", icon: <FileText className="h-4 w-4" /> },
  { key: "applied", label: "Postulé", icon: <Send className="h-4 w-4" /> },
  { key: "interview_scheduled", label: "Entretien", icon: <Calendar className="h-4 w-4" /> },
  { key: "offer_received", label: "Offre", icon: <CheckCircle2 className="h-4 w-4" /> },
];

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyData, setApplyData] = useState({ via: "email", jobUrl: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"cv" | "cover" | "email">("cv");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>("applied");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadApplication();
  }, [resolvedParams.id]);

  const loadApplication = async () => {
    try {
      const session = await getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const result = await getApplicationDetail(resolvedParams.id);
      if (result.success && result.application) {
        setApplication(result.application);
        setNotes(result.application.applicationNotes || "");
      } else {
        toast.error(result.error || "Candidature non trouvée");
        router.push("/dashboard");
      }
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsApplied = async () => {
    if (!application) return;
    setIsSaving(true);

    const result = await markAsApplied(
      application.id,
      applyData.via,
      applyData.jobUrl || undefined
    );

    if (result.success) {
      toast.success("Candidature marquée comme envoyée !");
      setShowApplyModal(false);
      loadApplication();
    } else {
      toast.error(result.error);
    }
    setIsSaving(false);
  };

  const handleUpdateStatus = async () => {
    if (!application) return;
    setIsSaving(true);

    const result = await updateApplicationStatus(application.id, {
      status: newStatus,
      applicationNotes: notes,
    });

    if (result.success) {
      toast.success("Statut mis à jour !");
      setShowStatusModal(false);
      loadApplication();
    } else {
      toast.error(result.error);
    }
    setIsSaving(false);
  };

  const handleRecordFollowUp = async () => {
    if (!application) return;
    setIsSaving(true);

    const result = await recordFollowUp(application.id, 7);

    if (result.success) {
      toast.success("Relance enregistrée !");
      loadApplication();
    } else {
      toast.error(result.error);
    }
    setIsSaving(false);
  };

  const downloadPdf = (base64: string, filename: string) => {
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${base64}`;
    link.download = filename;
    link.click();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papier !");
  };

  const getStatusIndex = (status: ApplicationStatus) => {
    const idx = statusSteps.findIndex((s) => s.key === status);
    if (status === "accepted" || status === "rejected") return statusSteps.length;
    return idx;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const currentStatusIndex = getStatusIndex(application.status);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <ArrowLeft className="h-5 w-5 text-white/60" />
              </button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-white truncate">
                {application.jobTitle || "Poste non défini"}
              </h1>
              <p className="text-sm text-white/60 truncate">
                {application.company || "Entreprise non définie"}
              </p>
            </div>
            {application.jobUrl && (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <ExternalLink className="h-5 w-5 text-white/60" />
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Progression</h2>
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/30 transition-colors flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Modifier le statut
            </button>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const isCompleted = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                return (
                  <div
                    key={step.key}
                    className="flex flex-col items-center relative z-10"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? "bg-green-500"
                          : isCurrent
                          ? "bg-indigo-500"
                          : "bg-white/10"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isCompleted || isCurrent ? "text-white" : "text-white/40"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Progress bar */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10 -z-0">
              <div
                className="h-full bg-green-500 transition-all"
                style={{
                  width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-3">
            {application.status === "documents_ready" && (
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-colors flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Marquer comme postulé
              </button>
            )}
            {application.status === "applied" && (
              <button
                onClick={handleRecordFollowUp}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-colors flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Enregistrer une relance
              </button>
            )}
            {!application.cvPdfBase64 && (
              <Link href="/generate">
                <button className="px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/30 transition-colors flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Générer les documents
                </button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Score & Gap Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Analyse</h2>
            {application.score !== null && (
              <div
                className={`text-2xl font-bold ${
                  application.score >= 70
                    ? "text-green-400"
                    : application.score >= 50
                    ? "text-amber-400"
                    : "text-red-400"
                }`}
              >
                {application.score}%
              </div>
            )}
          </div>

          {application.gaps.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-white/60 mb-3">Gaps identifiés :</p>
              <div className="flex flex-wrap gap-2">
                {application.gaps.map((gap, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      gap.severity === "critical"
                        ? "bg-red-500/20 text-red-400"
                        : gap.severity === "moderate"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-zinc-500/20 text-zinc-400"
                    }`}
                  >
                    {gap.skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Documents */}
        {(application.cvPdfBase64 ||
          application.coverPdfBase64 ||
          application.followUpEmail) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 rounded-xl bg-white/5 border border-white/10 overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {application.cvPdfBase64 && (
                <button
                  onClick={() => setActiveTab("cv")}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "cv"
                      ? "text-white border-b-2 border-indigo-500"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  CV
                </button>
              )}
              {application.coverPdfBase64 && (
                <button
                  onClick={() => setActiveTab("cover")}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "cover"
                      ? "text-white border-b-2 border-indigo-500"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Lettre de motivation
                </button>
              )}
              {application.followUpEmail && (
                <button
                  onClick={() => setActiveTab("email")}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "email"
                      ? "text-white border-b-2 border-indigo-500"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Email de relance
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === "cv" && application.cvPdfBase64 && (
                <div className="space-y-4">
                  <div className="aspect-[8.5/11] bg-white rounded-lg overflow-hidden">
                    <iframe
                      src={`data:application/pdf;base64,${application.cvPdfBase64}`}
                      className="w-full h-full"
                    />
                  </div>
                  <button
                    onClick={() =>
                      downloadPdf(
                        application.cvPdfBase64!,
                        `CV_${application.company || "candidature"}.pdf`
                      )
                    }
                    className="w-full py-3 rounded-lg bg-indigo-500/20 text-indigo-400 font-medium flex items-center justify-center gap-2 hover:bg-indigo-500/30 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger le CV
                  </button>
                </div>
              )}

              {activeTab === "cover" && application.coverPdfBase64 && (
                <div className="space-y-4">
                  <div className="aspect-[8.5/11] bg-white rounded-lg overflow-hidden">
                    <iframe
                      src={`data:application/pdf;base64,${application.coverPdfBase64}`}
                      className="w-full h-full"
                    />
                  </div>
                  <button
                    onClick={() =>
                      downloadPdf(
                        application.coverPdfBase64!,
                        `Lettre_${application.company || "candidature"}.pdf`
                      )
                    }
                    className="w-full py-3 rounded-lg bg-indigo-500/20 text-indigo-400 font-medium flex items-center justify-center gap-2 hover:bg-indigo-500/30 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger la lettre
                  </button>
                </div>
              )}

              {activeTab === "email" && application.followUpEmail && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-white/60 mb-1">Objet :</p>
                    <p className="text-white font-medium mb-4">
                      {application.followUpEmail.subject}
                    </p>
                    <p className="text-sm text-white/60 mb-1">Corps :</p>
                    <p className="text-white whitespace-pre-wrap">
                      {application.followUpEmail.body}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `Objet: ${application.followUpEmail!.subject}\n\n${application.followUpEmail!.body}`
                      )
                    }
                    className="w-full py-3 rounded-lg bg-indigo-500/20 text-indigo-400 font-medium flex items-center justify-center gap-2 hover:bg-indigo-500/30 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    Copier l&apos;email
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-white/5 border border-white/10"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajoutez des notes sur cette candidature..."
            className="w-full h-32 p-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={async () => {
              setIsSaving(true);
              await updateApplicationStatus(application.id, {
                applicationNotes: notes,
              });
              toast.success("Notes sauvegardées !");
              setIsSaving(false);
            }}
            disabled={isSaving}
            className="mt-4 px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/30 transition-colors"
          >
            {isSaving ? "Sauvegarde..." : "Sauvegarder les notes"}
          </button>
        </motion.div>
      </main>

      {/* Mark as Applied Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowApplyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-2xl bg-zinc-900 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Marquer comme postulé
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/80 mb-2 block">
                    Canal de candidature
                  </label>
                  <select
                    value={applyData.via}
                    onChange={(e) =>
                      setApplyData({ ...applyData, via: e.target.value })
                    }
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white"
                  >
                    <option value="email">Email</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="company_website">Site de l&apos;entreprise</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-white/80 mb-2 block">
                    Lien de l&apos;offre (optionnel)
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                    <input
                      type="url"
                      value={applyData.jobUrl}
                      onChange={(e) =>
                        setApplyData({ ...applyData, jobUrl: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleMarkAsApplied}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Confirmer
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Status Modal */}
      <AnimatePresence>
        {showStatusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowStatusModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-2xl bg-zinc-900 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Modifier le statut
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/80 mb-2 block">
                    Nouveau statut
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) =>
                      setNewStatus(e.target.value as ApplicationStatus)
                    }
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white"
                  >
                    <option value="documents_ready">Documents prêts</option>
                    <option value="applied">Postulé</option>
                    <option value="interview_scheduled">Entretien programmé</option>
                    <option value="interview_done">Entretien passé</option>
                    <option value="offer_received">Offre reçue</option>
                    <option value="accepted">Accepté</option>
                    <option value="rejected">Refusé</option>
                    <option value="withdrawn">Retiré</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Mettre à jour"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
