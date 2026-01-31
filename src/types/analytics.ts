// Types for Analytics / AI Interview Analysis

export interface AnalysisRecord {
  id: string;
  jobId: string;
  stageId: string;
  companyName: string;
  roleTitle: string;
  stageName: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'completed';
  transcript?: string;
  questions: AnalyzedQuestion[];
  reflection?: AnalyzedReflection;
}

export interface AnalyzedQuestion {
  id: string;
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'case' | 'motivation' | 'other';
  myAnswerSummary: string;
  evaluationFocus: string;
  responseQuality: 'high' | 'medium' | 'low';
  qualityReasoning: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
}

export interface AnalyzedReflection {
  overallFeeling: 'great' | 'good' | 'neutral' | 'poor' | 'bad';
  performanceSummary: string;
  whatWentWell: string[];
  whatCouldImprove: string[];
  keyTakeaways: string[];
  interviewerVibe: string;
  companyInsights: string;
}

export interface JobAnalysisGroup {
  jobId: string;
  companyName: string;
  roleTitle: string;
  analyses: AnalysisRecord[];
}
