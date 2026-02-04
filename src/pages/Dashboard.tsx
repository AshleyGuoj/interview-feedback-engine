import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Clock, Trophy, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '@/contexts/JobsContext';
import { useActivities } from '@/hooks/useActivities';
import { useMemo } from 'react';
import { formatDistanceToNow, isAfter, parseISO } from 'date-fns';
import { formatDualTimezone } from '@/lib/timezone';

export default function Dashboard() {
  const navigate = useNavigate();
  const { jobs } = useJobs();
  const { activities, loading: activitiesLoading } = useActivities();

  // Calculate real stats - derived from jobs data
  const stats = useMemo(() => {
    const activeApplications = jobs.filter(j => j.status !== 'closed').length;
    const offers = jobs.filter(j => j.status === 'offer').length;
    const interviewing = jobs.filter(j => j.status === 'interviewing').length;
    const closed = jobs.filter(j => j.status === 'closed').length;
    const responseRate = jobs.length > 0 
      ? Math.round(((interviewing + offers + closed) / jobs.length) * 100) 
      : 0;

    return [
      { label: 'Active Applications', value: activeApplications, icon: Briefcase, color: 'text-blue-500' },
      { label: 'Interviewing', value: interviewing, icon: Clock, color: 'text-amber-500' },
      { label: 'Offers Received', value: offers, icon: Trophy, color: 'text-emerald-500' },
      { label: 'Response Rate', value: `${responseRate}%`, icon: TrendingUp, color: 'text-purple-500' },
    ];
  }, [jobs]);

  // Upcoming interviews - derived view from stages where status === 'upcoming' AND scheduledTime >= now
  const upcomingInterviews = useMemo(() => {
    const now = new Date();
    
    return jobs
      .flatMap(job => {
        const upcomingStages = job.stages.filter(s => {
          if (s.status !== 'upcoming') return false;
          
          // Include if has scheduled time in the future, or has a deadline
          if (s.scheduledTime) {
            try {
              return isAfter(parseISO(s.scheduledTime), now);
            } catch {
              return true; // Include if can't parse
            }
          }
          return !!s.deadline;
        });
        
        return upcomingStages.map(stage => ({
          id: job.id,
          company: job.companyName,
          role: job.roleTitle,
          stage: stage.name,
          scheduledTime: stage.scheduledTime,
          scheduledTimezone: stage.scheduledTimezone,
          deadline: stage.deadline,
          deadlineTimezone: stage.deadlineTimezone,
          nextAction: job.nextAction,
          // For sorting
          sortDate: stage.scheduledTime || stage.deadline || '',
        }));
      })
      .filter(item => item.scheduledTime || item.deadline)
      .sort((a, b) => {
        if (!a.sortDate) return 1;
        if (!b.sortDate) return -1;
        return a.sortDate.localeCompare(b.sortDate);
      })
      .slice(0, 4);
  }, [jobs]);

  // Recent activity - read from activities table (append-only feed)
  const recentActivity = useMemo(() => {
    // Create a map of job IDs to job info for enrichment
    const jobMap = new Map(jobs.map(j => [j.id, j]));
    
    return activities
      .slice(0, 5)
      .map(activity => {
        const job = jobMap.get(activity.jobId);
        return {
          id: activity.id,
          jobId: activity.jobId,
          company: job?.companyName || 'Unknown',
          message: activity.message,
          type: activity.type,
          time: formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }),
        };
      });
  }, [activities, jobs]);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your job search overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Interviews - Derived view */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Interviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingInterviews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No scheduled interviews
                </p>
              ) : (
                upcomingInterviews.map((interview, index) => (
                  <div 
                    key={`${interview.id}-${index}`}
                    className="flex flex-col p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors gap-2"
                    onClick={() => navigate(`/jobs/${interview.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{interview.company}</p>
                        <p className="text-sm text-muted-foreground">
                          {interview.role} • {interview.stage}
                        </p>
                      </div>
                    </div>
                    {interview.scheduledTime && interview.scheduledTimezone && (
                      <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full w-fit">
                        <Calendar className="w-3 h-3" />
                        {formatDualTimezone(interview.scheduledTime, interview.scheduledTimezone)}
                      </div>
                    )}
                    {interview.deadline && interview.deadlineTimezone && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-full w-fit">
                        <AlertCircle className="w-3 h-3" />
                        截止: {formatDualTimezone(interview.deadline, interview.deadlineTimezone)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Activity - Read from activities table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activitiesLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Loading activities...
                </p>
              ) : recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              ) : (
                recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg -mx-2 transition-colors"
                    onClick={() => navigate(`/jobs/${activity.jobId}`)}
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                      activity.type === 'interview_scheduled' ? 'bg-blue-500' :
                      activity.type === 'stage_completed' ? 'bg-emerald-500' :
                      activity.type === 'offer_received' ? 'bg-yellow-500' :
                      'bg-primary'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">Ready to prepare for your next interview?</h3>
                <p className="text-muted-foreground text-sm">
                  Use our AI-powered interview analyzer to get actionable feedback.
                </p>
              </div>
              <button
                onClick={() => navigate('/analyze')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Analyze Interview
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
