import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KanbanBoard } from '@/components/jobs/KanbanBoard';
import { AddJobDialog } from '@/components/jobs/AddJobDialog';
import { ImportJobsDialog } from '@/components/jobs/ImportJobsDialog';
import { Job, JobStatus } from '@/types/job';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useJobs } from '@/hooks/useJobs';

export default function JobBoard() {
  const navigate = useNavigate();
  const { jobs, addJob, updateJob, refetch } = useJobs();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = jobs.filter(job => 
    job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.roleTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddJob = async (newJob: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addJob(newJob);
  };

  const handleJobClick = (job: Job) => {
    navigate(`/jobs/${job.id}`);
  };

  const handleJobStatusChange = async (jobId: string, newStatus: JobStatus) => {
    await updateJob(jobId, { status: newStatus });
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Job Board</h1>
            <p className="text-muted-foreground mt-1">
              Track your applications across {jobs.length} positions
            </p>
          </div>
          <div className="flex gap-2">
            <ImportJobsDialog onImportComplete={refetch} />
            <AddJobDialog onAdd={handleAddJob} />
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Kanban Board */}
        <KanbanBoard 
          jobs={filteredJobs} 
          onJobClick={handleJobClick} 
          onJobStatusChange={handleJobStatusChange}
        />
      </div>
    </DashboardLayout>
  );
}
