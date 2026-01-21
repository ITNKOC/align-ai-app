"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  Search,
  MessageSquare,
  FileText,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Target,
  Heart,
  CheckCircle2,
  Star,
  Quote,
  Github,
  Linkedin,
  Mail,
  LogIn,
  LayoutDashboard,
  GraduationCap,
  Rocket,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/actions/auth-actions";

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      setIsLoggedIn(!!session);
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  const features = [
    {
      icon: Heart,
      title: "100% Honnête",
      description:
        "On ne ment jamais pour toi. On met en valeur ce que tu sais vraiment faire - et c'est déjà beaucoup !",
      gradient: "from-rose-500 to-pink-500",
    },
    {
      icon: GraduationCap,
      title: "Parfait pour débuter",
      description:
        "Même sans expérience pro, on trouve les bons mots pour valoriser tes projets, stages et formations.",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      icon: Zap,
      title: "Prêt en 5 min",
      description:
        "Upload ton CV, colle l'offre, et boom - CV + lettre de motivation personnalisés. Simple comme bonjour.",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: Target,
      title: "Sur-mesure",
      description:
        "Chaque candidature est unique. L'IA adapte ton profil aux besoins spécifiques de chaque offre.",
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  const steps = [
    {
      step: 1,
      icon: Upload,
      title: "Upload ton CV",
      description: "L'IA analyse et comprend ton parcours en quelques secondes",
    },
    {
      step: 2,
      icon: Search,
      title: "Colle l'offre d'emploi",
      description: "On identifie ce que l'entreprise recherche vraiment",
    },
    {
      step: 3,
      icon: MessageSquare,
      title: "Chat stratégique",
      description: "On explore ensemble tes compétences cachées et tes atouts",
    },
    {
      step: 4,
      icon: FileText,
      title: "Documents pro",
      description: "CV et lettre de motivation prêts à envoyer, format pro",
    },
  ];

  const stats = [
    { value: "500+", label: "Candidatures générées" },
    { value: "5 min", label: "Temps moyen" },
    { value: "100%", label: "Gratuit" },
    { value: "0", label: "Mensonges" },
  ];

  const testimonials = [
    {
      name: "Léa Moreau",
      role: "Première alternance en dev web",
      content:
        "Je galérais à mettre en valeur mes projets perso et mon stage de 2 mois. Align.ai a reformulé tout ça de façon pro. J'ai décroché 4 entretiens en 2 semaines !",
      rating: 5,
      avatar: "L",
    },
    {
      name: "Yassine Bencheikh",
      role: "Premier CDI en data analyst",
      content:
        "Sans expérience en entreprise, je pensais que c'était mort. Le chat m'a aidé à valoriser mes projets de Master et mes compétences transférables. Résultat : embauché !",
      rating: 5,
      avatar: "Y",
    },
    {
      name: "Chloé Durand",
      role: "Stage de fin d'études décroché",
      content:
        "J'adore le fait que ça ne mente pas. Mon CV est honnête mais percutant. Les recruteurs ont apprécié ma candidature 'authentique'. Merci Koceila !",
      rating: 5,
      avatar: "C",
    },
  ];

  const faqs = [
    {
      question: "C'est vraiment gratuit ?",
      answer:
        "Oui, 100% gratuit et sans limite. Align.ai est un projet passion créé pour aider les juniors à décrocher leur premier job. Pas de freemium, pas de piège.",
    },
    {
      question: "Et si je n'ai pas d'expérience pro ?",
      answer:
        "C'est justement notre spécialité ! On valorise tes projets perso, stages, formations, bénévolat, et même tes soft skills. Tout compte, on trouve les bons mots.",
    },
    {
      question: "L'IA va inventer des trucs ?",
      answer:
        "Jamais. Notre philosophie c'est 'radical honesty'. L'IA reformule et met en valeur ce que tu sais faire, mais elle n'invente rien. Les recruteurs apprécient l'authenticité.",
    },
    {
      question: "Mes données sont sécurisées ?",
      answer:
        "Absolument. Tes CV et données sont stockés de manière sécurisée et chiffrée. On ne vend jamais tes infos et tu peux tout supprimer quand tu veux.",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 md:py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between p-3 md:p-4 rounded-2xl glass border border-white/10 backdrop-blur-xl">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold text-white">Align.ai</span>
            </Link>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2 md:gap-3">
              {!isCheckingAuth && (
                isLoggedIn ? (
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      size="sm"
                      className="glass border-white/20 hover:border-indigo-500/50 text-white hover:bg-white/10 text-xs md:text-sm"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:text-white hover:bg-white/10 text-xs md:text-sm"
                      >
                        <LogIn className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5" />
                        <span className="hidden sm:inline">Connexion</span>
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 text-xs md:text-sm">
                        S&apos;inscrire
                      </Button>
                    </Link>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Friendly & Junior-focused */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 -left-20 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-indigo-500/20 blur-[100px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-20 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-purple-500/20 blur-[100px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[700px] md:h-[700px] rounded-full bg-cyan-500/10 blur-[100px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          {/* Friendly Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6 md:mb-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 glass border border-white/10 backdrop-blur-xl">
              <Rocket className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-white/80">
                Créé pour les juniors, par passion
              </span>
            </div>
          </motion.div>

          {/* Main Title - Emotional & Direct */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
              <span className="text-white">Tu mérites</span>
              <br />
              <span className="gradient-text">ce premier job</span>
            </h1>
          </motion.div>

          {/* Subtitle - Pain point + Solution */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed px-4"
          >
            Pas facile de postuler quand on débute.{" "}
            <span className="text-white font-medium">Align.ai</span> transforme ton CV et génère des lettres de motivation percutantes -{" "}
            <span className="text-indigo-400 font-semibold">sans jamais mentir</span> sur tes compétences.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 mb-12 md:mb-16"
          >
            {/* Primary CTA */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                onClick={() => router.push(isLoggedIn ? "/dashboard" : "/register")}
                className="w-full sm:w-auto btn-futuristic text-base md:text-lg px-8 md:px-10 py-5 md:py-6 shadow-xl shadow-indigo-500/30 font-bold rounded-xl"
              >
                <span className="flex items-center gap-2">
                  {isLoggedIn ? "Créer une candidature" : "Commencer gratuitement"}
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                </span>
              </Button>
            </motion.div>

            {/* Secondary CTA */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="w-full sm:w-auto glass border-white/20 hover:border-indigo-500/50 text-white hover:bg-white/10 px-8 md:px-10 py-5 md:py-6 text-base md:text-lg rounded-xl font-medium"
              >
                Comment ça marche ?
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto px-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="glass rounded-xl p-4 md:p-5 border border-white/10"
              >
                <div className="text-2xl md:text-3xl font-black gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-white/60">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Founder Section - Personal Touch */}
      <section className="px-4 py-12 md:py-20 relative overflow-hidden">
        <div className="mx-auto max-w-4xl relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl md:rounded-3xl p-6 md:p-10 border border-white/10 text-center relative overflow-hidden"
          >
            {/* Background accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-lg opacity-50" />
                <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl md:text-3xl font-bold ring-4 ring-white/10">
                  KD
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h3 className="text-lg md:text-xl font-bold text-white">Koceila Djaballah</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">Créateur</span>
                </div>
                <p className="text-white/70 text-sm md:text-base leading-relaxed">
                  &ldquo;J&apos;ai créé Align.ai parce que je sais à quel point c&apos;est dur de décrocher son premier job.
                  Pas de budget pour un coach, pas de réseau... Cet outil est ma façon de donner un coup de pouce à ceux qui débutent.
                  <span className="text-white font-medium"> 100% gratuit, 100% honnête.</span>&rdquo;
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[100px]" />
          <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-6xl relative">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-300 border border-indigo-500/20 mb-4">
              <Sparkles className="h-4 w-4" />
              Pourquoi Align.ai ?
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              Conçu pour les <span className="gradient-text">débutants</span>
            </h2>
            <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto">
              On comprend tes galères. Voici comment on t&apos;aide.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass rounded-2xl p-5 md:p-6 border border-white/10 group"
              >
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="px-4 py-12 md:py-20 relative overflow-hidden">
        <div className="mx-auto max-w-5xl relative">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300 border border-purple-500/20 mb-4">
              <Zap className="h-4 w-4" />
              Ultra simple
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              Comment ça <span className="gradient-text">marche</span> ?
            </h2>
            <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto">
              4 étapes et tu as ta candidature parfaite
            </p>
          </motion.div>

          {/* Steps */}
          <div className="space-y-4 md:space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-5 md:p-6 border border-white/10 flex items-center gap-4 md:gap-6"
              >
                {/* Step Number & Icon */}
                <div className="relative flex-shrink-0">
                  <div className={`h-14 w-14 md:h-16 md:w-16 rounded-xl bg-gradient-to-br ${
                    index === 0 ? "from-indigo-500 to-purple-500" :
                    index === 1 ? "from-purple-500 to-pink-500" :
                    index === 2 ? "from-pink-500 to-rose-500" :
                    "from-rose-500 to-orange-500"
                  } flex items-center justify-center`}>
                    <step.icon className="h-7 w-7 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white text-xs font-bold flex items-center justify-center text-indigo-600">
                    {step.step}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-white/60">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />
          <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-6xl relative">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 border border-cyan-500/20 mb-4">
              <Users className="h-4 w-4" />
              Ils ont réussi
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              Des juniors comme <span className="gradient-text">toi</span>
            </h2>
            <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto">
              Ils ont décroché leur premier job grâce à Align.ai
            </p>
          </motion.div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-5 md:p-6 border border-white/10 relative"
              >
                {/* Quote Icon */}
                <div className="absolute top-4 right-4">
                  <Quote className="h-8 w-8 text-white/10" />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-white/80 text-sm md:text-base leading-relaxed mb-5">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${
                    index === 0 ? "from-cyan-500 to-indigo-500" :
                    index === 1 ? "from-indigo-500 to-purple-500" :
                    "from-purple-500 to-pink-500"
                  } flex items-center justify-center text-white font-bold text-sm`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-white/50 text-xs">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-12 md:py-20 relative">
        <div className="mx-auto max-w-3xl relative">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-14"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              Questions <span className="gradient-text">fréquentes</span>
            </h2>
          </motion.div>

          {/* FAQ Items */}
          <div className="space-y-3 md:space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-5 md:p-6 border border-white/10"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-white mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-sm md:text-base text-white/60 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl relative"
        >
          <div className="glass rounded-2xl md:rounded-3xl p-8 md:p-12 border border-white/10 text-center relative overflow-hidden">
            {/* Top accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 mb-6"
            >
              <Rocket className="h-8 w-8 text-white" />
            </motion.div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4">
              Prêt à décrocher ton <span className="gradient-text">premier job</span> ?
            </h2>

            <p className="text-white/60 text-base md:text-lg mb-8 max-w-xl mx-auto">
              Rejoins les centaines de juniors qui ont transformé leur recherche d&apos;emploi avec Align.ai.
            </p>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                onClick={() => router.push(isLoggedIn ? "/dashboard" : "/register")}
                className="btn-futuristic text-base md:text-lg px-8 md:px-12 py-5 md:py-6 shadow-xl shadow-indigo-500/30 font-bold rounded-xl"
              >
                <span className="flex items-center gap-2">
                  {isLoggedIn ? "Créer une candidature" : "C'est parti, c'est gratuit !"}
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-8 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-400" />
                <span>Sans engagement</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-white/30" />
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-400" />
                <span>100% gratuit</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-white/30" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Données sécurisées</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Brand */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Align.ai</span>
              </div>
              <p className="text-sm text-white/50 mb-2">
                L&apos;IA éthique pour décrocher ton premier job
              </p>
              <p className="text-xs text-white/40">
                Créé avec ❤️ par <span className="text-indigo-400">Koceila Djaballah</span>
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {[
                { Icon: Linkedin, href: "#" },
                { Icon: Github, href: "#" },
                { Icon: Mail, href: "mailto:contact@align-ai.fr" },
              ].map(({ Icon, href }, index) => (
                <motion.a
                  key={index}
                  href={href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="h-10 w-10 rounded-xl glass border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
            <p>© 2024 Align.ai. Tous droits réservés.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
