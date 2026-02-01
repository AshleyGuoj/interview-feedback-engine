// Types for Role Debrief (Layer 2 aggregation)

export interface InterviewerMappingRow {
  roundId: string;
  roundName: string;
  interviewerBackground: string;
  focusDimensions: string[];
  highlight: string;
  risk: string;
}

export interface CompetencyScore {
  score: number; // 1-5
  evidence: string;
}

export interface CompetencyHeatmap {
  product_sense: CompetencyScore;
  execution: CompetencyScore;
  analytics_metrics: CompetencyScore;
  communication: CompetencyScore;
  technical_depth: CompetencyScore;
  AI_skills: CompetencyScore;
  system_design: CompetencyScore;
  business_strategy: CompetencyScore;
  leadership: CompetencyScore;
  stress_resilience: CompetencyScore;
}

export type CompetencyKey = keyof CompetencyHeatmap;

export interface KeyInsights {
  careMost: string[];
  strengths: string[];
  risks: string[];
}

export interface HiringLikelihood {
  level: 'Low' | 'Medium' | 'High';
  confidence: number; // 0-1
  reasons: string[];
}

export interface NextAction {
  action: string;
  priority: 'high' | 'medium' | 'low';
  targetGap: string;
}

export interface RoleDebrief {
  jobId: string;
  companyName: string;
  roleTitle: string;
  generatedAt: string;
  sourceRoundIds: string[];
  roundCount: number;
  
  interviewerMapping: InterviewerMappingRow[];
  competencyHeatmap: CompetencyHeatmap;
  keyInsights: KeyInsights;
  hiringLikelihood: HiringLikelihood;
  nextBestActions: NextAction[];
  roleSummary: string;
}

// Display configuration for competencies
export const COMPETENCY_CONFIG: Record<CompetencyKey, { label: string; labelZh: string; icon: string }> = {
  product_sense: { label: 'Product Sense', labelZh: '产品思维', icon: '🎯' },
  execution: { label: 'Execution', labelZh: '执行力', icon: '⚡' },
  analytics_metrics: { label: 'Analytics', labelZh: '数据分析', icon: '📊' },
  communication: { label: 'Communication', labelZh: '沟通表达', icon: '💬' },
  technical_depth: { label: 'Technical Depth', labelZh: '技术深度', icon: '🔧' },
  AI_skills: { label: 'AI Skills', labelZh: 'AI能力', icon: '🤖' },
  system_design: { label: 'System Design', labelZh: '系统设计', icon: '🏗️' },
  business_strategy: { label: 'Strategy', labelZh: '商业战略', icon: '📈' },
  leadership: { label: 'Leadership', labelZh: '领导力', icon: '👑' },
  stress_resilience: { label: 'Resilience', labelZh: '抗压性', icon: '💪' },
};

export const HIRING_LIKELIHOOD_CONFIG = {
  Low: { color: 'text-red-600 bg-red-50 border-red-200', emoji: '⚠️' },
  Medium: { color: 'text-amber-600 bg-amber-50 border-amber-200', emoji: '🤔' },
  High: { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', emoji: '🎉' },
};
