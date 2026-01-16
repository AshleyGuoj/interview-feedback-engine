import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Clock, Trophy, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '@/hooks/useJobs';
import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const { jobs } = useJobs();

  // Calculate real stats
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

  // Get upcoming interviews from jobs that are in interviewing stage
  const upcomingInterviews = useMemo(() => {
    return jobs
      .filter(job => job.status === 'interviewing')
      .map(job => {
        const currentStageData = job.stages.find(s => s.name === job.currentStage);
        return {
          id: job.id,
          company: job.companyName,
          role: job.roleTitle,
          stage: job.currentStage || 'Interview',
          nextAction: job.nextAction || 'Prepare for interview',
        };
      })
      .slice(0, 4);
  }, [jobs]);

  // Get recent activity based on updatedAt
  const recentActivity = useMemo(() => {
    return [...jobs]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(job => {
        let action = '';
        if (job.status === 'offer') {
          action = 'Received offer!';
        } else if (job.status === 'interviewing') {
          action = job.currentStage ? `${job.currentStage} in progress` : 'Interview scheduled';
        } else if (job.status === 'applied') {
          action = 'Application submitted';
        } else {
          action = 'Position closed';
        }

        return {
          id: job.id,
          company: job.companyName,
          action,
          time: formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true }),
        };
      });
  }, [jobs]);

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
          {/* Upcoming Interviews */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Interviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingInterviews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming interviews
                </p>
              ) : (
                upcomingInterviews.map((interview) => (
                  <div 
                    key={interview.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => navigate(`/jobs/${interview.id}`)}
                  >
                    <div>
                      <p className="font-medium">{interview.company}</p>
                      <p className="text-sm text-muted-foreground">
                        {interview.role} • {interview.stage}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{interview.nextAction}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              ) : (
                recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg -mx-2 transition-colors"
                    onClick={() => navigate(`/jobs/${activity.id}`)}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.company}</span>
                        {' — '}
                        {activity.action}
                      </p>
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
