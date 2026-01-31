// ==========================================
// Interview Pipeline Types
// Comprehensive hiring workflow for China-based recruitment
// ==========================================

// Sub-status for each stage
export type SubStatus = 
  // Application
  | 'applied' | 'resume_under_review' | 'resume_passed' | 'resume_rejected' | 'resume_on_hold'
  // HR Screening
  | 'hr_screen_scheduled' | 'hr_screen_completed' | 'salary_collected' | 'availability_confirmed' | 'hr_screen_passed' | 'hr_screen_failed'
  // Interview Rounds
  | 'scheduled' | 'completed' | 'feedback_pending' | 'passed' | 'failed'
  // Assessment
  | 'submitted' | 'reviewed' | 'assessment_passed' | 'assessment_failed'
  // Final Decision
  | 'final_interview' | 'hm_approval_pending' | 'dept_approval_pending' | 'exec_review_pending' | 'hc_budget_pending' | 'under_comparison'
  // Offer
  | 'offer_discussion' | 'offer_approval_in_progress' | 'offer_sent' | 'offer_accepted' | 'offer_declined' | 'offer_withdrawn'
  // Pre-onboarding
  | 'background_check' | 'medical_check' | 'verification_failed'
  // Onboarding
  | 'onboarding_scheduled' | 'joined' | 'entry_delayed' | 'no_show'
  // Closed States
  | 'rejected_company' | 'withdrawn_candidate' | 'position_cancelled' | 'hc_frozen' | 'future_talent_pool';

// Stage status (main)
export type StageStatus = 'completed' | 'in_progress' | 'upcoming' | 'on_hold' | 'failed';

// Stage owner types
export type StageOwner = 'hr' | 'hiring_manager' | 'interviewer' | 'executive' | 'candidate' | 'recruiter';

// Risk tag types
export type RiskTag = 'hc_risk' | 'budget_pending' | 'timeline_delay' | 'competing_offer' | 'relocation_risk' | 'visa_risk' | 'salary_gap' | 'notice_period';

// Interview round types
export type InterviewRoundType = 'business' | 'technical' | 'product' | 'cross_team' | 'deep_dive' | 'panel' | 'ad_hoc' | 'culture_fit';

// Assessment types
export type AssessmentType = 'online_test' | 'take_home' | 'case_presentation' | 'coding_challenge' | 'design_exercise';

// Stage category
export type StageCategory = 
  | 'application' 
  | 'hr_screening' 
  | 'interview_round' 
  | 'assessment' 
  | 'final_decision' 
  | 'offer' 
  | 'pre_onboarding' 
  | 'onboarding' 
  | 'closed';

// Sub-status configuration for display
export interface SubStatusConfig {
  id: SubStatus;
  label: string;
  labelZh: string;
  isTerminal?: boolean; // Whether this ends the stage
  isPositive?: boolean; // Positive outcome
  isNegative?: boolean; // Negative outcome
}

// Stage configuration
export interface StageConfig {
  category: StageCategory;
  label: string;
  labelZh: string;
  subStatuses: SubStatusConfig[];
  allowMultiple?: boolean; // For interview rounds
  icon?: string;
}

// Interview feedback
export interface InterviewFeedback {
  interviewerId: string;
  interviewerName: string;
  interviewerTitle?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  recommendation: 'strong_hire' | 'hire' | 'neutral' | 'no_hire' | 'strong_no_hire';
  strengths: string[];
  concerns: string[];
  notes: string;
  submittedAt: string;
}

// Timezone-aware scheduling
export interface ScheduledEvent {
  dateTime: string; // ISO string
  timezone: string; // e.g., 'Asia/Shanghai', 'America/New_York'
  duration?: number; // minutes
  location?: string;
  meetingLink?: string;
  conferenceRoom?: string;
}

// Pipeline Stage (main stage with sub-statuses)
export interface PipelineStage {
  id: string;
  category: StageCategory;
  name: string;
  nameZh?: string;
  status: StageStatus;
  subStatus?: SubStatus;
  owner?: StageOwner;
  ownerName?: string;
  
  // Timing
  scheduledEvent?: ScheduledEvent;
  completedAt?: string;
  deadline?: ScheduledEvent;
  
  // For interview rounds
  roundType?: InterviewRoundType;
  roundNumber?: number;
  
  // For assessments
  assessmentType?: AssessmentType;
  
  // Content
  notes?: string;
  feedback?: InterviewFeedback[];
  riskTags?: RiskTag[];
  
  // Metadata
  order: number;
  isConfigurable?: boolean;
  isRequired?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Candidate for the pipeline
export interface PipelineCandidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  currentCompany?: string;
  currentTitle?: string;
  yearsOfExperience?: number;
  salaryExpectation?: {
    min: number;
    max: number;
    currency: 'CNY' | 'USD';
  };
  noticePeriod?: string;
  preferredStartDate?: string;
  resumeUrl?: string;
  linkedInUrl?: string;
  source: 'linkedin' | 'boss' | 'liepin' | 'zhilian' | 'referral' | 'headhunter' | 'campus' | 'other';
  referrerName?: string;
  tags?: string[];
}

// Full interview pipeline for a job application
export interface InterviewPipeline {
  id: string;
  jobId: string;
  candidateId: string;
  candidate: PipelineCandidate;
  
  // Position info
  companyName: string;
  roleTitle: string;
  department?: string;
  location: 'CN' | 'US' | 'Remote' | 'Other';
  
  // Pipeline state
  stages: PipelineStage[];
  currentStageId?: string;
  overallStatus: 'active' | 'on_hold' | 'closed_positive' | 'closed_negative';
  
  // Risk assessment
  globalRiskTags?: RiskTag[];
  
  // Analytics
  daysInPipeline?: number;
  conversionProbability?: number;
  
  // Timestamps
  appliedAt: string;
  lastActivityAt: string;
  closedAt?: string;
  closedReason?: string;
  
  // Metadata
  createdBy: string;
  assignedRecruiter?: string;
  assignedHM?: string;
}

// Default stage configurations
export const DEFAULT_STAGE_CONFIGS: StageConfig[] = [
  {
    category: 'application',
    label: 'Application',
    labelZh: '申请',
    subStatuses: [
      { id: 'applied', label: 'Applied', labelZh: '已申请' },
      { id: 'resume_under_review', label: 'Resume Under Review', labelZh: '简历审核中' },
      { id: 'resume_passed', label: 'Resume Passed', labelZh: '简历通过', isPositive: true },
      { id: 'resume_rejected', label: 'Resume Rejected', labelZh: '简历未通过', isNegative: true, isTerminal: true },
      { id: 'resume_on_hold', label: 'Resume On Hold', labelZh: '简历待定' },
    ],
  },
  {
    category: 'hr_screening',
    label: 'HR Screening',
    labelZh: 'HR筛选',
    subStatuses: [
      { id: 'hr_screen_scheduled', label: 'HR Screen Scheduled', labelZh: 'HR面谈已安排' },
      { id: 'hr_screen_completed', label: 'HR Screen Completed', labelZh: 'HR面谈已完成' },
      { id: 'salary_collected', label: 'Salary Expectation Collected', labelZh: '薪资期望已确认' },
      { id: 'availability_confirmed', label: 'Availability Confirmed', labelZh: '到岗时间已确认' },
      { id: 'hr_screen_passed', label: 'HR Screen Passed', labelZh: 'HR筛选通过', isPositive: true },
      { id: 'hr_screen_failed', label: 'HR Screen Failed', labelZh: 'HR筛选未通过', isNegative: true, isTerminal: true },
    ],
  },
  {
    category: 'interview_round',
    label: 'Interview Round',
    labelZh: '面试',
    allowMultiple: true,
    subStatuses: [
      { id: 'scheduled', label: 'Scheduled', labelZh: '已安排' },
      { id: 'completed', label: 'Completed', labelZh: '已完成' },
      { id: 'feedback_pending', label: 'Feedback Pending', labelZh: '反馈待提交' },
      { id: 'passed', label: 'Passed', labelZh: '通过', isPositive: true },
      { id: 'failed', label: 'Failed', labelZh: '未通过', isNegative: true, isTerminal: true },
    ],
  },
  {
    category: 'assessment',
    label: 'Assessment',
    labelZh: '测评',
    allowMultiple: true,
    subStatuses: [
      { id: 'scheduled', label: 'Scheduled', labelZh: '已安排' },
      { id: 'submitted', label: 'Submitted', labelZh: '已提交' },
      { id: 'reviewed', label: 'Reviewed', labelZh: '已评审' },
      { id: 'assessment_passed', label: 'Passed', labelZh: '通过', isPositive: true },
      { id: 'assessment_failed', label: 'Failed', labelZh: '未通过', isNegative: true, isTerminal: true },
    ],
  },
  {
    category: 'final_decision',
    label: 'Final Decision',
    labelZh: '终审',
    subStatuses: [
      { id: 'final_interview', label: 'Final Interview', labelZh: '终面' },
      { id: 'hm_approval_pending', label: 'Hiring Manager Approval Pending', labelZh: '用人经理审批中' },
      { id: 'dept_approval_pending', label: 'Department Approval Pending', labelZh: '部门审批中' },
      { id: 'exec_review_pending', label: 'Executive Review Pending', labelZh: '高管审批中' },
      { id: 'hc_budget_pending', label: 'HC/Budget Approval Pending', labelZh: 'HC/预算审批中' },
      { id: 'under_comparison', label: 'Candidate Under Comparison', labelZh: '候选人比较中' },
    ],
  },
  {
    category: 'offer',
    label: 'Offer',
    labelZh: 'Offer',
    subStatuses: [
      { id: 'offer_discussion', label: 'Offer Discussion', labelZh: 'Offer沟通' },
      { id: 'offer_approval_in_progress', label: 'Offer Approval In Progress', labelZh: 'Offer审批中' },
      { id: 'offer_sent', label: 'Offer Sent', labelZh: 'Offer已发' },
      { id: 'offer_accepted', label: 'Offer Accepted', labelZh: 'Offer已接受', isPositive: true },
      { id: 'offer_declined', label: 'Offer Declined', labelZh: 'Offer被拒', isNegative: true, isTerminal: true },
      { id: 'offer_withdrawn', label: 'Offer Withdrawn', labelZh: 'Offer撤回', isNegative: true, isTerminal: true },
    ],
  },
  {
    category: 'pre_onboarding',
    label: 'Pre-onboarding',
    labelZh: '入职前准备',
    subStatuses: [
      { id: 'background_check', label: 'Background Check', labelZh: '背景调查' },
      { id: 'medical_check', label: 'Medical Check', labelZh: '体检' },
      { id: 'verification_failed', label: 'Verification Failed', labelZh: '核查未通过', isNegative: true, isTerminal: true },
    ],
  },
  {
    category: 'onboarding',
    label: 'Onboarding',
    labelZh: '入职',
    subStatuses: [
      { id: 'onboarding_scheduled', label: 'Onboarding Scheduled', labelZh: '入职日期已确定' },
      { id: 'joined', label: 'Joined', labelZh: '已入职', isPositive: true, isTerminal: true },
      { id: 'entry_delayed', label: 'Entry Delayed', labelZh: '入职延期' },
      { id: 'no_show', label: 'No-show', labelZh: '未报到', isNegative: true, isTerminal: true },
    ],
  },
  {
    category: 'closed',
    label: 'Closed',
    labelZh: '关闭',
    subStatuses: [
      { id: 'rejected_company', label: 'Rejected (Company)', labelZh: '公司拒绝', isNegative: true, isTerminal: true },
      { id: 'withdrawn_candidate', label: 'Withdrawn (Candidate)', labelZh: '候选人放弃', isNegative: true, isTerminal: true },
      { id: 'position_cancelled', label: 'Position Cancelled', labelZh: '职位取消', isNegative: true, isTerminal: true },
      { id: 'hc_frozen', label: 'HC Frozen', labelZh: 'HC冻结', isNegative: true, isTerminal: true },
      { id: 'future_talent_pool', label: 'Future Talent Pool', labelZh: '人才库', isPositive: true, isTerminal: true },
    ],
  },
];

// Risk tag display config
export const RISK_TAG_CONFIG: Record<RiskTag, { label: string; labelZh: string; color: string }> = {
  hc_risk: { label: 'HC Risk', labelZh: 'HC风险', color: 'red' },
  budget_pending: { label: 'Budget Pending', labelZh: '预算待定', color: 'orange' },
  timeline_delay: { label: 'Timeline Delay', labelZh: '进度延迟', color: 'yellow' },
  competing_offer: { label: 'Competing Offer', labelZh: '竞争Offer', color: 'purple' },
  relocation_risk: { label: 'Relocation Risk', labelZh: '搬迁风险', color: 'blue' },
  visa_risk: { label: 'Visa Risk', labelZh: '签证风险', color: 'pink' },
  salary_gap: { label: 'Salary Gap', labelZh: '薪资差距', color: 'amber' },
  notice_period: { label: 'Long Notice', labelZh: '离职期长', color: 'slate' },
};

// Stage owner display config
export const OWNER_CONFIG: Record<StageOwner, { label: string; labelZh: string; color: string }> = {
  hr: { label: 'HR', labelZh: 'HR', color: 'blue' },
  hiring_manager: { label: 'Hiring Manager', labelZh: '用人经理', color: 'green' },
  interviewer: { label: 'Interviewer', labelZh: '面试官', color: 'purple' },
  executive: { label: 'Executive', labelZh: '高管', color: 'amber' },
  candidate: { label: 'Candidate', labelZh: '候选人', color: 'gray' },
  recruiter: { label: 'Recruiter', labelZh: '招聘官', color: 'teal' },
};

// Stage status display config
export const STATUS_CONFIG: Record<StageStatus, { label: string; labelZh: string; color: string; bgColor: string }> = {
  completed: { label: 'Completed', labelZh: '已完成', color: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  in_progress: { label: 'In Progress', labelZh: '进行中', color: 'text-blue-700 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  upcoming: { label: 'Upcoming', labelZh: '待开始', color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  on_hold: { label: 'On Hold', labelZh: '暂停', color: 'text-orange-700 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  failed: { label: 'Failed', labelZh: '未通过', color: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30' },
};

// Interview round type display config
export const ROUND_TYPE_CONFIG: Record<InterviewRoundType, { label: string; labelZh: string }> = {
  business: { label: 'Business', labelZh: '业务面' },
  technical: { label: 'Technical', labelZh: '技术面' },
  product: { label: 'Product', labelZh: '产品面' },
  cross_team: { label: 'Cross-team', labelZh: '交叉面' },
  deep_dive: { label: 'Deep Dive', labelZh: '深度面' },
  panel: { label: 'Panel', labelZh: '群面' },
  ad_hoc: { label: 'Additional', labelZh: '加面' },
  culture_fit: { label: 'Culture Fit', labelZh: '文化面' },
};
