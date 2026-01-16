import { Job, JobStatus } from '@/types/job';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
}

const statuses: JobStatus[] = ['applied', 'interviewing', 'offer', 'closed'];

export function KanbanBoard({ jobs, onJobClick }: KanbanBoardProps) {
  const jobsByStatus = statuses.reduce((acc, status) => {
    acc[status] = jobs.filter(job => job.status === status);
    return acc;
  }, {} as Record<JobStatus, Job[]>);

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 px-1">
      {statuses.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          jobs={jobsByStatus[status]}
          onJobClick={onJobClick}
        />
      ))}
    </div>
  );
}
