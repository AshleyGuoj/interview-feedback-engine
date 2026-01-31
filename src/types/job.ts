export type JobStatus = 'applied' | 'interviewing' | 'offer' | 'closed';

export type InterviewFormat = 'phone' | 'zoom' | 'onsite';

export type JobSource = 'linkedin' | 'boss' | 'referral' | 'website' | 'other';

// Sub-status for more granular tracking within each main status
export type InterviewingSubStatus = 
  | 'interview_scheduled'    // 📅 有排期
  | 'feedback_pending'       // ⏳ 等反馈
  | 'approval_pending'       // ⚠️ 等审批
  | 'hr_followup'           // 🧑‍💼 HR跟进中
  | 'preparing';            // 📚 准备中

export type OfferSubStatus = 
  | 'offer_discussion'       // 💬 谈薪中
  | 'offer_pending'          // ⏳ 等offer
  | 'offer_received'         // 📩 已收到offer
  | 'negotiating';           // 🤝 谈判中

export type ClosedReason = 
  | 'rejected_after_interview'  // ❌ 面试后被拒
  | 'rejected_resume'           // 📄 简历被拒
  | 'no_response'               // 💤 无回复/Ghosted
  | 'withdrawn'                 // 🔁 主动放弃
  | 'hc_frozen'                 // 🚫 HC冻结
  | 'position_cancelled'        // ❌ 岗位取消
  | 'offer_declined';           // 🙅 拒绝offer

// Risk/Signal tags for quick visibility
export type RiskTag = 
  | 'hc_risk'                // ⚠️ HC风险
  | 'long_silence'           // 🕒 长时间无回复 (7+天)
  | 'extra_round'            // 🔁 加面
  | 'competing_offer'        // 💰 有竞争offer
  | 'timeline_delay'         // ⏰ 时间线延迟
  | 'salary_gap'             // 💵 薪资差距
  | 'lowball_offer';         // 📉 低于预期offer

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
  
  // Enhanced tracking fields
  subStatus?: InterviewingSubStatus | OfferSubStatus;
  closedReason?: ClosedReason;
  riskTags?: RiskTag[];
  lastContactDate?: string; // For calculating "long silence"
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

// Sub-status display config
export const SUB_STATUS_CONFIG: Record<InterviewingSubStatus | OfferSubStatus, { label: string; emoji: string; color: string }> = {
  interview_scheduled: { label: 'Scheduled', emoji: '📅', color: 'blue' },
  feedback_pending: { label: 'Feedback Pending', emoji: '⏳', color: 'amber' },
  approval_pending: { label: 'Approval Pending', emoji: '⚠️', color: 'orange' },
  hr_followup: { label: 'HR Follow-up', emoji: '🧑‍💼', color: 'purple' },
  preparing: { label: 'Preparing', emoji: '📚', color: 'cyan' },
  offer_discussion: { label: 'Discussing', emoji: '💬', color: 'blue' },
  offer_pending: { label: 'Offer Pending', emoji: '⏳', color: 'amber' },
  offer_received: { label: 'Offer Received', emoji: '📩', color: 'green' },
  negotiating: { label: 'Negotiating', emoji: '🤝', color: 'purple' },
};

// Risk tag display config
export const RISK_TAG_CONFIG: Record<RiskTag, { label: string; emoji: string; color: string }> = {
  hc_risk: { label: 'HC Risk', emoji: '⚠️', color: 'red' },
  long_silence: { label: 'Long Silence', emoji: '🕒', color: 'gray' },
  extra_round: { label: 'Extra Round', emoji: '🔁', color: 'orange' },
  competing_offer: { label: 'Competing Offer', emoji: '💰', color: 'green' },
  timeline_delay: { label: 'Delayed', emoji: '⏰', color: 'amber' },
  salary_gap: { label: 'Salary Gap', emoji: '💵', color: 'red' },
  lowball_offer: { label: 'Lowball', emoji: '📉', color: 'red' },
};

// Closed reason display config
export const CLOSED_REASON_CONFIG: Record<ClosedReason, { label: string; emoji: string; color: string }> = {
  rejected_after_interview: { label: 'Rejected', emoji: '❌', color: 'red' },
  rejected_resume: { label: 'Resume Rejected', emoji: '📄', color: 'gray' },
  no_response: { label: 'No Response', emoji: '💤', color: 'gray' },
  withdrawn: { label: 'Withdrawn', emoji: '🔁', color: 'blue' },
  hc_frozen: { label: 'HC Frozen', emoji: '🚫', color: 'orange' },
  position_cancelled: { label: 'Cancelled', emoji: '❌', color: 'gray' },
  offer_declined: { label: 'Declined Offer', emoji: '🙅', color: 'purple' },
};
