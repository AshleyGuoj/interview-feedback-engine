import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity as ActivityIcon, ArrowRight, Mail, CheckCircle2, Clock, Star, AlertCircle } from 'lucide-react';
import { Activity } from '@/hooks/useActivities';
import { Job } from '@/types/job';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface ActionFeedProps {
  activities: Activity[];
  jobs: Job[];
  loading?: boolean;
}

interface EnrichedActivity {
  activity: Activity;
  job?: Job;
  insight: string;
  action?: {
    label: string;
    path: string;
  };
  icon: React.ElementType;
  iconColor: string;
}

export function ActionFeed({ activities, jobs, loading }: ActionFeedProps) {
  const navigate = useNavigate();
  
  const enrichedActivities = useMemo((): EnrichedActivity[] => {
    const jobMap = new Map(jobs.map(j => [j.id, j]));
    
    return activities
      .slice(0, 6)
      .map(activity => {
        const job = jobMap.get(activity.jobId);
        let insight = '';
        let action: EnrichedActivity['action'] | undefined;
        let icon: React.ElementType = ActivityIcon;
        let iconColor = 'text-primary';
        
        switch (activity.type) {
          case 'interview_scheduled':
            icon = Clock;
            iconColor = 'text-blue-500';
            insight = 'Prepare early for better performance.';
            action = { label: 'Start preparing', path: `/jobs/${activity.jobId}` };
            break;
            
          case 'stage_completed':
            icon = CheckCircle2;
            iconColor = 'text-emerald-500';
            if (activity.message.toLowerCase().includes('final')) {
              insight = 'Likely decision coming soon. Stay engaged.';
              action = { label: 'Send thank-you email', path: `/jobs/${activity.jobId}` };
            } else {
              insight = 'Good progress! Prepare for next round.';
              action = { label: 'View next steps', path: `/jobs/${activity.jobId}` };
            }
            break;
            
          case 'offer_received':
            icon = Star;
            iconColor = 'text-amber-500';
            insight = 'Congratulations! Time to evaluate and negotiate.';
            action = { label: 'Review offer details', path: `/jobs/${activity.jobId}` };
            break;
            
          case 'status_changed':
            if (activity.message.toLowerCase().includes('closed') || 
                activity.message.toLowerCase().includes('rejected')) {
              icon = AlertCircle;
              iconColor = 'text-muted-foreground';
              insight = 'Focus energy on active opportunities.';
            } else {
              icon = ActivityIcon;
              iconColor = 'text-primary';
              insight = 'Pipeline updated. Keep momentum.';
            }
            break;
            
          case 'stage_updated':
            icon = ActivityIcon;
            iconColor = 'text-primary';
            insight = 'Stay organized for better outcomes.';
            break;
            
          default:
            insight = 'Keep your pipeline moving forward.';
        }
        
        return {
          activity,
          job,
          insight,
          action,
          icon,
          iconColor,
        };
      });
  }, [activities, jobs]);
  
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-primary" />
            Action Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading activities...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-primary" />
          Action Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {enrichedActivities.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <ActivityIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground mb-1">No recent activity</p>
            <p className="text-sm text-muted-foreground mb-4">Start tracking your job search</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/jobs')}
            >
              Add your first job
            </Button>
          </div>
        ) : (
          enrichedActivities.map((item) => {
            const Icon = item.icon;
            
            return (
              <div
                key={item.activity.id}
                className="p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => navigate(`/jobs/${item.activity.jobId}`)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-full bg-muted/50 shrink-0 ${item.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.job?.companyName || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {item.activity.message}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {formatDistanceToNow(new Date(item.activity.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground/80 mt-1 italic">
                      → {item.insight}
                    </p>
                    
                    {item.action && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 mt-2 gap-1 text-xs text-primary hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(item.action!.path);
                        }}
                      >
                        {item.action.label}
                        <ArrowRight className="w-3 h-3" />
                      </Button>
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
