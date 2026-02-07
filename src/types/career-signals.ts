// Career Signal Timeline Types
// Represents AI-analyzed career events transformed into meaningful signals

export type SignalType = 'strong_signal' | 'medium_signal' | 'weak_signal' | 'turning_point';

export type SignalConfidence = 'high' | 'medium' | 'low';

export type RiskLevel = 'low' | 'medium' | 'high';

export type MomentumState = 'improving' | 'flat' | 'declining';

export interface TimelineItem {
  date: string;
  type: SignalType;
  title: string;
  context: {
    company: string | null;
    role: string | null;
  };
  signalSummary: string;
  whyItMatters: string;
  confidence: SignalConfidence;
}

export interface CareerPattern {
  pattern: string;
  evidence: string;
  riskLevel: RiskLevel;
}

export interface MomentumStatus {
  state: MomentumState;
  explanation: string;
}

export interface CareerSignalTimeline {
  timelinePurpose: string;
  timelineItems: TimelineItem[];
  recentPatterns: CareerPattern[];
  momentumStatus: MomentumStatus;
  coachNote: string;
}

// Signal type display config
export const SIGNAL_TYPE_CONFIG: Record<SignalType, { 
  label: string; 
  labelZh: string; 
  icon: string; 
  color: string;
  bgColor: string;
}> = {
  turning_point: { 
    label: 'Turning Point', 
    labelZh: '转折点', 
    icon: 'star',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  strong_signal: { 
    label: 'Strong Signal', 
    labelZh: '强信号', 
    icon: 'zap',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  medium_signal: { 
    label: 'Medium Signal', 
    labelZh: '中等信号', 
    icon: 'activity',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  weak_signal: { 
    label: 'Weak Signal', 
    labelZh: '弱信号', 
    icon: 'minus',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
};

export const MOMENTUM_CONFIG: Record<MomentumState, {
  label: string;
  labelZh: string;
  icon: string;
  color: string;
}> = {
  improving: { 
    label: 'Improving', 
    labelZh: '上升中', 
    icon: 'trending-up',
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  flat: { 
    label: 'Flat', 
    labelZh: '平稳', 
    icon: 'minus',
    color: 'text-muted-foreground',
  },
  declining: { 
    label: 'Declining', 
    labelZh: '下滑中', 
    icon: 'trending-down',
    color: 'text-red-600 dark:text-red-400',
  },
};

export const RISK_LEVEL_CONFIG: Record<RiskLevel, {
  label: string;
  labelZh: string;
  color: string;
  bgColor: string;
}> = {
  low: { 
    label: 'Low', 
    labelZh: '低', 
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  medium: { 
    label: 'Medium', 
    labelZh: '中', 
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  high: { 
    label: 'High', 
    labelZh: '高', 
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
};
