import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CalendarDays, Clock, AlertCircle, Activity, ArrowRight, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '@/contexts/JobsContext';
import { useActivities } from '@/hooks/useActivities';
import { useMemo } from 'react';
import { formatDistanceToNow, isAfter, parseISO } from 'date-fns';
import { formatDualTimezone } from '@/lib/timezone';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function CareerHealthBar({ jobs }: { jobs: any[] }) {
  const metrics = useMemo(() => {
    const active = jobs.filter(j => j.status !== 'closed').length;
    const interviewing = jobs.filter(j => j.status === 'interviewing').length;
    const offers = jobs.filter(j => j.status === 'offer').length;
    const closed = jobs.filter(j => j.status === 'closed').length;
    const responseRate = jobs.length > 0
      ? Math.round(((interviewing + offers + closed) / jobs.length) * 100)
      : 0;

    let healthLabel = 'Building';
    let healthColor = 'text-muted-foreground';
    if (active >= 3 && responseRate >= 30) {
      healthLabel = 'Strong';
      healthColor = 'text-success';
    } else if (active >= 1) {
      healthLabel = 'Active';
      healthColor = 'text-primary';
    }

    return { active, interviewing, offers, responseRate, healthLabel, healthColor };
  }, [jobs]);

  const { t } = useTranslation();

  return (
    <div className="rounded-xl border-l-3 border-l-primary/30 surface-insight p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wide">
            Career Health
          </h2>
        </div>
        <span className={`text-[13px] font-semibold ${metrics.healthColor}`}>
          {metrics.healthLabel}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-6">
        <MetricCell value={metrics.active} label={t('dashboard.activeApplications')} hint="Pipeline depth" />
        <MetricCell value={metrics.interviewing} label={t('dashboard.interviewing')} hint="In progress" />
        <MetricCell value={metrics.offers} label={t('dashboard.offersReceived')} hint="Decisions pending" />
        <MetricCell value={`${metrics.responseRate}%`} label={t('dashboard.responseRate')} hint={metrics.responseRate >= 30 ? 'Healthy rate' : 'Keep applying'} />
      </div>
    </div>
  );
}

function MetricCell({ value, label, hint }: { value: string | number; label: string; hint: string }) {
  return (
    <div className="space-y-1">
      <p className="text-2xl font-semibold tracking-tight text-primary">{value}</p>
      <p className="text-[12px] font-medium text-primary/70">{label}</p>
      <p className="text-[11px] text-muted-foreground/60">{hint}</p>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { jobs } = useJobs();
  const { activities, loading: activitiesLoading } = useActivities();

  const upcomingInterviews = useMemo(() => {
    const now = new Date();
    return jobs
      .flatMap(job => {
        const upcomingStages = job.stages.filter(s => {
          if (!['pending', 'scheduled', 'rescheduled'].includes(s.status)) return false;
          if (s.scheduledTime) {
            try { return isAfter(parseISO(s.scheduledTime), now); } catch { return true; }
          }
          return !!s.deadline;
        });
        return upcomingStages.map(stage => ({
          id: job.id, company: job.companyName, role: job.roleTitle, stage: stage.name,
          scheduledTime: stage.scheduledTime, scheduledTimezone: stage.scheduledTimezone,
          deadline: stage.deadline, deadlineTimezone: stage.deadlineTimezone,
          nextAction: job.nextAction,
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

  const recentActivity = useMemo(() => {
    const jobMap = new Map(jobs.map(j => [j.id, j]));
    return activities.slice(0, 5).map(activity => {
      const job = jobMap.get(activity.jobId);
      return {
        id: activity.id, jobId: activity.jobId,
        company: job?.companyName || 'Unknown',
        message: activity.message, type: activity.type,
        time: formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }),
      };
    });
  }, [activities, jobs]);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 max-w-[1100px] space-y-8">
        {/* Header — upgraded title + greeting */}
        <div className="space-y-1">
          <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-[-0.02em] text-foreground">
            {t('dashboard.title')}
          </h1>
          <p className="text-[14px] text-muted-foreground">
            {getGreeting()}
          </p>
        </div>

        <CareerHealthBar jobs={jobs} />

        {/* Intelligence Modules */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Interview Pipeline */}
          <div className="rounded-xl border border-border bg-card">
            <div className="px-5 pt-5 pb-3">
              <h3 className="text-[14px] font-semibold text-foreground">
                Interview Pipeline
              </h3>
            </div>
            <div className="px-5 pb-5 space-y-2.5">
              {upcomingInterviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <CalendarDays className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-[13px] text-muted-foreground text-center">
                    {t('dashboard.noScheduledInterviews')}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 text-center">
                    Upcoming interviews will appear here
                  </p>
                </div>
              ) : (
                upcomingInterviews.map((interview, index) => (
                  <div
                    key={`${interview.id}-${index}`}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 cursor-pointer transition-colors"
                    onClick={() => navigate(`/jobs/${interview.id}`)}
                  >
                    {/* Company initial avatar */}
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[13px] font-semibold text-primary">
                        {interview.company.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div>
                        <p className="text-[13px] font-medium text-foreground">{interview.company}</p>
                        <p className="text-[12px] text-muted-foreground">
                          {interview.role} · {interview.stage}
                        </p>
                      </div>
                      {interview.scheduledTime && interview.scheduledTimezone && (
                        <div className="flex items-center gap-1 text-[11px] text-primary px-2 py-0.5 rounded-md bg-primary/8 w-fit">
                          <CalendarDays className="w-3 h-3" />
                          {formatDualTimezone(interview.scheduledTime, interview.scheduledTimezone)}
                        </div>
                      )}
                      {interview.deadline && interview.deadlineTimezone && (
                        <div className="flex items-center gap-1 text-[11px] text-warning px-2 py-0.5 rounded-md bg-warning/8 w-fit">
                          <AlertCircle className="w-3 h-3" />
                          {t('dashboard.deadline')}: {formatDualTimezone(interview.deadline, interview.deadlineTimezone)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Signal Feed — open section, no card */}
          <div className="border-l-2 border-l-primary/30 pl-5 space-y-4">
            <h3 className="text-[14px] font-semibold text-foreground pt-1">
              {t('dashboard.recentActivity')}
            </h3>
            <div className="space-y-1">
              {activitiesLoading ? (
                <p className="text-[13px] text-muted-foreground py-6 text-center">
                  {t('dashboard.loadingActivities')}
                </p>
              ) : recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Inbox className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-[13px] text-muted-foreground text-center">
                    {t('dashboard.noRecentActivity')}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 text-center">
                    Activity from your job board will show up here
                  </p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 cursor-pointer hover:bg-muted/40 p-2.5 rounded-lg transition-colors"
                    onClick={() => navigate(`/jobs/${activity.jobId}`)}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mt-[7px] shrink-0 ${
                      activity.type === 'interview_scheduled' ? 'bg-primary' :
                      activity.type === 'stage_completed' ? 'bg-success' :
                      activity.type === 'offer_received' ? 'bg-warning' :
                      'bg-muted-foreground/40'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-foreground">{activity.message}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Action */}
        <div
          className="group rounded-xl border border-primary/15 bg-gradient-to-r from-primary/[0.03] to-primary/[0.07] p-5 flex items-center justify-between cursor-pointer hover:from-primary/[0.05] hover:to-primary/[0.12] transition-all"
          onClick={() => navigate('/analyze')}
        >
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">{t('dashboard.readyToPrepare')}</h3>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {t('dashboard.aiPoweredFeedback')}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </DashboardLayout>
  );
}
