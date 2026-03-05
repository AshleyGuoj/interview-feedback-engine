import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KanbanBoard } from '@/components/jobs/KanbanBoard';
import { AddJobDialog } from '@/components/jobs/AddJobDialog';
import { Job } from '@/types/job';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useJobs } from '@/contexts/JobsContext';
import { useActivities } from '@/hooks/useActivities';

export default function JobBoard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { jobs, addJob } = useJobs();
  const { addActivity } = useActivities();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = jobs.filter(job => 
    job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.roleTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddJob = async (newJob: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    const job = await addJob(newJob);
    if (job) {
      await addActivity({
        jobId: job.id,
        type: 'status_changed',
        message: `${job.companyName} — Application submitted for ${job.roleTitle}`,
        metadata: { status: 'applied', roleTitle: job.roleTitle }
      });
    }
  };

  const handleJobClick = (job: Job) => {
    navigate(`/jobs/${job.id}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-foreground">{t('jobs.title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('jobs.subtitle', { count: jobs.length })}
            </p>
          </div>
          <AddJobDialog onAdd={handleAddJob} />
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('jobs.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Kanban Board - data-driven by stage categories */}
        <KanbanBoard 
          jobs={filteredJobs} 
          onJobClick={handleJobClick} 
        />
      </div>
    </DashboardLayout>
  );
}
