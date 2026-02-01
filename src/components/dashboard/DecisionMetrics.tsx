import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Target, Activity, Gauge, AlertTriangle } from 'lucide-react';
import { Job } from '@/types/job';
import { differenceInDays, parseISO, isAfter } from 'date-fns';

interface DecisionMetricsProps {
  jobs: Job[];
}

interface Metric {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status: 'good' | 'warning' | 'danger' | 'neutral';
  icon: React.ElementType;
}

export function DecisionMetrics({ jobs }: DecisionMetricsProps) {
  const metrics = useMemo((): Metric[] => {
    const now = new Date();
    const activeJobs = jobs.filter(j => j.status !== 'closed');
    const interviewing = jobs.filter(j => j.status === 'interviewing');
    const offers = jobs.filter(j => j.status === 'offer');
    
    // Calculate offer probability based on pipeline depth
    const finalRounds = activeJobs.filter(j => 
      j.stages.some(s => 
        (s.name.toLowerCase().includes('final') || s.name.includes('offer')) &&
        s.status !== 'skipped'
      )
    );
    
    let offerProbability = 0;
    if (offers.length > 0) {
      offerProbability = 95;
    } else if (finalRounds.length >= 2) {
      offerProbability = 78;
    } else if (finalRounds.length === 1) {
      offerProbability = 55;
    } else if (interviewing.length >= 3) {
      offerProbability = 45;
    } else if (interviewing.length > 0) {
      offerProbability = 30;
    } else if (activeJobs.length > 0) {
      offerProbability = 15;
    }
    
    // Pipeline health
    const staleJobs = activeJobs.filter(j => {
      const lastUpdate = parseISO(j.updatedAt);
      return differenceInDays(now, lastUpdate) > 7;
    });
    const staleRatio = activeJobs.length > 0 ? staleJobs.length / activeJobs.length : 0;
    
    let pipelineHealth: 'Healthy' | 'Needs Attention' | 'At Risk' = 'Healthy';
    let healthStatus: Metric['status'] = 'good';
    if (staleRatio > 0.5 || activeJobs.length === 0) {
      pipelineHealth = 'At Risk';
      healthStatus = 'danger';
    } else if (staleRatio > 0.25 || staleJobs.length >= 2) {
      pipelineHealth = 'Needs Attention';
      healthStatus = 'warning';
    }
    
    // Interview velocity - count interviews in last 14 days
    const recentInterviews = activeJobs.flatMap(j => 
      j.stages.filter(s => {
        if (!s.date && !s.scheduledTime) return false;
        try {
          const stageDate = parseISO(s.date || s.scheduledTime || '');
          return differenceInDays(now, stageDate) <= 14 && differenceInDays(now, stageDate) >= 0;
        } catch {
          return false;
        }
      })
    );
    
    let velocityLabel = 'No data';
    let velocityStatus: Metric['status'] = 'neutral';
    if (recentInterviews.length >= 4) {
      velocityLabel = 'High';
      velocityStatus = 'good';
    } else if (recentInterviews.length >= 2) {
      velocityLabel = 'Moderate';
      velocityStatus = 'good';
    } else if (recentInterviews.length >= 1) {
      velocityLabel = 'Low';
      velocityStatus = 'warning';
    } else if (activeJobs.length > 0) {
      velocityLabel = 'Stalled';
      velocityStatus = 'danger';
    }
    
    // Risk level
    const highRiskJobs = activeJobs.filter(j => j.riskTags && j.riskTags.length > 0);
    const longSilenceJobs = activeJobs.filter(j => {
      const lastUpdate = parseISO(j.updatedAt);
      return differenceInDays(now, lastUpdate) > 10;
    });
    
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    let riskStatus: Metric['status'] = 'good';
    if (longSilenceJobs.length >= 3 || highRiskJobs.length >= 2) {
      riskLevel = 'High';
      riskStatus = 'danger';
    } else if (longSilenceJobs.length >= 1 || highRiskJobs.length >= 1) {
      riskLevel = 'Medium';
      riskStatus = 'warning';
    }
    
    return [
      {
        label: 'Offer Probability',
        value: `${offerProbability}%`,
        trend: offerProbability > 50 ? 'up' : offerProbability > 20 ? 'stable' : 'down',
        status: offerProbability >= 50 ? 'good' : offerProbability >= 30 ? 'warning' : 'danger',
        icon: Target,
      },
      {
        label: 'Pipeline Health',
        value: pipelineHealth,
        status: healthStatus,
        icon: Activity,
      },
      {
        label: 'Interview Velocity',
        value: velocityLabel,
        trendValue: recentInterviews.length > 0 ? `${recentInterviews.length} in 14d` : undefined,
        status: velocityStatus,
        icon: Gauge,
      },
      {
        label: 'Risk Level',
        value: riskLevel,
        status: riskStatus,
        icon: AlertTriangle,
      },
    ];
  }, [jobs]);
  
  const statusColors = {
    good: 'text-emerald-500',
    warning: 'text-amber-500',
    danger: 'text-red-500',
    neutral: 'text-muted-foreground',
  };
  
  const statusBg = {
    good: 'bg-emerald-500/10',
    warning: 'bg-amber-500/10',
    danger: 'bg-red-500/10',
    neutral: 'bg-muted/50',
  };
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
        
        return (
          <Card 
            key={metric.label} 
            className="hover:shadow-md transition-all duration-200 cursor-pointer group"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${statusBg[metric.status]}`}>
                  <Icon className={`w-4 h-4 ${statusColors[metric.status]}`} />
                </div>
                {metric.trend && (
                  <TrendIcon className={`w-4 h-4 ${statusColors[metric.status]} opacity-60`} />
                )}
              </div>
              
              <div className="space-y-1">
                <p className={`text-2xl font-bold ${statusColors[metric.status]} transition-transform group-hover:scale-105`}>
                  {metric.value}
                </p>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                {metric.trendValue && (
                  <p className="text-xs text-muted-foreground/70">{metric.trendValue}</p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
