import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useJobs } from '@/contexts/JobsContext';
import { useActivities } from '@/hooks/useActivities';
import {
  AICommandCenter,
  DecisionMetrics,
  ActionPanel,
  ActionFeed,
  RiskRadar,
  MomentumScore,
} from '@/components/dashboard';

export default function Dashboard() {
  const { jobs } = useJobs();
  const { activities, loading: activitiesLoading } = useActivities();

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Your career command center
          </p>
        </div>

        {/* Tier 1: AI Command Center - Hero */}
        <AICommandCenter jobs={jobs} />

        {/* Tier 2: Decision Metrics */}
        <DecisionMetrics jobs={jobs} />

        {/* Tier 3: Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Pipeline / Interviews */}
          <div className="lg:col-span-2 space-y-6">
            <ActionPanel jobs={jobs} />
            <ActionFeed 
              activities={activities} 
              jobs={jobs} 
              loading={activitiesLoading} 
            />
          </div>

          {/* Right: Insights / Risk */}
          <div className="space-y-6">
            <MomentumScore jobs={jobs} />
            <RiskRadar jobs={jobs} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
