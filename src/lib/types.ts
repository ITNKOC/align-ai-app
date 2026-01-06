// ============================================
// ALIGN.AI - Types System v2.0
// Architecture: Slot Filling + ReAct + Task Memory
// ============================================

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
}

export interface CVData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  skills: Skills;
  languages: { language: string; level: string }[];
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
