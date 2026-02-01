import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, TrendingDown, Minus, ArrowRight, Zap } from 'lucide-react';
import { Job } from '@/types/job';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, parseISO, isAfter } from 'date-fns';

interface AICommandCenterProps {
  jobs: Job[];
}

interface MomentumAnalysis {
  level: 'strong' | 'moderate' | 'building' | 'stalled';
  signals: string[];
  recommendation: {
    action: string;
    target?: string;
    urgency: 'high' | 'medium' | 'low';
  };
  narrative: string;
}

export function AICommandCenter({ jobs }: AICommandCenterProps) {
  const navigate = useNavigate();
  
  const analysis = useMemo((): MomentumAnalysis => {
    const now = new Date();
    const activeJobs = jobs.filter(j => j.status !== 'closed');
    const signals: string[] = [];
    
    // Count stage depths
    const finalRounds = activeJobs.filter(j => 
      j.stages.some(s => 
        (s.name.toLowerCase().includes('final') || s.name.toLowerCase().includes('offer')) &&
        (s.status === 'upcoming' || s.status === 'completed')
      )
    );
    
    const interviewing = jobs.filter(j => j.status === 'interviewing');
    const offers = jobs.filter(j => j.status === 'offer');
    
    // Check upcoming interviews
    const upcomingInterviews = activeJobs.flatMap(job => 
      job.stages.filter(s => {
        if (s.status !== 'upcoming' || !s.scheduledTime) return false;
        try {
          return isAfter(parseISO(s.scheduledTime), now);
        } catch {
          return false;
        }
      }).map(s => ({ job, stage: s }))
    );
    
    // Check for stale applications (no activity in 7+ days)
    const staleJobs = activeJobs.filter(j => {
      const lastUpdate = parseISO(j.updatedAt);
      return differenceInDays(now, lastUpdate) > 7;
    });
    
    // Build signals
    if (offers.length > 0) {
      signals.push(`${offers.length} offer${offers.length > 1 ? 's' : ''} in hand`);
    }
    if (finalRounds.length > 0) {
      signals.push(`${finalRounds.length} final round${finalRounds.length > 1 ? 's' : ''} in progress`);
    }
    if (interviewing.length > 0) {
      signals.push(`${interviewing.length} active interview${interviewing.length > 1 ? 's' : ''}`);
    }
    if (upcomingInterviews.length > 0) {
      signals.push(`${upcomingInterviews.length} interview${upcomingInterviews.length > 1 ? 's' : ''} scheduled`);
    }
    if (staleJobs.length > 0 && staleJobs.length <= 3) {
      signals.push(`${staleJobs.length} application${staleJobs.length > 1 ? 's' : ''} need follow-up`);
    }
    
    // Determine momentum level
    let level: MomentumAnalysis['level'] = 'building';
    let narrative = '';
    let recommendation: MomentumAnalysis['recommendation'] = {
      action: 'Keep applying to maintain pipeline momentum',
      urgency: 'medium'
    };
    
    if (offers.length > 0) {
      level = 'strong';
      narrative = 'Excellent position! You have offers to evaluate. Focus on negotiation and decision-making.';
      recommendation = {
        action: 'Compare offers and prepare negotiation strategy',
        urgency: 'high'
      };
    } else if (finalRounds.length >= 2) {
      level = 'strong';
      narrative = 'Strong momentum with multiple late-stage opportunities. Offer probability is high.';
      const nextFinal = finalRounds[0];
      recommendation = {
        action: 'Prepare thoroughly for final rounds',
        target: nextFinal?.companyName,
        urgency: 'high'
      };
    } else if (finalRounds.length === 1 || interviewing.length >= 3) {
      level = 'moderate';
      narrative = 'Good progress in your pipeline. Keep momentum with consistent interview preparation.';
      recommendation = {
        action: upcomingInterviews.length > 0 
          ? 'Focus on upcoming interview preparation'
          : 'Follow up on pending applications',
        target: upcomingInterviews[0]?.job.companyName,
        urgency: 'medium'
      };
    } else if (interviewing.length > 0 || upcomingInterviews.length > 0) {
      level = 'building';
      narrative = 'Your pipeline is building. Focus on converting interviews to next rounds.';
      recommendation = {
        action: 'Prepare for scheduled interviews and expand applications',
        urgency: 'medium'
      };
    } else if (activeJobs.length === 0) {
      level = 'stalled';
      narrative = 'Time to kickstart your job search. Start with targeted applications.';
      recommendation = {
        action: 'Add new job applications to build pipeline',
        urgency: 'high'
      };
    } else {
      level = 'stalled';
      narrative = 'Pipeline needs attention. Consider following up or expanding your search.';
      recommendation = {
        action: staleJobs.length > 0 
          ? 'Follow up on stale applications'
          : 'Apply to more positions',
        urgency: 'medium'
      };
    }
    
    return { level, signals, recommendation, narrative };
  }, [jobs]);
  
  const levelConfig = {
    strong: {
      icon: TrendingUp,
      label: 'Strong Momentum',
      gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
      iconColor: 'text-emerald-500',
      borderColor: 'border-emerald-500/30',
    },
    moderate: {
      icon: TrendingUp,
      label: 'Good Progress',
      gradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-500/30',
    },
    building: {
      icon: Minus,
      label: 'Building Pipeline',
      gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
      iconColor: 'text-amber-500',
      borderColor: 'border-amber-500/30',
    },
    stalled: {
      icon: TrendingDown,
      label: 'Needs Attention',
      gradient: 'from-red-500/20 via-red-500/10 to-transparent',
      iconColor: 'text-red-500',
      borderColor: 'border-red-500/30',
    },
  };
  
  const config = levelConfig[analysis.level];
  const Icon = config.icon;
  
  return (
    <Card className={`relative overflow-hidden border-2 ${config.borderColor} bg-gradient-to-br ${config.gradient}`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <CardContent className="p-6 lg:p-8 relative">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[280px] space-y-4">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg bg-background/80 backdrop-blur-sm ${config.iconColor}`}>
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${config.iconColor}`} />
                <span className="font-semibold text-lg">{config.label}</span>
              </div>
            </div>
            
            {/* Narrative */}
            <p className="text-muted-foreground text-base leading-relaxed max-w-xl">
              {analysis.narrative}
            </p>
            
            {/* Signals */}
            {analysis.signals.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {analysis.signals.slice(0, 4).map((signal, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1.5 text-sm bg-background/60 backdrop-blur-sm rounded-full border border-border/50"
                  >
                    {signal}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Action Card */}
          <div className="bg-background/80 backdrop-blur-sm rounded-xl p-5 border border-border/50 min-w-[260px] max-w-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Zap className={`w-4 h-4 ${
                analysis.recommendation.urgency === 'high' ? 'text-amber-500' : 'text-primary'
              }`} />
              <span>Recommended Action</span>
            </div>
            <p className="font-medium text-foreground mb-3">
              {analysis.recommendation.action}
              {analysis.recommendation.target && (
                <span className="text-primary"> — {analysis.recommendation.target}</span>
              )}
            </p>
            <Button 
              size="sm" 
              className="w-full gap-2"
              onClick={() => navigate('/jobs')}
            >
              View Pipeline
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
