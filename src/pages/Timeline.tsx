import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CareerSignalTimeline } from '@/components/timeline/CareerSignalTimeline';

export default function Timeline() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">职业信号时间线</h1>
          <p className="text-muted-foreground mt-1">
            AI驱动的职业发展信号分析，发现关键转折点与趋势模式
          </p>
        </div>

        <CareerSignalTimeline />
      </div>
    </DashboardLayout>
  );
}
