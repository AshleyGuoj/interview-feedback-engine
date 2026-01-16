import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KanbanBoard } from '@/components/jobs/KanbanBoard';
import { AddJobDialog } from '@/components/jobs/AddJobDialog';
import { Job } from '@/types/job';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';

export default function JobBoard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { jobs, loading: jobsLoading, addJob } = useJobs();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

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

  if (authLoading || jobsLoading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading your jobs...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
          <AddJobDialog onAdd={handleAddJob} />
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
        <KanbanBoard jobs={filteredJobs} onJobClick={handleJobClick} />
      </div>
    </DashboardLayout>
  );
}
