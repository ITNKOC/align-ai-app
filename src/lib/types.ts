// ============================================
// ALIGN.AI - Types System v2.0
// Architecture: Slot Filling + ReAct + Task Memory
// ============================================

// ==================== LANGUAGE SUPPORT (Story 5.7) ====================

export type SupportedLanguage = "fr" | "en";

export interface LanguageDetectionResult {
  language: SupportedLanguage;
  confidence: number; // 0-1 confidence score
  method: "pattern" | "gemini";
}

// ==================== PROFILE TYPE DETECTION (Feature 2) ====================

export type ProfileType =
  | "developer"    // Languages, Frameworks, Tools
  | "designer"     // Design Tools, Prototyping, UX Research
  | "marketer"     // Channels, Analytics, Content
  | "manager"      // Methodologies, Leadership, Management
  | "sales"        // Negotiation, CRM, Prospecting
  | "analyst"      // Data Tools, Visualization, SQL
  | "researcher"   // Publications, Methodology, Domain
  | "generalist";  // Standard structure

export interface DynamicSkillCategory {
  name: string;           // Category name (localized)
  nameEn: string;         // English name
  skills: string[];       // Skills in this category
  priority: number;       // Display order (lower = higher priority)
}

// Profile-specific skill category configurations
export const PROFILE_SKILL_CATEGORIES: Record<ProfileType, { fr: string; en: string }[]> = {
  developer: [
    { fr: "Langages", en: "Languages" },
    { fr: "Frameworks", en: "Frameworks" },
    { fr: "IA & Data", en: "AI & Data" },
    { fr: "Outils & Cloud", en: "Tools & Cloud" },
  ],
  designer: [
    { fr: "Outils Design", en: "Design Tools" },
    { fr: "Prototypage", en: "Prototyping" },
    { fr: "UX Research", en: "UX Research" },
    { fr: "Outils Collaboration", en: "Collaboration Tools" },
  ],
  marketer: [
    { fr: "Canaux Marketing", en: "Marketing Channels" },
    { fr: "Analytics & Data", en: "Analytics & Data" },
    { fr: "Content & SEO", en: "Content & SEO" },
    { fr: "Outils Marketing", en: "Marketing Tools" },
  ],
  manager: [
    { fr: "Methodologies", en: "Methodologies" },
    { fr: "Leadership", en: "Leadership" },
    { fr: "Gestion de Projet", en: "Project Management" },
    { fr: "Outils", en: "Tools" },
  ],
  sales: [
    { fr: "Techniques de Vente", en: "Sales Techniques" },
    { fr: "CRM & Outils", en: "CRM & Tools" },
    { fr: "Negociation", en: "Negotiation" },
    { fr: "Prospection", en: "Prospecting" },
  ],
  analyst: [
    { fr: "Outils Data", en: "Data Tools" },
    { fr: "Visualisation", en: "Visualization" },
    { fr: "SQL & Databases", en: "SQL & Databases" },
    { fr: "Statistiques", en: "Statistics" },
  ],
  researcher: [
    { fr: "Methodologie", en: "Methodology" },
    { fr: "Domaine d'Expertise", en: "Domain Expertise" },
    { fr: "Publications", en: "Publications" },
    { fr: "Outils", en: "Tools" },
  ],
  generalist: [
    { fr: "Competences Techniques", en: "Technical Skills" },
    { fr: "Competences Metier", en: "Domain Skills" },
    { fr: "Outils", en: "Tools" },
    { fr: "Soft Skills", en: "Soft Skills" },
  ],
};

// ==================== CV STRUCTURED DATA ====================

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Education {
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
}

export interface Project {
  name: string;
  description: string;
  techStack: string[];
  year: string;
}

export interface Skills {
  languages: string[];
  frameworks: string[];
  aiAndData: string[];
  toolsAndCloud: string[];
  softSkills: string[];
  // Dynamic skills for non-developer profiles (Feature 2)
  dynamicCategories?: DynamicSkillCategory[];
}

export interface CVData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  skills: Skills;
  languages: { language: string; level: string }[];
  // Profile type detection (Feature 2)
  profileType?: ProfileType;
}

// ==================== ENHANCED GAP ANALYSIS ====================

export type GapSeverity = "critical" | "moderate" | "minor";
export type GapCategory =
  | "technical_language"
  | "framework"
  | "devops"
  | "database"
  | "cloud"
  | "methodology"
  | "soft_skill"
  | "domain_knowledge"
  | "tool"
  | "other";

export interface GapAnalysis {
  skill: string;
  severity: GapSeverity;
  category: GapCategory;
  suggestion: string;
  // Enhanced fields for prioritization
  importanceScore: number;        // 1-10 score based on job requirements
  relatedSkillsInCV: string[];    // Skills the candidate has that are related
  potentialTransferable: boolean; // If candidate might have transferable experience
}

// Problem → Solution match from job analysis
export interface ProblemSolutionMatch {
  implicitProblem: string;    // Problem detected in job offer
  candidateProof: string;     // How candidate solved similar problem
  relevanceScore: number;     // 1-10 how relevant
  cvEvidence: string;         // Where in CV this was found
}

export interface AnalysisResult {
  score: number;
  gaps: GapAnalysis[];
  keywords: string[];
  matchedSkills: string[];
  jobTitle: string;
  company: string;
  // Enhanced fields
  totalGapsFound: number;         // Total before any filtering
  gapsByPriority: {
    critical: GapAnalysis[];
    moderate: GapAnalysis[];
    minor: GapAnalysis[];
  };
  // Problem → Solution matching (NEW)
  problemSolutionMatches?: ProblemSolutionMatch[];
  implicitProblemsDetected?: string[];
}

// ==================== SLOT FILLING SYSTEM ====================

export type ProjectContext = "academic" | "professional" | "personal" | "freelance" | "hackathon" | "certification";

export interface CollectedProject {
  name: string;
  description: string;
  context: ProjectContext;
  duration?: string;
  year?: string;
  technologies: string[];
  role?: string;
  teamSize?: number;
  achievements?: string[];       // Quantified achievements
  impact?: string;               // Business/technical impact
}

export interface GapSlot {
  skill: string;
  severity: GapSeverity;
  category: GapCategory;

  // Smart pre-analysis (v3.0) - populated before chat starts
  preAnalysis?: PreAnalysis;

  // Slot filling state
  status: "pending" | "exploring" | "filled" | "skipped";

  // Collected information
  hasDirectExperience: boolean | null;
  experienceLevel: "none" | "beginner" | "intermediate" | "advanced" | null;

  // Related projects discovered during conversation
  relatedProjects: CollectedProject[];

  // Transferable skills identified
  transferableSkills: {
    skill: string;
    fromExperience: string;      // Where this skill was used
    relevanceScore: number;       // 1-10 how relevant to the gap
  }[];

  // Learning evidence
  learningEvidence: {
    type: "course" | "self_taught" | "mentorship" | "certification" | "interest";
    description: string;
    timeframe?: string;
  }[];

  // Quantified achievements related to this skill
  quantifiedAchievements: string[];

  // Final strategy decided
  strategy: Strategy | null;

  // Metadata
  questionsAsked: number;
  filledAt: number | null;
}

// ==================== STRATEGY TYPES ====================

export type StrategyApproach =
  | "add_skill"           // Candidate has the skill, add/highlight it
  | "transferable"        // Use transferable skills from other experience
  | "fast_learner"        // Emphasize learning capacity
  | "project_based"       // Highlight specific project experience
  | "reframe"             // Reframe existing experience to match
  | "acknowledge_gap";    // Honest acknowledgment with mitigation plan

export interface Strategy {
  gapSkill: string;
  approach: StrategyApproach;
  details: string;
  validated: boolean;

  // Enhanced strategy data
  evidenceUsed: string[];         // What evidence supports this strategy
  cvSections: string[];           // Which CV sections to modify
  coverLetterPoints: string[];    // Points to include in cover letter
  suggestedPhrasing?: string;     // How to phrase this in documents
}

// ==================== SMART PRE-ANALYSIS (v3.0) ====================

export interface PreAnalysis {
  potentialMatches: string[];           // CV skills potentially related to the gap
  relatedProjects: string[];            // Project names that might be relevant
  relatedExperiences: string[];         // Experience titles that might be relevant
  suggestedStrategy: StrategyApproach | null;  // Auto-suggested strategy
  confidence: number;                   // 0-100, if >70 → skip question
  reasoning: string;                    // Why this strategy was suggested
}

// ==================== REACT FRAMEWORK ====================

export type ReActStep = "thought" | "action" | "observation";

export interface ReActTrace {
  step: ReActStep;
  content: string;
  timestamp: number;
}

export interface ConversationState {
  currentGapIndex: number;
  currentSlot: GapSlot;
  phase: "exploration" | "clarification" | "quantification" | "validation";
  reactTrace: ReActTrace[];
}

// ==================== TASK MEMORY TREE ====================

export interface TaskMemoryNode {
  id: string;
  type: "gap" | "question" | "answer" | "extraction" | "strategy";
  content: string;
  parentId: string | null;
  children: string[];
  metadata: Record<string, unknown>;
  timestamp: number;
}

export interface TaskMemoryTree {
  rootId: string;
  nodes: Record<string, TaskMemoryNode>;
  currentPath: string[];          // Path from root to current node
  summary: string;                // Compressed summary of conversation
}

// ==================== CHAT TYPES ====================

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: number;

  // Suggested replies for assistant messages
  suggestedReplies?: SuggestedReply[];

  // Enhanced metadata
  metadata?: {
    gapIndex?: number;
    phase?: "exploration" | "clarification" | "quantification" | "validation";
    extractedData?: Partial<GapSlot>;
    reactTrace?: ReActTrace[];
  };
}

export interface ChatContext {
  gapSlots: GapSlot[];
  currentGapIndex: number;
  taskMemory: TaskMemoryTree;
  conversationSummary: string;
  totalQuestionsAsked: number;

  // State flags
  allGapsProcessed: boolean;
  readyForGeneration: boolean;
}

// ==================== GENERATION TYPES ====================

export interface GenerationData {
  cvLatex: string;
  coverLetterLatex: string;
}

export interface FollowUpEmail {
  subject: string;
  body: string;
  tone: "formal" | "professional" | "friendly";
  sendAfterDays: number;
}

export interface GeneratedDocuments {
  cv: {
    latex: string;
    pdfBase64?: string;
  };
  coverLetter: {
    latex: string;
    pdfBase64?: string;
  };
  followUpEmail: FollowUpEmail;
}

// ==================== AI RESPONSE TYPES ====================

// Suggested reply for quick responses
export interface SuggestedReply {
  id: string;
  label: string;           // Short display text (e.g., "Oui, j'ai de l'expérience")
  value: string;           // Full response text to send
  type: "positive" | "negative" | "neutral" | "detail";
}

export interface StrategistResponse {
  // ReAct trace
  thought: string;                // What the AI is thinking
  action: string;                 // What action it's taking

  // Message to user
  message: string;

  // Suggested replies for quick responses (3 options)
  suggestedReplies: SuggestedReply[];

  // Extracted information from user's response
  extraction: {
    hasExperience: boolean | null;
    experienceLevel: "none" | "beginner" | "intermediate" | "advanced" | null;
    projects: CollectedProject[];
    transferableSkills: string[];
    learningEvidence: string[];
    achievements: string[];
  };

  // Conversation control
  nextPhase: "exploration" | "clarification" | "quantification" | "validation" | "next_gap";
  strategy: Strategy | null;

  // Confidence score for moving to next gap
  confidenceToClose: number;      // 0-100, move to next gap if > 80
}

export interface AnalystResponse {
  score: number;
  gaps: GapAnalysis[];
  keywords: string[];
  matchedSkills: string[];
  jobTitle: string;
  company: string;

  // Analysis reasoning
  analysisReasoning: string;
  skillMatchDetails: {
    skill: string;
    matchedWith: string;
    confidence: number;
  }[];
}

// ==================== APPLICATION STATUS ====================

export type ApplicationStatus =
  | "analyzing"           // Initial CV parsing
  | "analyzed"            // Gap analysis complete
  | "chatting"            // Strategic conversation in progress
  | "strategies_complete" // All gaps addressed
  | "latex_generated"     // Documents generated but PDF pending
  | "completed"           // All documents ready
  | "error";              // Something went wrong

// ==================== LEARNED GAPS (Progressive Intelligence) ====================

export interface LearnedGap {
  strategy: Strategy;
  evidence: string[];        // Evidence that supports this strategy
  confidence: number;        // 0-1 confidence score
  lastUsed: Date;            // Last time this gap was used
  usageCount: number;        // Number of times this strategy was applied
}

// Storage format in MasterProfile.learnedGaps
export type LearnedGapsRecord = Record<string, LearnedGap>;

// ==================== PROFILE UPDATE TYPES (Story 2.2) ====================

export interface ProfileUpdatePayload {
  personalInfo?: Partial<PersonalInfo>;
  skills?: Skills;
  experiences?: ExperienceItem[];
  projects?: ProjectItem[];
  education?: EducationItem[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  highlights: string[];
  year?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

// ==================== SKILL MATCHING TYPES (Story 5.6) ====================

export interface SkillMatch {
  skill: string;
  matchType: 'exact' | 'partial' | 'synonym';
  category: string;
  score: number;
}

export interface OrganizedSkills {
  matched: {
    category: string;
    skills: SkillMatch[];
  }[];
  other: string[];
}

export interface SkillCategory {
  name: string;
  nameEn: string;
  keywords: string[];
}

// ==================== CV TEMPLATE TYPES (Story 5.8) ====================

export interface CVSections {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  whyMe: string;      // LaTeX content
  skills: string;     // LaTeX content
  experience: string; // LaTeX content
  projects: string;   // LaTeX content
  education: string;  // LaTeX content
  languages?: string; // LaTeX content
}

export interface TemplateOptions {
  language?: SupportedLanguage;
  includeWhyMe?: boolean;
  maxExperiences?: number;
  maxProjects?: number;
}

// ==================== UTILITY TYPES ====================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
