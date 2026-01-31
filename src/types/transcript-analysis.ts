// Types for AI transcript analysis results

export interface ExtractedQuestion {
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'case' | 'motivation' | 'other';
  myAnswerSummary: string;
  evaluationFocus: string;
  responseQuality: 'high' | 'medium' | 'low';
  qualityReasoning: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
}

export interface ExtractedReflection {
  overallFeeling: 'great' | 'good' | 'neutral' | 'poor' | 'bad';
  performanceSummary: string;
  whatWentWell: string[];
  whatCouldImprove: string[];
  keyTakeaways: string[];
  interviewerVibe: string;
  companyInsights: string;
}

export interface TranscriptAnalysisResult {
  questions: ExtractedQuestion[];
  reflection: ExtractedReflection;
  metadata: {
    totalQuestions: number;
    dominantCategory: string;
    overallDifficulty: string;
    languageDetected: string;
  };
}

export interface TranscriptAnalysisContext {
  company?: string;
  role?: string;
  stage?: string;
}
