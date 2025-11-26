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
  ChevronDown,
  Target,
  Brain,
  CheckCircle2,
  Star,
  Quote,
  Github,
  Twitter,
  Linkedin,
  Mail,
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
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-12 md:py-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 -left-32 w-64 h-64 md:w-96 md:h-96 rounded-full bg-indigo-500/20 blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-32 w-64 h-64 md:w-96 md:h-96 rounded-full bg-purple-500/20 blur-3xl"
            animate={{
              x: [0, -30, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full bg-cyan-500/10 blur-3xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-indigo-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-30" />

        <div className="relative z-10 mx-auto max-w-7xl text-center">
          {/* Badge with enhanced design */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="inline-block"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative inline-flex items-center gap-3 rounded-full px-5 py-2.5 overflow-hidden group cursor-pointer"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 backdrop-blur-xl border border-indigo-500/20" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: "200% 100%" }}
              />

              {/* Content */}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-4 w-4 text-indigo-400" />
              </motion.div>
              <span className="relative text-sm font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Propulsé par Gemini 2.0 Flash
              </span>
              <motion.div
                className="h-2 w-2 rounded-full bg-emerald-400"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>

          {/* Main Title with enhanced animations */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="mt-8 md:mt-12"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="block text-white mb-2 md:mb-4"
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
                  {/* Animated underline */}
                  <motion.div
                    className="absolute -bottom-2 md:-bottom-4 left-0 right-0 h-1 md:h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                  />
                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 blur-2xl opacity-50"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="gradient-text">chirurgicale</span>
                  </motion.div>
                </span>
              </motion.span>
            </h1>
          </motion.div>

          {/* Enhanced Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mx-auto mt-8 md:mt-10 max-w-4xl px-4"
          >
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 leading-relaxed">
              Optimisez votre CV et lettre de motivation pour{" "}
              <span className="text-white font-semibold">chaque offre d&apos;emploi</span>.
              <br className="hidden md:block" />
              Notre IA analyse, conseille et génère des documents sur mesure -{" "}
              <motion.span
                className="relative inline-block"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-indigo-400 font-bold">
                  sans jamais mentir
                </span>
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-400"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 0.6 }}
                />
              </motion.span>{" "}
              sur vos compétences.
            </p>
          </motion.div>

          {/* Enhanced CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-10 md:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4"
          >
            {/* Primary Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto relative group"
            >
              {/* Button glow */}
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-75 group-hover:opacity-100 blur-xl transition-opacity"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              <Button
                size="lg"
                onClick={() => router.push("/upload")}
                className="relative w-full btn-futuristic text-base md:text-lg lg:text-xl px-10 md:px-12 py-6 md:py-8 shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-500/80 font-bold group overflow-hidden"
              >
                {/* Animated shine */}
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    x: ["-100%", "200%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  }}
                />

                <span className="relative flex items-center gap-3">
                  <Sparkles className="h-5 w-5" />
                  <span>Commencer gratuitement</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </span>
              </Button>
            </motion.div>

            {/* Secondary Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
                className="w-full glass border-white/20 hover:border-indigo-500/40 text-white hover:bg-white/10 px-10 md:px-12 py-6 md:py-8 text-base md:text-lg backdrop-blur-xl transition-all"
              >
                <span className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Comment ça marche ?
                </span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Enhanced Stats with cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto px-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: 1.1 + index * 0.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                whileHover={{
                  y: -8,
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                className="relative group"
              >
                {/* Card glow */}
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-75 blur-lg transition-opacity"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Card */}
                <div className="relative glass rounded-2xl p-5 md:p-7 border border-white/10 group-hover:border-indigo-500/30 transition-all">
                  {/* Animated gradient overlay */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 via-purple-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{
                      backgroundPosition: ["0% 0%", "100% 100%"],
                    }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                    style={{ backgroundSize: "200% 200%" }}
                  />

                  <div className="relative">
                    {/* Value with counter animation */}
                    <motion.div
                      className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-br from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2 + index * 0.1, type: "spring" }}
                    >
                      {stat.value}
                    </motion.div>

                    {/* Label */}
                    <div className="text-xs md:text-sm text-white/60 group-hover:text-white/80 transition-colors font-medium">
                      {stat.label}
                    </div>

                    {/* Bottom accent line */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      animate={{
                        backgroundPosition: ["-200% 0", "200% 0"],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      style={{ backgroundSize: "200% 100%" }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 hidden md:block cursor-pointer"
            onClick={() => {
              const featuresSection = document.querySelector('#features');
              featuresSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2 group"
            >
              <span className="text-xs text-white/40 font-medium tracking-wider uppercase group-hover:text-white/60 transition-colors">
                Découvrir
              </span>
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative h-12 w-12 rounded-full glass border-2 border-indigo-500/30 flex items-center justify-center group-hover:border-indigo-500/60 group-hover:bg-indigo-500/10 transition-all">
                  <ChevronDown className="h-6 w-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-16 md:py-24 relative">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 md:mb-24"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", duration: 0.6 }}
              className="inline-block"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-4 py-2 text-sm font-medium text-indigo-300 border border-indigo-500/20">
                <Sparkles className="h-4 w-4" />
                Pourquoi nous choisir ?
              </span>
            </motion.div>
            <h2 className="mt-6 text-4xl md:text-6xl font-bold text-white">
              Une expérience <span className="gradient-text">unique</span>
            </h2>
            <p className="mt-6 text-lg md:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              Découvrez les avantages qui font d&apos;Align.ai l&apos;outil préféré des professionnels
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid gap-8 md:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className="group relative"
                style={{ transformStyle: "preserve-3d", perspective: 1000 }}
              >
                {/* Glow effect background */}
                <motion.div
                  className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Card */}
                <motion.div
                  whileHover={{
                    y: -12,
                    rotateX: 5,
                    rotateY: 5,
                    scale: 1.03
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative h-full glass rounded-3xl p-8 border border-white/10 group-hover:border-indigo-500/30 transition-all duration-500 overflow-hidden"
                >
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent"
                      animate={{
                        backgroundPosition: ["0% 0%", "100% 100%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                      style={{ backgroundSize: "200% 200%" }}
                    />
                  </div>

                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                    initial={false}
                    animate={{
                      background: [
                        "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                        "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                      ],
                      backgroundPosition: ["-200% 0", "200% 0"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                    style={{ backgroundSize: "200% 100%" }}
                  />

                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className={`inline-flex rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 shadow-2xl shadow-indigo-500/30 mb-6 group-hover:shadow-indigo-500/50 transition-shadow`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm md:text-base text-white/60 group-hover:text-white/80 leading-relaxed transition-colors">
                      {feature.description}
                    </p>

                    {/* Decorative corner */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Bottom gradient line */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{
                      backgroundPosition: ["-200% 0", "200% 0"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{ backgroundSize: "200% 100%" }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="px-4 py-16 md:py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 md:mb-24"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", duration: 0.6 }}
              className="inline-block mb-6"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-4 py-2 text-sm font-medium text-indigo-300 border border-indigo-500/20">
                <Zap className="h-4 w-4" />
                Processus simplifié
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-bold text-white">
              Comment ça <span className="gradient-text">marche</span> ?
            </h2>
            <p className="mt-6 text-lg md:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              Un parcours fluide en 4 étapes pour transformer votre candidature
            </p>
          </motion.div>

          {/* Mobile: Vertical steps */}
          <div className="md:hidden space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring" }}
                className="relative"
              >
                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-7 top-16 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 to-purple-500 opacity-30 -translate-x-1/2" />
                )}

                <motion.div
                  whileHover={{ x: 8 }}
                  className="glass rounded-3xl p-6 flex items-start gap-5 border border-white/10 hover:border-indigo-500/30 transition-all relative z-10"
                >
                  <div className="relative flex-shrink-0">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-2xl shadow-indigo-500/40"
                    >
                      <step.icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-indigo-600 shadow-lg">
                      {step.step}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Desktop: Horizontal steps with improved z-index */}
          <div className="hidden md:block relative">
            {/* Background line - lower z-index */}
            <div className="absolute top-16 left-0 right-0 h-0.5 z-0">
              <div className="absolute inset-0 bg-white/10" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
                style={{ originX: 0 }}
              />
            </div>

            {/* Steps grid */}
            <div className="grid grid-cols-4 gap-8 relative z-10">
              {steps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: index * 0.2,
                    type: "spring",
                    stiffness: 100,
                    damping: 12
                  }}
                  className="relative"
                >
                  {/* Card container with higher z-index */}
                  <motion.div
                    whileHover={{
                      y: -20,
                      scale: 1.05,
                      rotateY: 10
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative z-20"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Glow effect */}
                    <motion.div
                      className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-indigo-500/0 via-purple-500/20 to-indigo-500/0 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />

                    {/* Main card */}
                    <div className="relative glass rounded-3xl p-8 border border-white/10 hover:border-indigo-500/40 transition-all duration-500 group">
                      {/* Top gradient line */}
                      <motion.div
                        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity"
                        animate={{
                          backgroundPosition: ["-200% 0", "200% 0"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        style={{ backgroundSize: "200% 100%" }}
                      />

                      {/* Icon container with absolute positioning */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-30">
                        <motion.div
                          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.15 }}
                          transition={{ duration: 0.6 }}
                          className="relative"
                        >
                          {/* Icon glow */}
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl blur-xl opacity-60" />

                          {/* Icon background */}
                          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-2xl shadow-indigo-500/50 ring-4 ring-black/50">
                            <step.icon className="h-8 w-8 text-white" />
                          </div>

                          {/* Step number badge */}
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
                            className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-indigo-600 shadow-xl border-2 border-indigo-500/20"
                          >
                            {step.step}
                          </motion.div>
                        </motion.div>
                      </div>

                      {/* Content with top padding for icon */}
                      <div className="mt-10 text-center">
                        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                          {step.title}
                        </h3>
                        <p className="text-sm text-white/60 group-hover:text-white/80 leading-relaxed transition-colors">
                          {step.description}
                        </p>
                      </div>

                      {/* Bottom decorative element */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Ils nous font <span className="gradient-text">confiance</span>
            </h2>
            <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
              Découvrez comment Align.ai a transformé leur recherche d&apos;emploi
            </p>
          </motion.div>

          <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass rounded-2xl p-6 md:p-8 relative"
              >
                <Quote className="absolute top-6 right-6 h-8 w-8 text-indigo-500/20" />
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-500 text-amber-500"
                    />
                  ))}
                </div>
                <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-white/50 text-xs">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Questions <span className="gradient-text">fréquentes</span>
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Tout ce que vous devez savoir sur Align.ai
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-6 md:p-8"
              >
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-white/60 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 md:py-32 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mx-auto max-w-6xl relative"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/10">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-indigo-500/10" />
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  "radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)",
                  "radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)",
                  "radial-gradient(circle at 0% 100%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)",
                  "radial-gradient(circle at 100% 0%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)",
                  "radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)",
                ],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 grid-pattern opacity-20" />

            {/* Main content */}
            <div className="relative glass p-10 md:p-20">
              <div className="max-w-4xl mx-auto text-center">
                {/* Icon with glow */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", duration: 1, delay: 0.2 }}
                  className="relative inline-block mb-8"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-2xl opacity-60"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.6, 0.8, 0.6],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-indigo-500/50">
                    <Sparkles className="h-10 w-10 md:h-12 md:w-12 text-white" />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6"
                >
                  Prêt à décrocher votre{" "}
                  <span className="relative inline-block">
                    <span className="gradient-text">prochain job</span>
                    <motion.div
                      className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                    />
                  </span>{" "}
                  ?
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="text-base sm:text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-10"
                >
                  Rejoignez <span className="text-indigo-400 font-semibold">des centaines de candidats</span> qui ont transformé leur
                  recherche d&apos;emploi avec Align.ai. Commencez gratuitement
                  aujourd&apos;hui.
                </motion.p>

                {/* Stats badges */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap items-center justify-center gap-4 mb-12"
                >
                  {[
                    { icon: CheckCircle2, text: "Gratuit" },
                    { icon: Shield, text: "100% Éthique" },
                    { icon: Zap, text: "5 min chrono" },
                  ].map((badge, index) => (
                    <motion.div
                      key={badge.text}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
                    >
                      <badge.icon className="h-4 w-4 text-indigo-400" />
                      <span className="text-sm font-medium text-white/90">{badge.text}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7, type: "spring" }}
                  className="relative inline-block group"
                >
                  {/* Button glow effect */}
                  <motion.div
                    className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-75 blur-xl transition-opacity"
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  <Button
                    size="lg"
                    onClick={() => router.push("/upload")}
                    className="relative btn-futuristic text-base sm:text-lg md:text-xl px-10 sm:px-14 py-6 sm:py-8 shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-500/80 transition-all group overflow-hidden"
                  >
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 w-full h-full"
                      animate={{
                        x: ["-100%", "200%"],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: "easeInOut",
                      }}
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                      }}
                    />

                    <span className="relative flex items-center gap-3">
                      <span>Créer ma première candidature</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
                      </motion.div>
                    </span>
                  </Button>
                </motion.div>

                {/* Bottom info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9 }}
                  className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
                >
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Sans engagement</span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Shield className="h-4 w-4 text-indigo-400" />
                    <span>Données sécurisées</span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span>Résultats instantanés</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-br-full" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-500/20 to-transparent rounded-tl-full" />
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Align.ai</span>
              </div>
              <p className="text-white/60 leading-relaxed max-w-md">
                L&apos;optimisateur de candidature éthique et intelligent.
                Transformez votre CV en outil puissant sans jamais mentir sur vos
                compétences.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Produit</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white/60 hover:text-white transition-colors">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white transition-colors">
                    Tarifs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-white font-semibold mb-4">Suivez-nous</h3>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="h-10 w-10 rounded-lg glass flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="h-10 w-10 rounded-lg glass flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="h-10 w-10 rounded-lg glass flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="mailto:contact@align.ai"
                  className="h-10 w-10 rounded-lg glass flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/40 text-center md:text-left">
              © 2024 Align.ai. Tous droits réservés. Propulsé par Next.js 16 et Gemini 2.0
            </p>
            <div className="flex gap-6 text-sm text-white/40">
              <a href="#" className="hover:text-white transition-colors">
                Mentions légales
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Confidentialité
              </a>
              <a href="#" className="hover:text-white transition-colors">
                CGU
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
