import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlobalInterviewTimeline } from '@/components/interview/GlobalInterviewTimeline';

export default function Timeline() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">面试记录库</h1>
          <p className="text-muted-foreground mt-1">
            汇总所有面试记录，沉淀问题与反思
          </p>
        </div>

        <GlobalInterviewTimeline />
      </div>
    </DashboardLayout>
  );
}
