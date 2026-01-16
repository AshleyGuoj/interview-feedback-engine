import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KanbanBoard } from '@/components/jobs/KanbanBoard';
import { AddJobDialog } from '@/components/jobs/AddJobDialog';
import { Job } from '@/types/job';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Sample data for demonstration
const sampleJobs: Job[] = [
  {
    id: '1',
    companyName: 'Google',
    roleTitle: 'Senior Product Manager',
    location: 'US',
    status: 'interviewing',
    source: 'linkedin',
    interestLevel: 5,
    currentStage: 'Round 2',
    nextAction: 'Prepare case study',
    stages: [
      { id: 's1', name: 'Applied', status: 'completed', date: '2024-01-10' },
      { id: 's2', name: 'HR Screen', status: 'completed', date: '2024-01-15' },
      { id: 's3', name: 'Round 1', status: 'completed', date: '2024-01-22' },
      { id: 's4', name: 'Round 2', status: 'upcoming' },
      { id: 's5', name: 'Final Round', status: 'upcoming' },
      { id: 's6', name: 'Offer Discussion', status: 'upcoming' },
    ],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-22',
  },
  {
    id: '2',
    companyName: 'ByteDance',
    roleTitle: 'Product Lead',
    location: 'CN',
    status: 'interviewing',
    source: 'boss',
    interestLevel: 4,
    currentStage: 'HR Screen',
    nextAction: 'Schedule call',
    stages: [
      { id: 's1', name: 'Applied', status: 'completed', date: '2024-01-18' },
      { id: 's2', name: 'HR Screen', status: 'upcoming' },
      { id: 's3', name: 'Round 1', status: 'upcoming' },
      { id: 's4', name: 'Round 2', status: 'upcoming' },
      { id: 's5', name: 'Final Round', status: 'upcoming' },
      { id: 's6', name: 'Offer Discussion', status: 'upcoming' },
    ],
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18',
  },
  {
    id: '3',
    companyName: 'Stripe',
    roleTitle: 'Product Manager, Payments',
    location: 'Remote',
    status: 'applied',
    source: 'referral',
    interestLevel: 5,
    currentStage: 'Applied',
    nextAction: 'Wait for response',
    stages: [
      { id: 's1', name: 'Applied', status: 'completed', date: '2024-01-20' },
      { id: 's2', name: 'HR Screen', status: 'upcoming' },
      { id: 's3', name: 'Round 1', status: 'upcoming' },
      { id: 's4', name: 'Round 2', status: 'upcoming' },
      { id: 's5', name: 'Final Round', status: 'upcoming' },
      { id: 's6', name: 'Offer Discussion', status: 'upcoming' },
    ],
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
  },
  {
    id: '4',
    companyName: 'Airbnb',
    roleTitle: 'Staff PM',
    location: 'US',
    status: 'offer',
    source: 'linkedin',
    interestLevel: 4,
    currentStage: 'Offer Discussion',
    nextAction: 'Review offer details',
    stages: [
      { id: 's1', name: 'Applied', status: 'completed', date: '2024-01-05' },
      { id: 's2', name: 'HR Screen', status: 'completed', date: '2024-01-08' },
      { id: 's3', name: 'Round 1', status: 'completed', date: '2024-01-12' },
      { id: 's4', name: 'Round 2', status: 'completed', date: '2024-01-16' },
      { id: 's5', name: 'Final Round', status: 'completed', date: '2024-01-19' },
      { id: 's6', name: 'Offer Discussion', status: 'completed', date: '2024-01-22' },
    ],
    createdAt: '2024-01-05',
    updatedAt: '2024-01-22',
  },
  {
    id: '5',
    companyName: 'Meta',
    roleTitle: 'Product Manager',
    location: 'US',
    status: 'closed',
    source: 'website',
    interestLevel: 3,
    currentStage: 'Closed',
    stages: [
      { id: 's1', name: 'Applied', status: 'completed', date: '2024-01-02' },
      { id: 's2', name: 'HR Screen', status: 'completed', date: '2024-01-06' },
      { id: 's3', name: 'Round 1', status: 'completed', date: '2024-01-10' },
      { id: 's4', name: 'Round 2', status: 'skipped' },
      { id: 's5', name: 'Final Round', status: 'skipped' },
      { id: 's6', name: 'Offer Discussion', status: 'skipped' },
    ],
    createdAt: '2024-01-02',
    updatedAt: '2024-01-12',
  },
];

export default function JobBoard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>(sampleJobs);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = jobs.filter(job => 
    job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.roleTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddJob = (newJob: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    const job: Job = {
      ...newJob,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setJobs(prev => [...prev, job]);
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
