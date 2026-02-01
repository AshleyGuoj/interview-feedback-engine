import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Job } from '@/types/job';
import { differenceInDays, parseISO, isAfter } from 'date-fns';

interface MomentumScoreProps {
  jobs: Job[];
}

export function MomentumScore({ jobs }: MomentumScoreProps) {
  const { score, breakdown, trend } = useMemo(() => {
    const now = new Date();
    const activeJobs = jobs.filter(j => j.status !== 'closed');
    
    // Scoring factors (out of 100)
    let scoreTotal = 0;
    const factors: { name: string; points: number; max: number }[] = [];
    
    // 1. Active applications (max 15 points)
    const activePoints = Math.min(activeJobs.length * 3, 15);
    factors.push({ name: 'Active apps', points: activePoints, max: 15 });
    scoreTotal += activePoints;
    
    // 2. Interview stage depth (max 30 points) - weighted by stage
    let stageDepthPoints = 0;
    activeJobs.forEach(job => {
      const completedStages = job.stages.filter(s => s.status === 'completed').length;
      const isFinalRound = job.stages.some(s => 
        s.name.toLowerCase().includes('final') && s.status !== 'skipped'
      );
      const hasOffer = job.status === 'offer';
      
      if (hasOffer) stageDepthPoints += 10;
      else if (isFinalRound) stageDepthPoints += 7;
      else if (completedStages >= 3) stageDepthPoints += 5;
      else if (completedStages >= 2) stageDepthPoints += 3;
      else if (completedStages >= 1) stageDepthPoints += 1;
    });
    stageDepthPoints = Math.min(stageDepthPoints, 30);
    factors.push({ name: 'Stage depth', points: stageDepthPoints, max: 30 });
    scoreTotal += stageDepthPoints;
    
    // 3. Upcoming interviews (max 20 points)
    const upcomingInterviews = activeJobs.flatMap(j => 
      j.stages.filter(s => {
        if (s.status !== 'upcoming' || !s.scheduledTime) return false;
        try {
          return isAfter(parseISO(s.scheduledTime), now);
        } catch {
          return false;
        }
      })
    );
    const upcomingPoints = Math.min(upcomingInterviews.length * 5, 20);
    factors.push({ name: 'Scheduled', points: upcomingPoints, max: 20 });
    scoreTotal += upcomingPoints;
    
    // 4. Pipeline freshness (max 20 points) - penalize stale apps
    const freshJobs = activeJobs.filter(j => {
      const daysSince = differenceInDays(now, parseISO(j.updatedAt));
      return daysSince <= 7;
    });
    const freshnessRatio = activeJobs.length > 0 ? freshJobs.length / activeJobs.length : 0;
    const freshnessPoints = Math.round(freshnessRatio * 20);
    factors.push({ name: 'Freshness', points: freshnessPoints, max: 20 });
    scoreTotal += freshnessPoints;
    
    // 5. Offer probability bonus (max 15 points)
    const offers = jobs.filter(j => j.status === 'offer').length;
    const finalRounds = activeJobs.filter(j => 
      j.stages.some(s => s.name.toLowerCase().includes('final') && s.status !== 'skipped')
    ).length;
    let offerBonus = 0;
    if (offers > 0) offerBonus = 15;
    else if (finalRounds >= 2) offerBonus = 12;
    else if (finalRounds === 1) offerBonus = 8;
    factors.push({ name: 'Offer proximity', points: offerBonus, max: 15 });
    scoreTotal += offerBonus;
    
    // Determine trend
    let trendDirection: 'up' | 'down' | 'stable' = 'stable';
    if (scoreTotal >= 70 || upcomingInterviews.length >= 2) trendDirection = 'up';
    else if (scoreTotal <= 30 || freshnessRatio < 0.3) trendDirection = 'down';
    
    return {
      score: Math.min(scoreTotal, 100),
      breakdown: factors,
      trend: trendDirection,
    };
  }, [jobs]);
  
  const scoreColor = score >= 70 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : 'text-red-500';
  const progressColor = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  
  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            <span className="font-semibold">Career Momentum</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendIcon className={`w-4 h-4 ${scoreColor}`} />
          </div>
        </div>
        
        <div className="flex items-end gap-3 mb-4">
          <span className={`text-4xl font-bold ${scoreColor} transition-all`}>
            {score}
          </span>
          <span className="text-muted-foreground text-lg mb-1">/ 100</span>
        </div>
        
        <div className="relative mb-4">
          <Progress value={score} className="h-2" />
          <div 
            className={`absolute top-0 left-0 h-2 rounded-full ${progressColor} transition-all duration-500`}
            style={{ width: `${score}%` }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {breakdown.map((factor) => (
            <div key={factor.name} className="text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{factor.name}</span>
                <span className="text-foreground font-medium">{factor.points}/{factor.max}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
