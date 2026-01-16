export interface InterviewInput {
  company: string;
  role: string;
  round: string;
  interviewDate: string;
  interviewType: string[];
  interviewContent: string;
  jobDescription: string;
  resume: string;
}

export type SignalStrength = "Strong" | "Medium" | "Weak";

export interface AnalysisResult {
  overview: {
    company: string;
    role: string;
    round: string;
    interviewFocus: string;
    signalStrength: SignalStrength;
  };
  keyStrengths: string[];
  keyRisksAndGaps: string[];
  alignmentNotes: {
    whatWorked: string[];
    underusedOrMissing: string[];
    repositioningAdvice: string[];
  };
  nextRoundPreparation: {
    likelyQuestionAreas: string[];
    preparationChecklist: string[];
    recommendedStories: string[];
  };
  reusableInsights: {
    companyPreferences: string[];
    lessonsForFuture: string[];
  };
}
