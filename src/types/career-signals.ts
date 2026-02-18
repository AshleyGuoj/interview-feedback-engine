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

// Signal type display config — muted, restrained palette
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
    color: 'text-foreground',
    bgColor: 'surface-insight',
  },
  strong_signal: { 
    label: 'Strong Signal', 
    labelZh: '强信号', 
    icon: 'zap',
    color: 'text-primary',
    bgColor: 'bg-primary/8',
  },
  medium_signal: { 
    label: 'Medium Signal', 
    labelZh: '中等信号', 
    icon: 'activity',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/60',
  },
  weak_signal: { 
    label: 'Weak Signal', 
    labelZh: '弱信号', 
    icon: 'minus',
    color: 'text-muted-foreground/60',
    bgColor: 'bg-muted/40',
  },
};

// Momentum — sage/dusty tones, not traffic lights
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
    color: 'text-success',
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
    color: 'text-destructive',
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
    color: 'text-success',
    bgColor: 'bg-success/8',
  },
  medium: { 
    label: 'Medium', 
    labelZh: '中', 
    color: 'text-warning',
    bgColor: 'bg-warning/8',
  },
  high: { 
    label: 'High', 
    labelZh: '高', 
    color: 'text-destructive',
    bgColor: 'bg-destructive/8',
  },
};
