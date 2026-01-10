// ============================================
// ALIGN.AI - Vocabulary Helper
// Provides examples for technical terms to help candidates understand
// ============================================

// Map of technical terms to their common examples/tools
export const vocabularyExamples: Record<string, string[]> = {
  // DevOps & CI/CD
  "ci/cd": ["GitHub Actions", "Jenkins", "GitLab CI", "CircleCI"],
  "ci cd": ["GitHub Actions", "Jenkins", "GitLab CI", "CircleCI"],
  "continuous integration": ["GitHub Actions", "Jenkins", "Travis CI"],
  "continuous deployment": ["ArgoCD", "Spinnaker", "AWS CodeDeploy"],
  "containerization": ["Docker", "Podman", "containerd"],
  "container": ["Docker", "Kubernetes", "Docker Compose"],
  "orchestration": ["Kubernetes", "Docker Swarm", "AWS ECS"],
  "kubernetes": ["K8s", "Helm", "kubectl", "Minikube"],
  "infrastructure as code": ["Terraform", "Pulumi", "CloudFormation"],
  "iac": ["Terraform", "Ansible", "Pulumi"],
  "configuration management": ["Ansible", "Puppet", "Chef"],

  // Cloud
  "cloud": ["AWS", "Google Cloud", "Azure", "Heroku"],
  "aws": ["EC2", "S3", "Lambda", "RDS", "CloudFront"],
  "gcp": ["Compute Engine", "Cloud Storage", "Cloud Functions"],
  "azure": ["Azure Functions", "Blob Storage", "Azure DevOps"],
  "serverless": ["AWS Lambda", "Vercel", "Netlify Functions", "Cloud Functions"],

  // Testing
  "testing": ["Jest", "Vitest", "Mocha", "Cypress"],
  "unit testing": ["Jest", "Vitest", "Mocha", "JUnit"],
  "e2e testing": ["Cypress", "Playwright", "Selenium"],
  "end-to-end": ["Cypress", "Playwright", "Puppeteer"],
  "test automation": ["Cypress", "Selenium", "Playwright"],
  "tdd": ["Test-Driven Development", "Jest", "Mocha"],

  // Frontend
  "frontend": ["React", "Vue", "Angular", "Svelte"],
  "react": ["React Hooks", "Redux", "Next.js", "React Query"],
  "vue": ["Vue 3", "Vuex", "Nuxt.js", "Pinia"],
  "angular": ["Angular 17+", "RxJS", "NgRx"],
  "state management": ["Redux", "Zustand", "Pinia", "MobX"],
  "css framework": ["Tailwind CSS", "Bootstrap", "Material UI"],
  "responsive design": ["Flexbox", "CSS Grid", "Media Queries"],

  // Backend
  "backend": ["Node.js", "Python", "Java", "Go"],
  "api": ["REST", "GraphQL", "gRPC", "WebSocket"],
  "rest api": ["Express", "FastAPI", "Spring Boot"],
  "graphql": ["Apollo", "Hasura", "Prisma"],
  "microservices": ["Docker", "Kubernetes", "API Gateway"],
  "orm": ["Prisma", "TypeORM", "Sequelize", "Hibernate"],

  // Databases
  "database": ["PostgreSQL", "MySQL", "MongoDB", "Redis"],
  "sql": ["PostgreSQL", "MySQL", "SQLite", "SQL Server"],
  "nosql": ["MongoDB", "Redis", "DynamoDB", "Cassandra"],
  "caching": ["Redis", "Memcached", "CDN"],

  // Languages
  "typescript": ["TypeScript", "TSX", "Type definitions"],
  "javascript": ["ES6+", "Node.js", "TypeScript"],
  "python": ["Python 3", "Django", "FastAPI", "Flask"],
  "java": ["Java 17+", "Spring Boot", "Maven", "Gradle"],
  "go": ["Golang", "Gin", "Echo"],

  // Methodologies
  "agile": ["Scrum", "Kanban", "Sprint Planning"],
  "scrum": ["Sprint", "Daily Standup", "Retrospective"],
  "project management": ["Jira", "Trello", "Asana", "Linear"],

  // Security
  "security": ["OAuth", "JWT", "HTTPS", "OWASP"],
  "authentication": ["OAuth 2.0", "JWT", "SSO", "Passport.js"],
  "authorization": ["RBAC", "ACL", "Permissions"],

  // AI/ML
  "machine learning": ["TensorFlow", "PyTorch", "scikit-learn"],
  "ml": ["TensorFlow", "PyTorch", "Keras"],
  "ai": ["OpenAI API", "LangChain", "Hugging Face"],
  "data science": ["Pandas", "NumPy", "Jupyter"],

  // Soft Skills
  "leadership": ["Team Lead", "Tech Lead", "Mentorat"],
  "communication": ["Présentation", "Documentation", "Collaboration"],
  "problem solving": ["Debugging", "Architecture", "Optimisation"],
};

/**
 * Get examples for a technical term
 * @param term The technical term to look up
 * @returns Array of example tools/technologies, or empty array if not found
 */
export function getVocabularyExamples(term: string): string[] {
  const normalizedTerm = term.toLowerCase().trim();

  // Direct match
  if (vocabularyExamples[normalizedTerm]) {
    return vocabularyExamples[normalizedTerm];
  }

  // Partial match
  for (const [key, examples] of Object.entries(vocabularyExamples)) {
    if (normalizedTerm.includes(key) || key.includes(normalizedTerm)) {
      return examples;
    }
  }

  return [];
}

/**
 * Format a skill with examples for display
 * @param skill The skill name
 * @returns Formatted string like "CI/CD (ex: GitHub Actions, Jenkins)"
 */
export function formatSkillWithExamples(skill: string): string {
  const examples = getVocabularyExamples(skill);

  if (examples.length === 0) {
    return skill;
  }

  // Take up to 3 examples
  const displayExamples = examples.slice(0, 3).join(", ");
  return `${skill} (ex: ${displayExamples})`;
}

/**
 * Add vocabulary help to a message about a skill
 * @param message The original message
 * @param skill The skill being discussed
 * @returns Message with vocabulary help added
 */
export function addVocabularyHelp(message: string, skill: string): string {
  const examples = getVocabularyExamples(skill);

  if (examples.length === 0) {
    return message;
  }

  const helpText = `\n\n💡 *${skill} inclut par exemple: ${examples.slice(0, 4).join(", ")}*`;
  return message + helpText;
}
