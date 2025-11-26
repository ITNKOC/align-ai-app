"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
  Brain,
  CheckCircle2,
  Star,
  Quote,
  Github,
  Twitter,
  Linkedin,
  Mail,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: Shield,
      title: "100% Éthique",
      description:
        "Notre IA ne ment jamais. Elle reformule et met en valeur vos vraies compétences sans inventer de faits.",
      gradient: "from-indigo-500 via-purple-500 to-indigo-600",
    },
    {
      icon: Brain,
      title: "IA Avancée",
      description:
        "Propulsé par Gemini 2.0 Flash pour une analyse précise et des documents professionnels optimisés.",
      gradient: "from-purple-500 via-indigo-500 to-purple-600",
    },
    {
      icon: Zap,
      title: "Ultra Rapide",
      description:
        "Générez un CV et une lettre optimisés en moins de 5 minutes. Gagnez des heures de travail.",
      gradient: "from-indigo-600 via-purple-600 to-indigo-500",
    },
    {
      icon: Target,
      title: "Sur Mesure",
      description:
        "Chaque document est adapté spécifiquement à l'offre d'emploi cible pour maximiser vos chances.",
      gradient: "from-purple-600 via-indigo-600 to-purple-500",
    },
  ];

  const steps = [
    {
      step: 1,
      icon: Upload,
      title: "Uploadez votre CV",
      description: "Notre IA analyse et structure automatiquement vos compétences et expériences",
    },
    {
      step: 2,
      icon: Search,
      title: "Collez l'offre d'emploi",
      description: "Analyse instantanée des gaps et calcul du score de compatibilité",
    },
    {
      step: 3,
      icon: MessageSquare,
      title: "Chat stratégique",
      description: "Discussion interactive pour explorer vos compétences et combler les gaps",
    },
    {
      step: 4,
      icon: FileText,
      title: "Documents optimisés",
      description: "CV et lettre de motivation personnalisés en LaTeX professionnel",
    },
  ];

  const stats = [
    { value: "98%", label: "Taux de satisfaction" },
    { value: "5 min", label: "Temps moyen" },
    { value: "100%", label: "Éthique garantie" },
    { value: "∞", label: "Candidatures" },
  ];

  const testimonials = [
    {
      name: "Sophie Martinez",
      role: "Développeuse Full-Stack",
      content:
        "J'ai obtenu 3 entretiens en 2 semaines grâce à Align.ai. Le chat stratégique m'a aidé à reformuler mes compétences de manière percutante.",
      rating: 5,
    },
    {
      name: "Thomas Dubois",
      role: "Data Scientist",
      content:
        "Enfin un outil qui ne me fait pas mentir sur mes compétences ! Le CV généré était parfaitement adapté à l'offre tout en restant honnête.",
      rating: 5,
    },
    {
      name: "Marie Lambert",
      role: "Chef de Projet",
      content:
        "La qualité des documents LaTeX est impressionnante. J'ai été complimentée sur la présentation de ma candidature lors de mon entretien.",
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: "Est-ce que l'IA invente des compétences ?",
      answer:
        "Absolument pas. Notre philosophie est la 'radical honesty'. L'IA reformule et met en valeur vos vraies compétences, mais ne ment jamais sur ce que vous savez faire.",
    },
    {
      question: "Combien coûte le service ?",
      answer:
        "L'utilisation de base est gratuite. Vous pouvez générer autant de candidatures que vous le souhaitez sans limite.",
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer:
        "Oui. Vos CV et données personnelles sont stockés de manière sécurisée dans une base PostgreSQL chiffrée. Nous ne partageons jamais vos informations.",
    },
    {
      question: "Quels formats de CV sont acceptés ?",
      answer:
        "Actuellement, nous acceptons uniquement les PDF. Le texte est extrait automatiquement et analysé par notre IA.",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section - PREMIUM PERFECTION */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20 md:py-24 overflow-hidden">
        {/* Epic Static Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Static gradient orbs with entrance animation */}
          <motion.div
            className="absolute top-1/4 -left-32 w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full bg-indigo-500/20 blur-[120px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full bg-purple-500/20 blur-[120px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[900px] md:h-[900px] rounded-full bg-cyan-500/15 blur-[120px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
          />

          {/* Subtle static particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-indigo-400/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + Math.random() * 0.5, duration: 0.6 }}
            />
          ))}
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-20" />

        <div className="relative z-10 mx-auto max-w-7xl text-center">
          {/* Premium Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="inline-block mb-8 md:mb-12"
          >
            <div className="relative inline-flex items-center gap-3 rounded-full px-6 py-3 glass border border-white/10 backdrop-blur-xl group hover:border-indigo-500/30 transition-all">
              {/* Static gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 rounded-full" />

              {/* Icon with glow */}
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-50" />
                <Sparkles className="relative h-5 w-5 text-indigo-400" />
              </div>

              <span className="relative text-sm md:text-base font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Propulsé par Gemini 2.0 Flash
              </span>

              {/* Status dot */}
              <div className="relative h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
            </div>
          </motion.div>

          {/* Massive Title - Ultra Premium */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="mb-8 md:mb-12"
          >
            <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] font-black tracking-tight leading-[1.1]">
              <motion.span
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="block text-white mb-3 md:mb-6"
              >
                La candidature
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                className="relative inline-block"
              >
                <span className="gradient-text relative">
                  chirurgicale
                  {/* Massive animated underline */}
                  <motion.div
                    className="absolute -bottom-3 md:-bottom-6 left-0 right-0 h-1.5 md:h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.9, duration: 1, ease: "easeOut" }}
                  />
                  {/* Static glow */}
                  <div className="absolute inset-0 blur-3xl opacity-40 gradient-text">
                    chirurgicale
                  </div>
                </span>
              </motion.span>
            </h1>
          </motion.div>

          {/* Enhanced Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mx-auto max-w-4xl px-4 mb-12 md:mb-16"
          >
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/80 leading-relaxed">
              Optimisez votre CV et lettre de motivation pour{" "}
              <span className="text-white font-bold">chaque offre d&apos;emploi</span>.
              <br className="hidden md:block" />
              Notre IA analyse, conseille et génère des documents sur mesure -{" "}
              <span className="relative inline-block group/highlight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-black">
                  sans jamais mentir
                </span>
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                />
              </span>{" "}
              sur vos compétences.
            </p>
          </motion.div>

          {/* Premium CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 mb-20 md:mb-28"
          >
            {/* Primary Button - Ultra Premium */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto relative group"
            >
              {/* Static button glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-[22px] opacity-50 group-hover:opacity-75 blur-2xl transition-all duration-500" />

              <Button
                size="lg"
                onClick={() => router.push("/upload")}
                className="relative w-full btn-futuristic text-base sm:text-lg md:text-xl lg:text-2xl px-8 sm:px-12 md:px-16 py-6 sm:py-7 md:py-9 shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-500/80 font-black rounded-[20px] overflow-hidden transition-all"
              >
                <span className="relative flex items-center justify-center gap-3 md:gap-4">
                  <Sparkles className="h-5 w-5 md:h-6 md:w-6" />
                  <span>Commencer gratuitement</span>
                  <ArrowRight className="h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </motion.div>

            {/* Secondary Button - Premium Glass */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full glass border-white/20 hover:border-indigo-500/50 text-white hover:bg-white/10 px-8 sm:px-12 md:px-16 py-6 sm:py-7 md:py-9 text-base sm:text-lg md:text-xl backdrop-blur-xl transition-all rounded-[20px] font-bold"
              >
                <span className="flex items-center gap-3">
                  <Target className="h-5 w-5 md:h-6 md:w-6" />
                  Comment ça marche ?
                </span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Premium Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto px-4"
          >
            {stats.map((stat, index) => {
              const gradients = [
                "from-cyan-500 to-indigo-500",
                "from-indigo-500 to-purple-500",
                "from-purple-500 to-violet-500",
                "from-violet-500 to-cyan-500",
              ];
              const gradient = gradients[index % gradients.length];

              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: 1.2 + index * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  whileHover={{
                    y: -10,
                    scale: 1.05,
                    transition: { duration: 0.3 },
                  }}
                  className="relative group"
                >
                  {/* Static hover glow */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-[24px] opacity-0 group-hover:opacity-40 blur-xl transition-all duration-500`} />

                  {/* Card */}
                  <div className="relative glass rounded-[24px] p-6 md:p-8 border border-white/10 group-hover:border-white/20 backdrop-blur-xl transition-all overflow-hidden">
                    {/* Top gradient accent */}
                    <motion.div
                      className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradient}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 1.3 + index * 0.1, duration: 0.6 }}
                    />

                    {/* Static gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                    <div className="relative">
                      {/* Massive value */}
                      <motion.div
                        className={`text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent mb-3`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.3 + index * 0.1, type: "spring" }}
                      >
                        {stat.value}
                      </motion.div>

                      {/* Label */}
                      <div className="text-sm md:text-base text-white/60 group-hover:text-white/80 transition-colors font-semibold">
                        {stat.label}
                      </div>

                      {/* Bottom shine */}
                      <motion.div
                        className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 1.4 + index * 0.1, duration: 0.6 }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section - PREMIUM EDITION */}
      <section id="features" className="px-4 py-20 md:py-32 relative overflow-hidden">
        {/* Subtle Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
          <div className="absolute bottom-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl relative">
          {/* Premium Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20 md:mb-28"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-block mb-8"
            >
              <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 px-6 py-3 text-sm font-bold text-white border-2 border-white/20 backdrop-blur-xl shadow-2xl">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Pourquoi nous choisir ?
              </span>
            </motion.div>

            {/* Title with stunning animation */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-none"
            >
              Une expérience{" "}
              <span className="relative inline-block">
                <span className="gradient-text">unique</span>
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                />
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-base sm:text-lg md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed font-medium"
            >
              Découvrez les avantages qui font d&apos;<span className="text-purple-400 font-bold">Align.ai</span> l&apos;outil préféré des professionnels
            </motion.p>
          </motion.div>

          {/* Premium Grid */}
          <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className="group relative"
              >
                {/* Card */}
                <motion.div
                  whileHover={{ y: -10, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="relative h-full glass rounded-[28px] p-6 md:p-8 border border-white/10 group-hover:border-white/20 transition-all duration-500 overflow-hidden backdrop-blur-xl"
                >
                  {/* Gradient background on hover */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 0%,
                        ${index === 0 ? "rgba(99, 102, 241, 0.1)" : index === 1 ? "rgba(168, 85, 247, 0.1)" : index === 2 ? "rgba(6, 182, 212, 0.1)" : "rgba(139, 92, 246, 0.1)"} 0%,
                        transparent 70%)`
                    }}
                  />

                  {/* Top gradient accent */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[28px]"
                    style={{
                      background: `linear-gradient(90deg,
                        transparent 0%,
                        ${index === 0 ? "#6366f1" : index === 1 ? "#a855f7" : index === 2 ? "#06b6d4" : "#8b5cf6"} 50%,
                        transparent 100%)`
                    }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                  />

                  <div className="relative">
                    {/* Icon with subtle glow */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                      className="mb-6"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3, type: "spring" }}
                        className="relative inline-block"
                      >
                        {/* Subtle glow */}
                        <div
                          className="absolute -inset-2 rounded-2xl blur-xl opacity-50"
                          style={{
                            background: `linear-gradient(135deg,
                              ${index === 0 ? "#6366f1" : index === 1 ? "#a855f7" : index === 2 ? "#06b6d4" : "#8b5cf6"},
                              ${index === 0 ? "#8b5cf6" : index === 1 ? "#06b6d4" : index === 2 ? "#6366f1" : "#a855f7"})`
                          }}
                        />

                        {/* Icon container */}
                        <div
                          className={`relative inline-flex rounded-2xl ${feature.gradient} p-4 shadow-xl ring-2 ring-white/10`}
                        >
                          <feature.icon className="h-7 w-7 md:h-8 md:w-8 text-white drop-shadow-lg" />
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Title */}
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="text-xl md:text-2xl font-black text-white mb-3 leading-tight tracking-tight"
                    >
                      {feature.title}
                    </motion.h3>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="text-sm text-white/70 group-hover:text-white/90 leading-relaxed transition-colors"
                    >
                      {feature.description}
                    </motion.p>
                  </div>

                  {/* Bottom shine */}
                  <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] rounded-full"
                    style={{
                      width: "70%",
                      background: `linear-gradient(90deg,
                        transparent 0%,
                        ${index === 0 ? "#6366f1" : index === 1 ? "#a855f7" : index === 2 ? "#06b6d4" : "#8b5cf6"} 50%,
                        transparent 100%)`,
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 0.6 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.4, duration: 0.8 }}
                  />

                  {/* Corner glow on hover */}
                  <div
                    className="absolute top-4 right-4 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: index === 0 ? "#6366f1" : index === 1 ? "#a855f7" : index === 2 ? "#06b6d4" : "#8b5cf6",
                    }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section - PREMIUM EDITION */}
      <section id="how-it-works" className="px-4 py-20 md:py-32 relative overflow-hidden">
        {/* Subtle Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-cyan-500/3 blur-[150px]" />
        </div>

        <div className="mx-auto max-w-7xl relative">
          {/* Premium Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20 md:mb-28"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-block mb-8"
            >
              <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 px-6 py-3 text-sm font-bold text-white border-2 border-white/20 backdrop-blur-xl shadow-2xl">
                <Zap className="h-5 w-5 text-cyan-400" />
                Processus Ultra-Simplifié
              </span>
            </motion.div>

            {/* Title with stunning animation */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-none"
            >
              Comment ça{" "}
              <span className="relative inline-block">
                <span className="gradient-text">marche</span>
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                />
              </span>
              <span className="text-6xl md:text-8xl">?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-base sm:text-lg md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed font-medium"
            >
              Un parcours <span className="text-indigo-400 font-bold">fluide en 4 étapes</span> pour transformer votre candidature
            </motion.p>
          </motion.div>

          {/* MOBILE: Ultra-Premium Vertical Layout */}
          <div className="lg:hidden space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 120,
                  damping: 15
                }}
                className="relative"
              >
                {/* Enhanced Connecting Line with Dot */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[30px] top-[90px] bottom-[-24px] w-[2px] overflow-hidden z-0">
                    {/* Gradient line */}
                    <motion.div
                      className="w-full h-full relative"
                      style={{
                        background: `linear-gradient(180deg,
                          ${index === 0 ? "#6366f1" : index === 1 ? "#a855f7" : "#06b6d4"} 0%,
                          ${index === 0 ? "#a855f7" : index === 1 ? "#06b6d4" : "#8b5cf6"} 50%,
                          transparent 100%)`
                      }}
                      initial={{ scaleY: 0, opacity: 0 }}
                      whileInView={{ scaleY: 1, opacity: 0.5 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
                      style={{ originY: 0 }}
                    >
                      {/* Animated dot traveling down */}
                      <motion.div
                        className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-lg"
                        animate={{
                          y: ["0%", "100%"],
                          opacity: [1, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.5,
                        }}
                      />
                    </motion.div>
                  </div>
                )}

                <motion.div
                  whileTap={{ scale: 0.97 }}
                  className="relative z-10"
                >
                  {/* Massive Background Number with Gradient */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="absolute -left-2 -top-3 text-[120px] sm:text-[140px] font-black leading-none select-none pointer-events-none z-0"
                    style={{
                      background: `linear-gradient(135deg,
                        ${index === 0 ? "rgba(99, 102, 241, 0.04)" : index === 1 ? "rgba(168, 85, 247, 0.04)" : index === 2 ? "rgba(6, 182, 212, 0.04)" : "rgba(139, 92, 246, 0.04)"} 0%,
                        ${index === 0 ? "rgba(168, 85, 247, 0.02)" : index === 1 ? "rgba(6, 182, 212, 0.02)" : index === 2 ? "rgba(139, 92, 246, 0.02)" : "rgba(99, 102, 241, 0.02)"} 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {step.step}
                  </motion.div>

                  {/* Premium Card with Enhanced Design */}
                  <div className="relative glass rounded-[28px] p-5 sm:p-6 border border-white/10 overflow-hidden group backdrop-blur-xl">
                    {/* Animated gradient background */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle at 30% 50%,
                          ${index === 0 ? "rgba(99, 102, 241, 0.1)" : index === 1 ? "rgba(168, 85, 247, 0.1)" : index === 2 ? "rgba(6, 182, 212, 0.1)" : "rgba(139, 92, 246, 0.1)"} 0%,
                          transparent 70%)`
                      }}
                    />

                    {/* Top gradient accent */}
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[28px]"
                      style={{
                        background: `linear-gradient(90deg,
                          transparent 0%,
                          ${index === 0 ? "#6366f1" : index === 1 ? "#a855f7" : index === 2 ? "#06b6d4" : "#8b5cf6"} 50%,
                          transparent 100%)`
                      }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.4, duration: 0.6 }}
                    />

                    <div className="relative flex gap-4 sm:gap-5">
                      {/* Enhanced Icon with Better Positioning */}
                      <div className="relative flex-shrink-0 pt-1">
                        <motion.div
                          whileTap={{ scale: 0.85, rotate: 10 }}
                          className="relative"
                        >
                          {/* Subtle glow */}
                          <div
                            className="absolute -inset-2 rounded-2xl blur-xl opacity-50"
                            style={{
                              background: `linear-gradient(135deg,
                                ${index === 0 ? "#6366f1" : index === 1 ? "#a855f7" : index === 2 ? "#06b6d4" : "#8b5cf6"},
                                ${index === 0 ? "#8b5cf6" : index === 1 ? "#06b6d4" : index === 2 ? "#6366f1" : "#a855f7"})`
                            }}
                          />

                          {/* Icon container with ring */}
                          <div
                            className="relative flex h-16 w-16 sm:h-[72px] sm:w-[72px] items-center justify-center rounded-2xl shadow-2xl ring-2 ring-white/20"
                            style={{
                              background: `linear-gradient(135deg,
                                ${index === 0 ? "#6366f1" : index === 1 ? "#a855f7" : index === 2 ? "#06b6d4" : "#8b5cf6"} 0%,
                                ${index === 0 ? "#8b5cf6" : index === 1 ? "#06b6d4" : index === 2 ? "#6366f1" : "#a855f7"} 100%)`,
                            }}
                          >
                            <step.icon className="h-8 w-8 sm:h-9 sm:w-9 text-white drop-shadow-2xl" />
                          </div>

                          {/* Step number badge */}
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{
                              delay: index * 0.1 + 0.4,
                              type: "spring",
                              stiffness: 200
                            }}
                            className="absolute -top-2 -right-2 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white text-sm sm:text-base font-black shadow-xl ring-4 ring-black/5"
                            style={{
                              color: index === 0 ? "#6366f1" : index === 1 ? "#a855f7" : index === 2 ? "#06b6d4" : "#8b5cf6",
                            }}
                          >
                            {step.step}
                          </motion.div>
                        </motion.div>
                      </div>

                      {/* Enhanced Content */}
                      <div className="flex-1 min-w-0 pt-1">
                        <motion.h3
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          className="text-lg sm:text-xl font-black text-white mb-2.5 leading-tight tracking-tight"
                        >
                          {step.title}
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + 0.4 }}
                          className="text-[13px] sm:text-sm text-white/70 leading-relaxed"
                        >
                          {step.description}
                        </motion.p>
                      </div>
                    </div>

                    {/* Enhanced bottom shine */}
                    <motion.div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] rounded-full"
                      style={{
                        width: "70%",
                        background: `linear-gradient(90deg,
                          transparent 0%,
                          ${index === 0 ? "#6366f1" : index === 1 ? "#a855f7" : index === 2 ? "#06b6d4" : "#8b5cf6"} 50%,
                          transparent 100%)`,
                      }}
                      initial={{ scaleX: 0, opacity: 0 }}
                      whileInView={{ scaleX: 1, opacity: 0.6 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                    />

                    {/* Corner glow on active */}
                    <div
                      className="absolute top-3 right-3 w-20 h-20 rounded-full blur-2xl opacity-0 group-active:opacity-30 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: index === 0 ? "#6366f1" : index === 1 ? "#a855f7" : index === 2 ? "#06b6d4" : "#8b5cf6",
                      }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* DESKTOP: Epic Horizontal Layout with Alternating Heights */}
          <div className="hidden lg:block relative">
            {/* Animated Connection Path */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ height: "600px" }}>
              <motion.path
                d="M 120 200 Q 300 200 450 280 T 1050 280"
                stroke="url(#gradient)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.4 }}
                viewport={{ once: true }}
                transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>

            {/* Steps Grid with Alternating Layout */}
            <div className="grid grid-cols-4 gap-6 xl:gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 100, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    delay: index * 0.15,
                    type: "spring",
                    stiffness: 80,
                    damping: 15
                  }}
                  className="relative"
                  style={{
                    marginTop: index % 2 === 0 ? "0" : "80px"
                  }}
                >
                  {/* Massive Background Number */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.2 }}
                    className="absolute -top-8 -left-6 text-[200px] font-black leading-none select-none pointer-events-none"
                    style={{
                      background: "linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {step.step}
                  </motion.div>

                  {/* Premium Card with 3D Transform */}
                  <motion.div
                    whileHover={{
                      y: -15,
                      scale: 1.03,
                      rotateX: 5,
                      rotateY: index % 2 === 0 ? 5 : -5,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="relative group cursor-pointer"
                    style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
                  >
                    {/* Animated Glow Halo */}
                    <motion.div
                      className="absolute -inset-4 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${
                          index === 0 ? "rgba(99, 102, 241, 0.3)" :
                          index === 1 ? "rgba(168, 85, 247, 0.3)" :
                          index === 2 ? "rgba(6, 182, 212, 0.3)" :
                          "rgba(139, 92, 246, 0.3)"
                        } 0%, transparent 70%)`,
                      }}
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />

                    {/* Main Glass Card */}
                    <div className="relative glass rounded-3xl p-8 border-2 border-white/10 group-hover:border-white/30 transition-all duration-500 overflow-hidden backdrop-blur-2xl">
                      {/* Animated Top Border */}
                      <motion.div
                        className="absolute top-0 inset-x-0 h-1 rounded-t-3xl"
                        style={{
                          background: `linear-gradient(90deg,
                            transparent 0%,
                            ${index === 0 ? "#6366f1" : index === 1 ? "#a855f7" : index === 2 ? "#06b6d4" : "#8b5cf6"} 50%,
                            transparent 100%)`,
                        }}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15 + 0.5, duration: 0.8 }}
                      />

                      {/* Icon - Smaller and inside card */}
                      <div className="flex justify-center mb-6">
                        <motion.div
                          animate={{
                            y: [0, -5, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.2,
                          }}
                          className="relative"
                        >
                          {/* Icon glow */}
                          <div
                            className="absolute inset-0 rounded-2xl blur-xl opacity-50"
                            style={{
                              background: `linear-gradient(135deg,
                                ${index === 0 ? "#6366f1" : index === 1 ? "#a855f7" : index === 2 ? "#06b6d4" : "#8b5cf6"},
                                ${index === 0 ? "#8b5cf6" : index === 1 ? "#06b6d4" : index === 2 ? "#6366f1" : "#a855f7"})`,
                            }}
                          />

                          {/* Icon container */}
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.3, type: "spring" }}
                            className="relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-xl ring-2 ring-white/10"
                            style={{
                              background: `linear-gradient(135deg,
                                ${index === 0 ? "#6366f1" : index === 1 ? "#a855f7" : index === 2 ? "#06b6d4" : "#8b5cf6"},
                                ${index === 0 ? "#8b5cf6" : index === 1 ? "#06b6d4" : index === 2 ? "#6366f1" : "#a855f7"})`,
                            }}
                          >
                            <step.icon className="h-8 w-8 text-white drop-shadow-lg" />
                          </motion.div>

                          {/* Number Badge */}
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 + 0.4, type: "spring", stiffness: 200 }}
                            className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-black shadow-xl ring-2 ring-black/5"
                            style={{
                              color: index === 0 ? "#6366f1" : index === 1 ? "#a855f7" : index === 2 ? "#06b6d4" : "#8b5cf6",
                            }}
                          >
                            {step.step}
                          </motion.div>
                        </motion.div>
                      </div>

                      <div className="text-center">
                        <motion.h3
                          className="text-lg xl:text-xl font-black text-white mb-3 leading-tight group-hover:scale-105 transition-transform"
                          style={{
                            textShadow: "0 0 30px rgba(99, 102, 241, 0.3)",
                          }}
                        >
                          {step.title}
                        </motion.h3>
                        <p className="text-sm text-white/70 group-hover:text-white/90 leading-relaxed transition-colors">
                          {step.description}
                        </p>
                      </div>

                      {/* Bottom Gradient Line */}
                      <motion.div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          width: "60%",
                          background: `linear-gradient(90deg, transparent, ${
                            index === 0 ? "#6366f1" : index === 1 ? "#a855f7" : index === 2 ? "#06b6d4" : "#8b5cf6"
                          }, transparent)`,
                        }}
                      />

                      {/* Corner Accent */}
                      <div className="absolute top-4 right-4 w-16 h-16 opacity-0 group-hover:opacity-10 transition-opacity">
                        <div
                          className="w-full h-full rounded-full blur-xl"
                          style={{
                            background: index === 0 ? "#6366f1" : index === 1 ? "#a855f7" : index === 2 ? "#06b6d4" : "#8b5cf6",
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - PREMIUM EDITION */}
      <section className="px-4 py-20 md:py-32 relative overflow-hidden">
        {/* Subtle Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl relative">
          {/* Premium Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20 md:mb-28"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-block mb-8"
            >
              <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 px-6 py-3 text-sm font-bold text-white border-2 border-white/20 backdrop-blur-xl shadow-2xl">
                <Star className="h-5 w-5 text-cyan-400 fill-cyan-400" />
                Témoignages
              </span>
            </motion.div>

            {/* Title with stunning animation */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-none"
            >
              Ils nous font{" "}
              <span className="relative inline-block">
                <span className="gradient-text">confiance</span>
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                />
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-base sm:text-lg md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed font-medium"
            >
              Découvrez comment <span className="text-cyan-400 font-bold">Align.ai</span> a transformé leur recherche d&apos;emploi
            </motion.p>
          </motion.div>

          {/* Premium Testimonials Grid */}
          <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className="group relative"
              >
                {/* Card */}
                <motion.div
                  whileHover={{ y: -10, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="relative h-full glass rounded-[28px] p-6 md:p-8 border border-white/10 group-hover:border-white/20 transition-all duration-500 overflow-hidden backdrop-blur-xl"
                >
                  {/* Gradient background on hover */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 0%,
                        ${index === 0 ? "rgba(6, 182, 212, 0.08)" : index === 1 ? "rgba(99, 102, 241, 0.08)" : "rgba(168, 85, 247, 0.08)"} 0%,
                        transparent 70%)`
                    }}
                  />

                  {/* Top gradient accent */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[28px]"
                    style={{
                      background: `linear-gradient(90deg,
                        transparent 0%,
                        ${index === 0 ? "#06b6d4" : index === 1 ? "#6366f1" : "#a855f7"} 50%,
                        transparent 100%)`
                    }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                  />

                  <div className="relative">
                    {/* Quote Icon */}
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                      className="absolute -top-2 -right-2"
                    >
                      <div className="relative">
                        <div
                          className="absolute inset-0 rounded-xl blur-lg opacity-50"
                          style={{
                            background: index === 0 ? "#06b6d4" : index === 1 ? "#6366f1" : "#a855f7"
                          }}
                        />
                        <div
                          className="relative p-2 rounded-xl"
                          style={{
                            background: `linear-gradient(135deg, ${index === 0 ? "#06b6d4" : index === 1 ? "#6366f1" : "#a855f7"}, ${index === 0 ? "#0891b2" : index === 1 ? "#4f46e5" : "#9333ea"})`
                          }}
                        >
                          <Quote className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Rating Stars */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="flex gap-1 mb-5"
                    >
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            delay: index * 0.1 + 0.4 + i * 0.05,
                            type: "spring",
                            stiffness: 300
                          }}
                        >
                          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Testimonial Content */}
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                      className="text-white/80 text-sm md:text-base leading-relaxed mb-6 min-h-[120px]"
                    >
                      &ldquo;{testimonial.content}&rdquo;
                    </motion.p>

                    {/* Author Info */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                      className="flex items-center gap-4"
                    >
                      {/* Avatar with enhanced style */}
                      <div className="relative">
                        <div
                          className="absolute inset-0 rounded-full blur-md opacity-50"
                          style={{
                            background: `linear-gradient(135deg, ${index === 0 ? "#06b6d4" : index === 1 ? "#6366f1" : "#a855f7"}, ${index === 0 ? "#0891b2" : index === 1 ? "#4f46e5" : "#9333ea"})`
                          }}
                        />
                        <div
                          className="relative h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl ring-2 ring-white/20"
                          style={{
                            background: `linear-gradient(135deg, ${index === 0 ? "#06b6d4" : index === 1 ? "#6366f1" : "#a855f7"}, ${index === 0 ? "#0891b2" : index === 1 ? "#4f46e5" : "#9333ea"})`
                          }}
                        >
                          {testimonial.name[0]}
                        </div>
                      </div>

                      {/* Name and Role */}
                      <div className="flex-1">
                        <div className="text-white font-bold text-base">
                          {testimonial.name}
                        </div>
                        <div className="text-white/50 text-sm mt-0.5">
                          {testimonial.role}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Bottom shine */}
                  <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] rounded-full"
                    style={{
                      width: "70%",
                      background: `linear-gradient(90deg,
                        transparent 0%,
                        ${index === 0 ? "#06b6d4" : index === 1 ? "#6366f1" : "#a855f7"} 50%,
                        transparent 100%)`,
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 0.6 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.6, duration: 0.8 }}
                  />

                  {/* Corner glow on hover */}
                  <div
                    className="absolute top-4 right-4 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: index === 0 ? "#06b6d4" : index === 1 ? "#6366f1" : "#a855f7",
                    }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative px-4 py-16 md:py-24 overflow-hidden">
        {/* Epic background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          />
          <motion.div
            className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          />
        </div>

        <div className="mx-auto max-w-4xl relative">
          {/* Premium Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-20"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 px-4 py-2 backdrop-blur-xl border border-white/10 mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-md opacity-50" />
                <HelpCircle className="relative h-5 w-5 text-indigo-400" />
              </div>
              <span className="text-sm font-semibold text-white/80">
                FAQ
              </span>
            </motion.div>

            {/* Massive Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight mb-4"
            >
              Questions{" "}
              <span className="relative inline-block">
                <span className="gradient-text">fréquentes</span>
                <motion.div
                  className="absolute -bottom-2 md:-bottom-4 left-0 right-0 h-1 md:h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                />
              </span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto"
            >
              Tout ce que vous devez savoir sur{" "}
              <span className="text-white/90 font-semibold">Align.ai</span>
            </motion.p>
          </motion.div>

          {/* Premium FAQ Cards */}
          <div className="space-y-4 md:space-y-6">
            {faqs.map((faq, index) => {
              const colors = [
                { gradient: "from-cyan-500 to-indigo-500", icon: "cyan-400", glow: "cyan-500" },
                { gradient: "from-indigo-500 to-purple-500", icon: "indigo-400", glow: "indigo-500" },
                { gradient: "from-purple-500 to-violet-500", icon: "purple-400", glow: "purple-500" },
                { gradient: "from-violet-500 to-cyan-500", icon: "violet-400", glow: "violet-500" },
              ];
              const colorScheme = colors[index % colors.length];

              return (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="group relative"
                >
                  {/* Hover glow effect */}
                  <motion.div
                    className={`absolute -inset-1 bg-gradient-to-r ${colorScheme.gradient} rounded-[28px] opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`}
                  />

                  {/* Main card */}
                  <div className="relative glass rounded-[28px] p-6 md:p-8 border border-white/10 backdrop-blur-xl overflow-hidden">
                    {/* Top gradient accent */}
                    <motion.div
                      className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${colorScheme.gradient}`}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                    />

                    {/* Content wrapper */}
                    <div className="flex items-start gap-4 md:gap-6">
                      {/* Enhanced icon */}
                      <div className="relative flex-shrink-0">
                        {/* Icon glow */}
                        <div className={`absolute -inset-2 bg-gradient-to-r ${colorScheme.gradient} rounded-2xl blur-xl opacity-50`} />

                        {/* Icon container */}
                        <div className={`relative h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-gradient-to-br ${colorScheme.gradient} flex items-center justify-center shadow-lg shadow-${colorScheme.glow}/30`}>
                          <CheckCircle2 className="h-6 w-6 md:h-7 md:w-7 text-white" />
                        </div>
                      </div>

                      {/* Text content */}
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 leading-tight">
                          {faq.question}
                        </h3>
                        <p className="text-sm sm:text-base md:text-lg text-white/60 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>

                    {/* Bottom shine effect */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.4, duration: 0.6 }}
                    />

                    {/* Corner glow on hover */}
                    <motion.div
                      className={`absolute -bottom-2 -right-2 w-32 h-32 bg-gradient-to-tl ${colorScheme.gradient} rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section - Premium Upgrade */}
      <section className="relative px-4 py-16 md:py-32 overflow-hidden">
        {/* Epic background effects - Static */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          />
          <motion.div
            className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mx-auto max-w-6xl relative"
        >
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 shadow-2xl">
            {/* Static gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/10" />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 grid-pattern opacity-10" />

            {/* Radial gradient overlays */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.15),transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.15),transparent_50%)]" />

            {/* Main content */}
            <div className="relative glass p-8 sm:p-12 md:p-20 lg:p-24">
              <div className="max-w-4xl mx-auto text-center">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 px-4 py-2 backdrop-blur-xl border border-white/10 mb-8"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-md opacity-50" />
                    <Sparkles className="relative h-5 w-5 text-indigo-400" />
                  </div>
                  <span className="text-sm font-semibold text-white/80">
                    Lancez-vous maintenant
                  </span>
                </motion.div>

                {/* Massive Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight mb-6"
                >
                  Prêt à décrocher votre{" "}
                  <span className="relative inline-block">
                    <span className="gradient-text">prochain job</span>
                    <motion.div
                      className="absolute -bottom-2 md:-bottom-4 left-0 right-0 h-1 md:h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                    />
                  </span>{" "}
                  ?
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-10 md:mb-12"
                >
                  Rejoignez{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-bold">
                    des centaines de candidats
                  </span>{" "}
                  qui ont transformé leur recherche d&apos;emploi avec{" "}
                  <span className="text-white font-semibold">Align.ai</span>.{" "}
                  Commencez gratuitement aujourd&apos;hui.
                </motion.p>

                {/* Premium Stats badges */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-12 md:mb-16"
                >
                  {[
                    { icon: CheckCircle2, text: "Gratuit", gradient: "from-cyan-500 to-indigo-500", color: "cyan" },
                    { icon: Shield, text: "100% Éthique", gradient: "from-indigo-500 to-purple-500", color: "indigo" },
                    { icon: Zap, text: "5 min chrono", gradient: "from-purple-500 to-violet-500", color: "purple" },
                  ].map((badge, index) => (
                    <motion.div
                      key={badge.text}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                      whileHover={{ scale: 1.08, y: -4 }}
                      className="group relative"
                    >
                      {/* Hover glow */}
                      <div className={`absolute -inset-1 bg-gradient-to-r ${badge.gradient} rounded-full opacity-0 group-hover:opacity-30 blur-xl transition-all duration-300`} />

                      {/* Badge */}
                      <div className={`relative flex items-center gap-2.5 px-5 py-3 rounded-full glass border border-white/10 backdrop-blur-xl`}>
                        {/* Icon with gradient */}
                        <div className="relative">
                          <div className={`absolute -inset-1 bg-gradient-to-r ${badge.gradient} rounded-full blur opacity-50`} />
                          <div className={`relative h-6 w-6 rounded-full bg-gradient-to-br ${badge.gradient} flex items-center justify-center`}>
                            <badge.icon className="h-3.5 w-3.5 text-white" />
                          </div>
                        </div>
                        <span className="text-sm md:text-base font-semibold text-white">{badge.text}</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Massive CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  className="relative w-full max-w-lg mx-auto group mb-10 md:mb-12"
                >
                  {/* Static button glow */}
                  <div className="absolute -inset-2 md:-inset-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-[20px] md:rounded-[24px] opacity-40 group-hover:opacity-60 blur-xl md:blur-2xl transition-all duration-500" />

                  <Button
                    size="lg"
                    onClick={() => router.push("/upload")}
                    className="relative w-full btn-futuristic text-sm sm:text-base md:text-xl lg:text-2xl px-6 sm:px-10 md:px-16 lg:px-20 py-5 sm:py-6 md:py-8 lg:py-10 shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-500/80 transition-all group overflow-hidden rounded-[18px] md:rounded-[20px]"
                  >
                    <span className="relative flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
                      <span className="font-bold">Créer ma première candidature</span>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </span>
                  </Button>
                </motion.div>

                {/* Bottom trust indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm md:text-base"
                >
                  <div className="flex items-center gap-2.5 text-white/60">
                    <div className="relative">
                      <div className="absolute inset-0 bg-cyan-500 rounded-full blur opacity-50" />
                      <CheckCircle2 className="relative h-4 w-4 md:h-5 md:w-5 text-cyan-400" />
                    </div>
                    <span>Sans engagement</span>
                  </div>
                  <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/30" />
                  <div className="flex items-center gap-2.5 text-white/60">
                    <div className="relative">
                      <div className="absolute inset-0 bg-indigo-500 rounded-full blur opacity-50" />
                      <Shield className="relative h-4 w-4 md:h-5 md:w-5 text-indigo-400" />
                    </div>
                    <span>Données sécurisées</span>
                  </div>
                  <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/30" />
                  <div className="flex items-center gap-2.5 text-white/60">
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-500 rounded-full blur opacity-50" />
                      <Sparkles className="relative h-4 w-4 md:h-5 md:w-5 text-purple-400" />
                    </div>
                    <span>Résultats instantanés</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Premium corner accents */}
            <motion.div
              className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-indigo-500/30 to-transparent rounded-br-[60px]"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-500/30 to-transparent rounded-tl-[60px]"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            />

            {/* Top gradient accent */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />

            {/* Bottom shine */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
          </div>
        </motion.div>
      </section>

      {/* Footer - PREMIUM */}
      <footer className="relative border-t border-white/10 px-4 py-16 md:py-20 overflow-hidden">
        {/* Subtle background effect */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>

        <div className="mx-auto max-w-7xl relative">
          {/* Top gradient accent */}
          <motion.div
            className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-16 mb-16">
            {/* Brand Section - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2"
            >
              {/* Logo with premium styling */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative group">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />

                  {/* Icon container */}
                  <div className="relative h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-xl shadow-indigo-500/40">
                    <Sparkles className="h-6 w-6 md:h-7 md:w-7 text-white" />
                  </div>
                </div>
                <span className="text-3xl md:text-4xl font-black gradient-text">Align.ai</span>
              </div>

              <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-md mb-6">
                L&apos;optimisateur de candidature{" "}
                <span className="text-white font-bold">éthique et intelligent</span>.
                <br />
                Transformez votre CV en outil puissant sans jamais mentir sur vos compétences.
              </p>

              {/* Premium badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 backdrop-blur-xl">
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-sm font-semibold text-white/80">
                  Propulsé par Gemini 2.0 Flash
                </span>
              </div>
            </motion.div>

            {/* Links Section - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-indigo-400" />
                Produit
              </h3>
              <ul className="space-y-3">
                {["Fonctionnalités", "Tarifs", "FAQ", "Documentation"].map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <a
                      href="#"
                      className="text-white/60 hover:text-white transition-colors inline-flex items-center gap-2 group"
                    >
                      <div className="h-1 w-1 rounded-full bg-white/30 group-hover:bg-indigo-400 transition-colors" />
                      {item}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Social Section - Premium */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-purple-400" />
                Suivez-nous
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { Icon: Twitter, href: "#", gradient: "from-cyan-500 to-indigo-500" },
                  { Icon: Linkedin, href: "#", gradient: "from-indigo-500 to-purple-500" },
                  { Icon: Github, href: "#", gradient: "from-purple-500 to-violet-500" },
                  { Icon: Mail, href: "mailto:contact@align.ai", gradient: "from-violet-500 to-cyan-500" },
                ].map(({ Icon, href, gradient }, index) => (
                  <motion.a
                    key={index}
                    href={href}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.05, type: "spring" }}
                    whileHover={{ scale: 1.1, y: -3 }}
                    className="relative group"
                  >
                    {/* Hover glow */}
                    <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-40 blur-lg transition-all duration-300`} />

                    {/* Icon container */}
                    <div className="relative h-12 w-12 rounded-2xl glass border border-white/10 flex items-center justify-center backdrop-blur-xl group-hover:border-white/20 transition-all">
                      <Icon className="h-5 w-5 text-white/60 group-hover:text-white transition-colors" />
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom Section - Premium */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6"
          >
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-sm md:text-base text-white/50 mb-1">
                © 2024 <span className="text-white/70 font-semibold">Align.ai</span>. Tous droits réservés.
              </p>
              <p className="text-xs text-white/40">
                Propulsé par <span className="text-indigo-400">Next.js 16</span> et{" "}
                <span className="text-purple-400">Gemini 2.0</span>
              </p>
            </div>

            {/* Legal Links - Enhanced */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
              {["Mentions légales", "Confidentialité", "CGU", "Cookies"].map((item, index) => (
                <motion.a
                  key={item}
                  href="#"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className="text-white/50 hover:text-white transition-colors relative group"
                >
                  {item}
                  <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-indigo-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
