import { useState } from 'react';
import { Job, KanbanColumnType, KANBAN_COLUMNS, deriveKanbanColumn } from '@/types/job';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
}

export function KanbanBoard({ jobs, onJobClick }: KanbanBoardProps) {
  const jobsByColumn = KANBAN_COLUMNS.reduce((acc, col) => {
    acc[col] = [];
    return acc;
  }, {} as Record<KanbanColumnType, Job[]>);

  // Assign each job to its derived column
  jobs.forEach(job => {
    const column = deriveKanbanColumn(job);
    jobsByColumn[column].push(job);
  });

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-1">
      {KANBAN_COLUMNS.map((column) => (
        <KanbanColumn
          key={column}
          column={column}
          jobs={jobsByColumn[column]}
          onJobClick={onJobClick}
        />
      ))}
    </div>
  );
}
