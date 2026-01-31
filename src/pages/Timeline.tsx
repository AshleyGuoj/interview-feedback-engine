import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InterviewPipelineDashboard } from '@/components/pipeline';

export default function Timeline() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">面试流程看板</h1>
          <p className="text-muted-foreground mt-1">
            可视化完整面试生命周期，支持多阶段配置与风险追踪
          </p>
        </div>

        <InterviewPipelineDashboard />
      </div>
    </DashboardLayout>
  );
}
