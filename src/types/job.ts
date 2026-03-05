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

// ============================================
// STAGE CATEGORY
// ============================================

export type StageCategory = 'application' | 'resume_screen' | 'assessment' | 'written_test' | 'interview' | 'hr_screen' | 'hr_final' | 'offer_call' | 'offer_received';

// ============================================
// KANBAN COLUMN (derived from stage categories)
// ============================================

export type KanbanColumnType = 'application_assessment' | 'interview' | 'offer_call' | 'offer_received' | 'closed';

// Priority order for deriving which column a job belongs to (higher index = higher priority)
const CATEGORY_PRIORITY: Record<StageCategory, number> = {
  application: 0,
  assessment: 1,
  written_test: 2,
  resume_screen: 3,
  hr_screen: 4,
  interview: 5,
  hr_final: 6,
  offer_call: 7,
  offer_received: 8,
};

// Map stage category to kanban column
function categoryToColumn(category: StageCategory): KanbanColumnType {
  switch (category) {
    case 'application':
    case 'assessment':
    case 'written_test':
      return 'application_assessment';
    case 'resume_screen':
    case 'hr_screen':
      return 'application_assessment';
    case 'interview':
    case 'hr_final':
      return 'interview';
    case 'offer_call':
      return 'offer_call';
    case 'offer_received':
      return 'offer_received';
  }
}

// Active statuses that indicate real progress
const ACTIVE_STATUSES: StageStatus[] = ['scheduled', 'rescheduled', 'completed', 'feedback_pending'];

/**
 * Derive which Kanban column a job belongs to based on its highest-priority active stage category.
 */
export function deriveKanbanColumn(job: Job): KanbanColumnType {
  // If job is explicitly closed, always show in closed column
  if (job.status === 'closed') return 'closed';
  
  // Check if all pipelines are terminal
  if (job.pipelines && job.pipelines.length > 0) {
    const allTerminal = job.pipelines.every(p => 
      p.status === 'closed' || p.status === 'completed' || isPipelineTerminal(p)
    );
    if (allTerminal) return 'closed';
  }
  
  // Get all stages from active pipeline or legacy stages
  const stages = getActiveStages(job);
  
  // Find the highest-priority active stage
  let highestPriority = -1;
  let highestCategory: StageCategory | null = null;
  
  for (const stage of stages) {
    const category = stage.category || detectStageCategory(stage.name);
    const priority = CATEGORY_PRIORITY[category];
    
    // Check if this stage is "active" (has meaningful progress)
    const isActive = ACTIVE_STATUSES.includes(stage.status) || 
                     (stage.status === 'completed' && stage.result !== 'rejected');
    
    if (isActive && priority > highestPriority) {
      highestPriority = priority;
      highestCategory = category;
    }
  }
  
  if (highestCategory) {
    return categoryToColumn(highestCategory);
  }
  
  // Default: application/assessment
  return 'application_assessment';
}

export const KANBAN_COLUMN_CONFIG: Record<KanbanColumnType, { labelKey: string; labelZhKey: string; color: string; icon: string }> = {
  application_assessment: { labelKey: 'jobs.colApplicationAssessment', labelZhKey: '投递/筛选', color: 'bg-blue-500/60', icon: 'file-text' },
  interview:              { labelKey: 'jobs.colInterview',            labelZhKey: '面试',      color: 'bg-amber-500/70', icon: 'mic' },
  offer_call:             { labelKey: 'jobs.colOfferCall',           labelZhKey: 'Offer沟通',  color: 'bg-green-500/60', icon: 'phone-call' },
  offer_received:         { labelKey: 'jobs.colOfferReceived',       labelZhKey: '收到Offer',  color: 'bg-emerald-500/70', icon: 'gift' },
  closed:                 { labelKey: 'jobs.colClosed',              labelZhKey: '已关闭',     color: 'bg-muted-foreground/40', icon: 'archive' },
};

export const KANBAN_COLUMNS: KanbanColumnType[] = ['application_assessment', 'interview', 'offer_call', 'offer_received', 'closed'];

export const STAGE_CATEGORY_CONFIG: Record<StageCategory, { label: string; labelZh: string; icon: string; color: string }> = {
  application:    { label: 'Application',      labelZh: '投递',        icon: 'file-text',       color: 'blue' },
  resume_screen:  { label: 'Resume Screen',    labelZh: '简历筛选',     icon: 'file-search',     color: 'cyan' },
  assessment:     { label: 'Assessment',       labelZh: '测评',        icon: 'clipboard-check', color: 'purple' },
  written_test:   { label: 'Written Test',     labelZh: '笔试',        icon: 'pen-line',        color: 'indigo' },
  interview:      { label: 'Interview',        labelZh: '面试',        icon: 'mic',             color: 'amber' },
  hr_screen:      { label: 'HR Screen',        labelZh: 'HR初筛',      icon: 'user-search',     color: 'cyan' },
  hr_final:       { label: 'HR Final / Salary',labelZh: 'HR谈薪',      icon: 'message-circle',  color: 'purple' },
  offer_call:     { label: 'Offer Call',       labelZh: 'Offer沟通',   icon: 'phone-call',      color: 'green' },
  offer_received: { label: 'Offer Received',   labelZh: '收到Offer',   icon: 'gift',            color: 'emerald' },
};

// Auto-detect stage category from name
export function detectStageCategory(name: string): StageCategory {
  const lower = name.toLowerCase().trim();
  if (['applied', '投递', '已申请', '已投递'].some(kw => lower === kw || lower.includes(kw))) return 'application';
  if (['简历筛选', 'resume screen', 'resume review', '简历审核'].some(kw => lower.includes(kw))) return 'resume_screen';
  if (['笔试', 'written test', 'written exam'].some(kw => lower.includes(kw))) return 'written_test';
  if (['oa', 'assessment', 'test', 'take-home', 'takehome', '测评', 'coding challenge', 'online assessment'].some(kw => lower.includes(kw))) return 'assessment';
  if (['offer received', '收到offer', 'offer letter'].some(kw => lower.includes(kw))) return 'offer_received';
  if (['offer', 'offer call', 'offer沟通'].some(kw => lower.includes(kw))) return 'offer_call';
  // HR final: salary/negotiation related, or explicitly "hr final"
  if (['谈薪', 'salary', 'compensation', 'negotiat', 'hr final', 'hr谈薪', '谈心'].some(kw => lower.includes(kw))) return 'hr_final';
  // HR screen: early HR contact, recruiter call
  if (['hr初筛', 'hr screen', 'recruiter call', 'recruiter screen'].some(kw => lower.includes(kw))) return 'hr_screen';
  // Legacy hr_chat fallback: generic "hr" or "recruiter" → hr_screen (early stage default)
  if (['hr', 'recruiter', '人事'].some(kw => lower.includes(kw))) return 'hr_screen';
  if (['screen', '筛选'].some(kw => lower.includes(kw))) return 'resume_screen';
  return 'interview';
}

// Layer 1: Interview Stage (customizable timeline)
export interface InterviewStage {
  id: string;
  name: string;              // Customizable: "HR Screen", "Technical", etc.
  category?: StageCategory;  // Standardized type tag
  order?: number;            // For drag-and-drop reordering
  
  // Two-dimensional state
  status: StageStatus;       // Behavioral: what's happening
  result?: StageResult;      // Decision: what was the outcome (only after completed)
  
  // Completion tracking
  completedAt?: string;        // ISO timestamp when marked completed
  
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

// Sub-categories within the application_assessment column for filtering
export type ApplicationAssessmentFilter = 'application' | 'resume_screen' | 'assessment' | 'written_test';

export const APPLICATION_ASSESSMENT_FILTERS: ApplicationAssessmentFilter[] = ['application', 'resume_screen', 'assessment', 'written_test'];

export const APPLICATION_ASSESSMENT_FILTER_CONFIG: Record<ApplicationAssessmentFilter, { labelKey: string }> = {
  application:    { labelKey: 'jobs.filterApplication' },
  resume_screen:  { labelKey: 'jobs.filterResumeScreen' },
  assessment:     { labelKey: 'jobs.filterAssessment' },
  written_test:   { labelKey: 'jobs.filterWrittenTest' },
};

/**
 * Derive the specific sub-category for a job within the application_assessment column.
 * Returns the highest-priority active category that maps to this column.
 */
export function deriveApplicationSubCategory(job: Job): ApplicationAssessmentFilter {
  const stages = getActiveStages(job);
  
  // Find the frontier stage: first stage that isn't fully passed
  for (const stage of stages) {
    const category = stage.category || detectStageCategory(stage.name);
    
    // Skip stages that are fully passed (completed + passed)
    if (stage.status === 'completed' && stage.result === 'passed') continue;
    // Skip skipped/withdrawn stages
    if (stage.status === 'skipped' || stage.status === 'withdrawn') continue;
    
    // This is the current frontier stage
    const columnCategories = ['application', 'resume_screen', 'assessment', 'written_test', 'hr_screen'];
    if (columnCategories.includes(category)) {
      return (category === 'hr_screen' ? 'resume_screen' : category) as ApplicationAssessmentFilter;
    }
    
    // Frontier is outside this column's scope → default to application
    return 'application';
  }
  
  return 'application';
}

// Sub-categories within the interview column for filtering
export type InterviewFilter = 'all_interview' | 'round_1' | 'round_2' | 'hr_round';

export const INTERVIEW_FILTERS: InterviewFilter[] = ['all_interview', 'round_1', 'round_2', 'hr_round'];

export const INTERVIEW_FILTER_CONFIG: Record<InterviewFilter, { labelKey: string }> = {
  all_interview: { labelKey: 'jobs.filterAllInterview' },
  round_1:       { labelKey: 'jobs.filterRound1' },
  round_2:       { labelKey: 'jobs.filterRound2' },
  hr_round:      { labelKey: 'jobs.filterHRRound' },
};

/**
 * Derive which interview sub-filter a job belongs to.
 * Finds the frontier interview stage (first non-passed interview).
 */
export function deriveInterviewSubCategory(job: Job): InterviewFilter {
  const stages = getActiveStages(job);
  let interviewIndex = 0;
  
  for (const stage of stages) {
    const category = stage.category || detectStageCategory(stage.name);
    if (category !== 'interview' && category !== 'hr_final') continue;
    
    // Skip fully passed stages
    if (stage.status === 'completed' && stage.result === 'passed') {
      if (category === 'interview') interviewIndex++;
      continue;
    }
    if (stage.status === 'skipped' || stage.status === 'withdrawn') {
      if (category === 'interview') interviewIndex++;
      continue;
    }
    
    // This is the frontier interview stage
    if (category === 'hr_final') return 'hr_round';
    if (interviewIndex === 0) return 'round_1';
    if (interviewIndex === 1) return 'round_2';
    return 'round_2'; // 3rd+ rounds grouped with round_2
  }
  
  return 'round_1';
}

// Helper: Get all stages from active pipeline
export function getActiveStages(job: Job): InterviewStage[] {
  const pipeline = getActivePipeline(job);
  return pipeline?.stages || job.stages || [];
}

export const DEFAULT_STAGES: Omit<InterviewStage, 'id'>[] = [
  { name: 'Applied', status: 'completed', result: 'passed', category: 'application' },
  { name: 'HR Screen', status: 'pending', category: 'hr_screen' },
  { name: 'Round 1', status: 'pending', category: 'interview' },
  { name: 'Round 2', status: 'pending', category: 'interview' },
  { name: 'Final Round', status: 'pending', category: 'interview' },
  { name: 'Offer Discussion', status: 'pending', category: 'offer_call' },
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
