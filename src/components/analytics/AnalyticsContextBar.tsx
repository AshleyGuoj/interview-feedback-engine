import { Building2, ChevronRight } from 'lucide-react';
import { Job, InterviewStage } from '@/types/job';

interface AnalyticsContextBarProps {
  job: Job;
  stage?: InterviewStage;
}

export function AnalyticsContextBar({ job, stage }: AnalyticsContextBarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b text-sm sticky top-0 z-10">
      <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="font-medium truncate">{job.companyName}</span>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground truncate">{job.roleTitle}</span>
      {stage && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-primary font-medium">{stage.name}</span>
        </>
      )}
    </div>
  );
}
