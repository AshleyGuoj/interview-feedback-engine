import { useState } from 'react';
import { Job, JobStatus } from '@/types/job';
import { KanbanColumn } from './KanbanColumn';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { DraggableJobCard } from './DraggableJobCard';

interface KanbanBoardProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
  onJobStatusChange?: (jobId: string, newStatus: JobStatus) => void;
}

const statuses: JobStatus[] = ['applied', 'interviewing', 'offer', 'closed'];

export function KanbanBoard({ jobs, onJobClick, onJobStatusChange }: KanbanBoardProps) {
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const jobsByStatus = statuses.reduce((acc, status) => {
    acc[status] = jobs.filter(job => job.status === status);
    return acc;
  }, {} as Record<JobStatus, Job[]>);

  const handleDragStart = (event: DragStartEvent) => {
    const job = jobs.find(j => j.id === event.active.id);
    if (job) setActiveJob(job);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);
    
    if (!over) return;

    const jobId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    if (statuses.includes(overId as JobStatus)) {
      const job = jobs.find(j => j.id === jobId);
      if (job && job.status !== overId && onJobStatusChange) {
        onJobStatusChange(jobId, overId as JobStatus);
      }
      return;
    }

    // Check if dropped on another job (infer column from that job)
    const overJob = jobs.find(j => j.id === overId);
    if (overJob) {
      const job = jobs.find(j => j.id === jobId);
      if (job && job.status !== overJob.status && onJobStatusChange) {
        onJobStatusChange(jobId, overJob.status);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
      
      <DragOverlay>
        {activeJob ? (
          <div className="w-[280px]">
            <DraggableJobCard job={activeJob} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
