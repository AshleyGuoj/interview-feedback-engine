// Types for Career Growth Intelligence Agent analysis results

export interface CompetencyTrendPoint {
  date: string; // YYYY-MM format
  score: number;
}

export interface CompetencyTrend {
  competency: string;
  scoresOverTime: CompetencyTrendPoint[];
  trend: 'improving' | 'stable' | 'declining';
  delta: number; // Change from first to last score
  stability: 'high' | 'medium' | 'low'; // Performance consistency
  interpretation: string;
}

export interface TurningPoint {
  date: string; // YYYY-MM format
  competency: string;
  change: string; // e.g. "+0.8"
  cause: string;
}

export interface LineChartData {
  competency: string;
  data: Array<{ x: string; y: number }>;
}

export interface RadarChartData {
  pastAverage: Record<string, number>;
  currentAverage: Record<string, number>;
}

export interface BarChartData {
  strengths: Array<{ competency: string; score: number }>;
  gaps: Array<{ competency: string; score: number }>;
}

export interface VisualizationData {
  lineChart: LineChartData[];
  radarChart: RadarChartData;
  barChart: BarChartData;
}

export interface GrowthPriority {
  focusArea: string;
  reason: string;
  expectedImpact: 'high' | 'medium' | 'low';
  urgency: 'high' | 'medium' | 'low';
}

export interface InsightSummary {
  keyImprovements: string[];
  stableAdvantages: string[];
  persistentGaps: string[];
  biggestPositiveChange: string;
  biggestUnresolvedRisk: string;
}

export interface TimelineOverview {
  timeRange: string;
  totalInterviews: number;
  rolesCovered: string[];
}

export interface CareerGrowthAnalysis {
  timelineOverview: TimelineOverview;
  competencyTrends: CompetencyTrend[];
  turningPoints: TurningPoint[];
  visualizationData: VisualizationData;
  insightSummary: InsightSummary;
  nextGrowthPriorities: GrowthPriority[];
  counterfactualInsight: string;
  coachMessage: string;
  generatedAt: string;
}

// Input types for the edge function
export interface RoundDataForGrowthAnalysis {
  roundDate: string;
  jobId: string;
  companyName: string;
  roleTitle: string;
  stageName: string;
  questions: Array<{
    category: string;
    responseQuality: 'high' | 'medium' | 'low';
    difficulty: number;
    tags?: string[];
  }>;
  reflection?: {
    overallFeeling: string;
    whatWentWell: string[];
    whatCouldImprove: string[];
    keyTakeaways: string[];
  };
  competencyScores?: Record<string, number>; // From role debrief if available
}

export interface CareerGrowthRequest {
  rounds: RoundDataForGrowthAnalysis[];
}
