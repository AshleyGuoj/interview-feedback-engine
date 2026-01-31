export type JobStatus = 'applied' | 'interviewing' | 'offer' | 'closed';

export type InterviewFormat = 'phone' | 'zoom' | 'onsite';

export type JobSource = 'linkedin' | 'boss' | 'referral' | 'website' | 'other';

// Interview question record - for building question database
export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'case' | 'motivation' | 'other';
  myAnswer?: string;
  idealAnswer?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  wasAsked: boolean; // true if actually asked, false if predicted
  answeredWell?: boolean; // self-assessment
  tags?: string[];
}

// Self-reflection after interview
export interface InterviewReflection {
  overallFeeling: 'great' | 'good' | 'neutral' | 'poor' | 'bad';
  whatWentWell: string[];
  whatCouldImprove: string[];
  surprisingQuestions?: string[];
  keyTakeaways: string[];
  followUpActions?: string[];
  interviewerVibe?: string; // How the interviewer seemed
  companyInsights?: string; // New learnings about the company
}

// Reusable story/experience for STAR method
export interface StoryMaterial {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  metrics?: string; // Quantifiable results
  skills: string[];
  usedInCompanies?: string[]; // Track where this story was used
  effectiveness?: 'high' | 'medium' | 'low';
}

export interface InterviewStage {
  id: string;
  name: string;
  status: 'upcoming' | 'completed' | 'skipped';
  date?: string;
  scheduledTime?: string;
  scheduledTimezone?: string;
  deadline?: string;
  deadlineTimezone?: string;
  
  // Interview content for knowledge base
  questions?: InterviewQuestion[];
  reflection?: InterviewReflection;
  storiesUsed?: string[]; // IDs of StoryMaterial used in this interview
  
  // Legacy fields for compatibility
  preparation?: {
    notes: string;
    stories: string[];
    questions: string[];
  };
  interviewLog?: {
    interviewers: string[];
    format: InterviewFormat;
    questionsAsked: string[];
    topicsCovered: string[];
  };
  postReview?: {
    summary: string;
    strengths: string[];
    risks: string[];
    signals: string[];
    nextSteps: string[];
  };
}

export interface Job {
  id: string;
  companyName: string;
  roleTitle: string;
  location: 'CN' | 'US' | 'Remote' | 'Other';
  status: JobStatus;
  jobLink?: string;
  source: JobSource;
  interestLevel: 1 | 2 | 3 | 4 | 5;
  careerFitNotes?: string;
  currentStage?: string;
  nextAction?: string;
  stages: InterviewStage[];
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_STAGES: Omit<InterviewStage, 'id'>[] = [
  { name: 'Applied', status: 'completed' },
  { name: 'HR Screen', status: 'upcoming' },
  { name: 'Round 1', status: 'upcoming' },
  { name: 'Round 2', status: 'upcoming' },
  { name: 'Final Round', status: 'upcoming' },
  { name: 'Offer Discussion', status: 'upcoming' },
];

// Question categories for display
export const QUESTION_CATEGORIES = {
  behavioral: { label: '行为面试', labelEn: 'Behavioral', color: 'blue' },
  technical: { label: '技术问题', labelEn: 'Technical', color: 'purple' },
  situational: { label: '情景问题', labelEn: 'Situational', color: 'green' },
  case: { label: '案例分析', labelEn: 'Case Study', color: 'orange' },
  motivation: { label: '动机问题', labelEn: 'Motivation', color: 'pink' },
  other: { label: '其他', labelEn: 'Other', color: 'gray' },
} as const;

// Reflection feelings for display
export const REFLECTION_FEELINGS = {
  great: { label: '非常好', emoji: '🎉', color: 'emerald' },
  good: { label: '还不错', emoji: '😊', color: 'green' },
  neutral: { label: '一般般', emoji: '😐', color: 'gray' },
  poor: { label: '不太好', emoji: '😔', color: 'orange' },
  bad: { label: '很糟糕', emoji: '😢', color: 'red' },
} as const;
