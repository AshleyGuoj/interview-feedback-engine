export type JobStatus = 'applied' | 'interviewing' | 'offer' | 'closed';

export type InterviewFormat = 'phone' | 'zoom' | 'onsite';

export type JobSource = 'linkedin' | 'boss' | 'referral' | 'website' | 'other';

export interface InterviewStage {
  id: string;
  name: string;
  status: 'upcoming' | 'completed' | 'skipped';
  date?: string;
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
}

export const DEFAULT_STAGES: Omit<InterviewStage, 'id'>[] = [
  { name: 'Applied', status: 'completed' },
  { name: 'HR Screen', status: 'upcoming' },
  { name: 'Round 1', status: 'upcoming' },
  { name: 'Round 2', status: 'upcoming' },
  { name: 'Final Round', status: 'upcoming' },
  { name: 'Offer Discussion', status: 'upcoming' },
];
