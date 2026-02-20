// Job types and utilities
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
  // AI-extracted fields (saved from transcript analysis)
  responseQuality?: 'high' | 'medium' | 'low';
  evaluationFocus?: string;
  qualityReasoning?: string;
}

// Self-reflection after interview
export interface InterviewReflection {
  overallFeeling: 'great' | 'good' | 'neutral' | 'poor' | 'bad';
  performanceSummary?: string;   // 总体评价（AI 提取）
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

// ============================================
// TWO-DIMENSIONAL MODEL: Stage + Status + Result
// ============================================

// Layer 2A: Behavioral Status (what's happening with this stage)
// This is system-controlled, not user-customizable
export type StageStatus = 
  | 'pending'           // 待进行
  | 'scheduled'         // 已安排  
  | 'rescheduled'       // 已改期
  | 'completed'         // 已完成
  | 'feedback_pending'  // 等待反馈 ⭐ Key pain point!
  | 'skipped'           // 跳过
  | 'withdrawn';        // 候选人退出

// Layer 2B: Decision Result (what was the outcome)
// Only applicable after stage is completed
export type StageResult = 
  | 'passed'            // 通过本轮
  | 'rejected'          // 未通过
  | 'on_hold'           // HC冻结/组织调整
  | 'mixed_feedback'    // 意见不统一
  | null;               // No result yet

// Status display config - using Lucide icon names
export const STAGE_STATUS_CONFIG: Record<StageStatus, { label: string; labelZh: string; icon: string; color: string }> = {
  pending: { label: 'Pending', labelZh: '待进行', icon: 'circle-dashed', color: 'gray' },
  scheduled: { label: 'Scheduled', labelZh: '已安排', icon: 'calendar-check', color: 'blue' },
  rescheduled: { label: 'Rescheduled', labelZh: '已改期', icon: 'calendar-clock', color: 'orange' },
  completed: { label: 'Completed', labelZh: '已完成', icon: 'check-circle-2', color: 'green' },
  feedback_pending: { label: 'Feedback Pending', labelZh: '等反馈', icon: 'clock', color: 'amber' },
  skipped: { label: 'Skipped', labelZh: '已跳过', icon: 'skip-forward', color: 'gray' },
  withdrawn: { label: 'Withdrawn', labelZh: '已撤回', icon: 'undo-2', color: 'gray' },
};

// Result display config - using Lucide icon names
export const STAGE_RESULT_CONFIG: Record<NonNullable<StageResult>, { label: string; labelZh: string; icon: string; color: string }> = {
  passed: { label: 'Passed', labelZh: '通过', icon: 'trophy', color: 'green' },
  rejected: { label: 'Rejected', labelZh: '未通过', icon: 'x-circle', color: 'red' },
  on_hold: { label: 'On Hold', labelZh: 'HC冻结', icon: 'snowflake', color: 'cyan' },
  mixed_feedback: { label: 'Mixed Feedback', labelZh: '意见不一', icon: 'scale', color: 'amber' },
};

// Layer 1: Interview Stage (customizable timeline)
export interface InterviewStage {
  id: string;
  name: string;              // Customizable: "HR Screen", "Technical", etc.
  order?: number;            // For drag-and-drop reordering
  
  // Two-dimensional state
  status: StageStatus;       // Behavioral: what's happening
  result?: StageResult;      // Decision: what was the outcome (only after completed)
  
  // Scheduling
  scheduledTime?: string;
  scheduledTimezone?: string;
  deadline?: string;
  deadlineTimezone?: string;
  date?: string;
  
  // Interview details
  interviewer?: string;
  feedbackScore?: number;    // 1-5 rating if available
  
  // Content for knowledge base
  questions?: InterviewQuestion[];
  reflection?: InterviewReflection;
  storiesUsed?: string[];
  
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

// ============================================
// PIPELINE BRANCH ARCHITECTURE
// Supports HC Freeze -> Transfer, Multi-role, etc.
// ============================================

export type PipelineType = 'primary' | 'transfer' | 'internal_move' | 'reapply';

export type PipelineStatus = 'active' | 'paused' | 'completed' | 'closed';

export interface Pipeline {
  id: string;
  type: PipelineType;
  status: PipelineStatus;
  targetRole: string;              // Role title for this specific pipeline
  originPipelineId?: string;       // For transfer: which pipeline did this branch from
  transferReason?: 'hc_freeze' | 'better_fit' | 'team_change' | 'reorg';
  stages: InterviewStage[];
  createdAt: string;
  closedAt?: string;
  closedReason?: ClosedReason;
}

export interface Job {
  id: string;
  companyName: string;
  roleTitle: string;               // Current active role (synced from active pipeline)
  location: 'CN' | 'US' | 'Remote' | 'Other';
  status: JobStatus;
  jobLink?: string;
  source: JobSource;
  interestLevel: 1 | 2 | 3 | 4 | 5;
  careerFitNotes?: string;
  currentStage?: string;
  nextAction?: string;
  
  // NEW: Multi-pipeline architecture
  pipelines: Pipeline[];
  
  // Legacy: single stages array (for backward compatibility during migration)
  stages: InterviewStage[];
  
  createdAt: string;
  updatedAt: string;
  
  // Enhanced tracking fields
  subStatus?: InterviewingSubStatus | OfferSubStatus;
  closedReason?: ClosedReason;
  riskTags?: RiskTag[];
  lastContactDate?: string;
}

// Helper: Check if a pipeline has terminal stages (rejected/withdrawn)
export function isPipelineTerminal(pipeline: Pipeline): boolean {
  return pipeline.stages.some(stage => 
    stage.result === 'rejected' || stage.status === 'withdrawn'
  );
}

// Helper: Get active pipeline from job
export function getActivePipeline(job: Job): Pipeline | null {
  if (!job.pipelines || job.pipelines.length === 0) {
    // Backward compatibility: convert stages to pipeline
    if (job.stages && job.stages.length > 0) {
      const legacyPipeline: Pipeline = {
        id: 'legacy-primary',
        type: 'primary',
        status: 'active',
        targetRole: job.roleTitle,
        stages: job.stages,
        createdAt: job.createdAt,
      };
      // Check if legacy pipeline is terminal
      if (isPipelineTerminal(legacyPipeline)) {
        return legacyPipeline; // Return it but mark as terminal for resolver
      }
      return legacyPipeline;
    }
    return null;
  }
  
  // Priority: newest non-terminal active/paused pipeline
  // A pipeline is considered non-active if:
  // 1. status is 'closed' or 'completed', OR
  // 2. It has terminal stages (rejected/withdrawn)
  const activePipelines = job.pipelines
    .filter(p => {
      // Explicit closed/completed status
      if (p.status === 'closed' || p.status === 'completed') return false;
      // Check for terminal stages
      if (isPipelineTerminal(p)) return false;
      return p.status === 'active' || p.status === 'paused';
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // If no truly active pipelines, return the newest one for display purposes
  if (activePipelines.length === 0) {
    return job.pipelines
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;
  }
  
  return activePipelines[0];
}

// Helper: Get all stages from active pipeline
export function getActiveStages(job: Job): InterviewStage[] {
  const pipeline = getActivePipeline(job);
  return pipeline?.stages || job.stages || [];
}

export const DEFAULT_STAGES: Omit<InterviewStage, 'id'>[] = [
  { name: 'Applied', status: 'completed', result: 'passed' },
  { name: 'HR Screen', status: 'pending' },
  { name: 'Round 1', status: 'pending' },
  { name: 'Round 2', status: 'pending' },
  { name: 'Final Round', status: 'pending' },
  { name: 'Offer Discussion', status: 'pending' },
];

// Question categories for display
export const QUESTION_CATEGORIES: Record<string, { label: string; labelEn: string; color: string }> = {
  behavioral: { label: '行为面试', labelEn: 'Behavioral', color: 'blue' },
  technical: { label: '技术问题', labelEn: 'Technical', color: 'purple' },
  situational: { label: '情景问题', labelEn: 'Situational', color: 'green' },
  case: { label: '案例分析', labelEn: 'Case Study', color: 'orange' },
  motivation: { label: '动机问题', labelEn: 'Motivation', color: 'pink' },
  product: { label: '产品问题', labelEn: 'Product', color: 'blue' },
  experience: { label: '经验问题', labelEn: 'Experience', color: 'green' },
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
