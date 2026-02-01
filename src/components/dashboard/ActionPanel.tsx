import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, Briefcase, Send, Sparkles } from 'lucide-react';
import { Job } from '@/types/job';
import { useNavigate } from 'react-router-dom';
import { formatDualTimezone } from '@/lib/timezone';
import { isAfter, parseISO, differenceInHours } from 'date-fns';

interface ActionPanelProps {
  jobs: Job[];
}

interface UpcomingInterview {
  job: Job;
  stage: Job['stages'][0];
  urgency: 'imminent' | 'soon' | 'upcoming';
}

export function ActionPanel({ jobs }: ActionPanelProps) {
  const navigate = useNavigate();
  
  const upcomingInterviews = useMemo((): UpcomingInterview[] => {
    const now = new Date();
    
    return jobs
      .filter(j => j.status !== 'closed')
      .flatMap(job => 
        job.stages
          .filter(s => {
            if (s.status !== 'upcoming' || !s.scheduledTime) return false;
            try {
              return isAfter(parseISO(s.scheduledTime), now);
            } catch {
              return false;
            }
          })
          .map(stage => {
            const hoursUntil = differenceInHours(parseISO(stage.scheduledTime!), now);
            let urgency: UpcomingInterview['urgency'] = 'upcoming';
            if (hoursUntil <= 24) urgency = 'imminent';
            else if (hoursUntil <= 72) urgency = 'soon';
            
            return { job, stage, urgency };
          })
      )
      .sort((a, b) => {
        const aTime = a.stage.scheduledTime || '';
        const bTime = b.stage.scheduledTime || '';
        return aTime.localeCompare(bTime);
      })
      .slice(0, 4);
  }, [jobs]);
  
  const urgencyStyles = {
    imminent: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/5',
      badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
      label: 'Today/Tomorrow',
    },
    soon: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      label: 'This Week',
    },
    upcoming: {
      border: 'border-border',
      bg: 'bg-muted/30',
      badge: 'bg-primary/10 text-primary',
      label: 'Scheduled',
    },
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Upcoming Interviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingInterviews.length === 0 ? (
          /* Smart Empty State */
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">No interviews scheduled</p>
              <p className="text-sm text-muted-foreground">Time to build momentum</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 w-full"
                onClick={() => navigate('/jobs')}
              >
                <Send className="w-4 h-4" />
                Follow up with recruiters
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 w-full"
                onClick={() => navigate('/jobs')}
              >
                <Briefcase className="w-4 h-4" />
                Apply to new roles
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 w-full"
                onClick={() => navigate('/interview-prep')}
              >
                <Sparkles className="w-4 h-4" />
                Practice with AI
              </Button>
            </div>
          </div>
        ) : (
          upcomingInterviews.map((item, index) => {
            const styles = urgencyStyles[item.urgency];
            
            return (
              <div
                key={`${item.job.id}-${item.stage.id}-${index}`}
                className={`p-4 rounded-xl border ${styles.border} ${styles.bg} cursor-pointer hover:shadow-md transition-all duration-200 group`}
                onClick={() => navigate(`/jobs/${item.job.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
                        {item.stage.name}
                      </span>
                    </div>
                    <p className="font-semibold text-foreground truncate">
                      {item.job.companyName}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {item.job.roleTitle}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                </div>
                
                {item.stage.scheduledTime && item.stage.scheduledTimezone && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-foreground font-medium">
                        {formatDualTimezone(item.stage.scheduledTime, item.stage.scheduledTimezone)}
                      </span>
                    </div>
                  </div>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-3 gap-2 text-primary hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/jobs/${item.job.id}`);
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  Prepare interview kit
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
