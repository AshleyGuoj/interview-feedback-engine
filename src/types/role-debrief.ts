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
  product_sense: { label: 'Product Sense', labelZh: '产品思维', icon: 'Crosshair' },
  execution: { label: 'Execution', labelZh: '执行力', icon: 'Zap' },
  analytics_metrics: { label: 'Analytics', labelZh: '数据分析', icon: 'BarChart3' },
  communication: { label: 'Communication', labelZh: '沟通表达', icon: 'MessageSquare' },
  technical_depth: { label: 'Technical Depth', labelZh: '技术深度', icon: 'Wrench' },
  AI_skills: { label: 'AI Skills', labelZh: 'AI能力', icon: 'Brain' },
  system_design: { label: 'System Design', labelZh: '系统设计', icon: 'Blocks' },
  business_strategy: { label: 'Strategy', labelZh: '商业战略', icon: 'TrendingUp' },
  leadership: { label: 'Leadership', labelZh: '领导力', icon: 'Crown' },
  stress_resilience: { label: 'Resilience', labelZh: '抗压性', icon: 'Shield' },
};

export const HIRING_LIKELIHOOD_CONFIG = {
  Low: { color: 'border-l-primary/20', icon: 'AlertTriangle' },
  Medium: { color: 'border-l-primary/40', icon: 'HelpCircle' },
  High: { color: 'border-l-primary/70', icon: 'CheckCircle2' },
};
