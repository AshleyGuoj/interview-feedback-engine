import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, Users, TrendingDown, CheckCircle2 } from 'lucide-react';
import { Job, RISK_TAG_CONFIG } from '@/types/job';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, parseISO } from 'date-fns';

interface RiskRadarProps {
  jobs: Job[];
}

interface RiskItem {
  job: Job;
  riskType: 'silence' | 'stale' | 'competition' | 'tagged';
  severity: 'high' | 'medium' | 'low';
  message: string;
  daysCount?: number;
}

export function RiskRadar({ jobs }: RiskRadarProps) {
  const navigate = useNavigate();
  
  const risks = useMemo((): RiskItem[] => {
    const now = new Date();
    const activeJobs = jobs.filter(j => j.status !== 'closed');
    const riskItems: RiskItem[] = [];
    
    activeJobs.forEach(job => {
      const daysSinceUpdate = differenceInDays(now, parseISO(job.updatedAt));
      
      // Long silence detection
      if (daysSinceUpdate >= 10) {
        riskItems.push({
          job,
          riskType: 'silence',
          severity: daysSinceUpdate >= 14 ? 'high' : 'medium',
          message: `No response for ${daysSinceUpdate} days`,
          daysCount: daysSinceUpdate,
        });
      } else if (daysSinceUpdate >= 7) {
        riskItems.push({
          job,
          riskType: 'stale',
          severity: 'low',
          message: 'Consider following up',
          daysCount: daysSinceUpdate,
        });
      }
      
      // Tagged risks
      if (job.riskTags && job.riskTags.length > 0) {
        job.riskTags.forEach(tag => {
          const config = RISK_TAG_CONFIG[tag];
          riskItems.push({
            job,
            riskType: 'tagged',
            severity: tag === 'hc_risk' || tag === 'lowball_offer' ? 'high' : 'medium',
            message: config?.label || tag,
          });
        });
      }
    });
    
    // Sort by severity
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return riskItems.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]).slice(0, 5);
  }, [jobs]);
  
  const severityConfig = {
    high: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-600 dark:text-red-400',
      icon: AlertTriangle,
    },
    medium: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-600 dark:text-amber-400',
      icon: Clock,
    },
    low: {
      bg: 'bg-muted/50',
      border: 'border-border',
      text: 'text-muted-foreground',
      icon: Clock,
    },
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Risk Radar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {risks.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="font-medium text-foreground mb-1">All Clear</p>
            <p className="text-sm text-muted-foreground">No risks detected in your pipeline</p>
          </div>
        ) : (
          risks.map((risk, index) => {
            const config = severityConfig[risk.severity];
            const Icon = risk.riskType === 'competition' ? Users : 
                         risk.riskType === 'tagged' ? TrendingDown : config.icon;
            
            return (
              <div
                key={`${risk.job.id}-${risk.riskType}-${index}`}
                className={`p-3 rounded-lg border ${config.border} ${config.bg} cursor-pointer hover:shadow-sm transition-all`}
                onClick={() => navigate(`/jobs/${risk.job.id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-full ${config.bg} shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {risk.job.companyName}
                    </p>
                    <p className={`text-sm ${config.text}`}>
                      {risk.message}
                    </p>
                    {risk.severity === 'high' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        → Consider alternative strategies
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
