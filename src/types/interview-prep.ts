export interface JDAnalysis {
  coreResponsibilities: string[];
  keyCompetencies: string[];
  focusAreas: string[];
}

export interface CandidateProfile {
  strengths: string[];
  signatureExperiences: string[];
  potentialWeakPoints: string[];
  likelyChallengeAreas: string[];
}

export interface InterviewPatterns {
  highFrequencyTopics: string[];
  companySpecificPatterns: string[];
}

export interface PredictedQuestion {
  rank: number;
  question: string;
  whyLikely: string;
  skillTested: string;
  sourceReference: "JD" | "Resume" | "Interview Experience" | "Combined";
}

export interface InterviewPrepAnalysis {
  jdAnalysis: JDAnalysis;
  candidateProfile: CandidateProfile;
  interviewPatterns: InterviewPatterns;
  predictedQuestions: PredictedQuestion[];
}

export interface MockInterviewMessage {
  role: "user" | "assistant";
  content: string;
}
