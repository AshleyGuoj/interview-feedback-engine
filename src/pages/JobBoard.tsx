import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KanbanBoard } from '@/components/jobs/KanbanBoard';
import { AddJobDialog } from '@/components/jobs/AddJobDialog';
import { Job } from '@/types/job';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Real job application data
const sampleJobs: Job[] = [
  {
    id: '1',
    companyName: '字节跳动',
    roleTitle: 'AI Project Management',
    location: 'CN',
    status: 'closed',
    source: 'other',
    interestLevel: 4,
    currentStage: 'Round 2',
    nextAction: '三面挂',
    careerFitNotes: '一面HR+两面业务',
    stages: [
      { id: '1-0', name: 'Applied', status: 'completed' },
      { id: '1-1', name: 'HR Screen', status: 'completed' },
      { id: '1-2', name: 'Round 1', status: 'completed' },
      { id: '1-3', name: 'Round 2', status: 'completed' },
      { id: '1-4', name: 'Final Round', status: 'skipped' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    companyName: 'Boss直聘',
    roleTitle: '海外产品经理',
    location: 'CN',
    status: 'offer',
    source: 'boss',
    interestLevel: 5,
    currentStage: 'Offer Discussion',
    nextAction: '✅ 已OC',
    careerFitNotes: '共四面（三面业务+一面语言）',
    stages: [
      { id: '2-0', name: 'Applied', status: 'completed' },
      { id: '2-1', name: 'HR Screen', status: 'completed' },
      { id: '2-2', name: 'Round 1', status: 'completed' },
      { id: '2-3', name: 'Round 2', status: 'completed' },
      { id: '2-4', name: 'Round 3', status: 'completed' },
      { id: '2-5', name: 'Language Test', status: 'completed' },
      { id: '2-6', name: 'Offer Discussion', status: 'completed' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    companyName: 'DeepWisdom',
    roleTitle: 'Agent产品经理',
    location: 'CN',
    status: 'offer',
    source: 'other',
    interestLevel: 4,
    currentStage: 'Offer Discussion',
    nextAction: '已OC但无HC',
    careerFitNotes: '两面业务+一面HR',
    stages: [
      { id: '3-0', name: 'Applied', status: 'completed' },
      { id: '3-1', name: 'Round 1', status: 'completed' },
      { id: '3-2', name: 'Round 2', status: 'completed' },
      { id: '3-3', name: 'HR Screen', status: 'completed' },
      { id: '3-4', name: 'Offer Discussion', status: 'completed' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    companyName: '群核科技',
    roleTitle: 'Agent策略产品',
    location: 'CN',
    status: 'closed',
    source: 'other',
    interestLevel: 3,
    currentStage: 'Round 1',
    nextAction: '一面横向一周挂',
    careerFitNotes: '一面业务',
    stages: [
      { id: '4-0', name: 'Applied', status: 'completed' },
      { id: '4-1', name: 'Round 1', status: 'completed' },
      { id: '4-2', name: 'Round 2', status: 'skipped' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    companyName: 'Shopee',
    roleTitle: '产品经理',
    location: 'CN',
    status: 'interviewing',
    source: 'other',
    interestLevel: 4,
    currentStage: 'Round 1',
    nextAction: '约一面',
    stages: [
      { id: '5-0', name: 'Applied', status: 'completed' },
      { id: '5-1', name: 'Round 1', status: 'upcoming' },
      { id: '5-2', name: 'Round 2', status: 'upcoming' },
      { id: '5-3', name: 'Final Round', status: 'upcoming' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    companyName: '美的',
    roleTitle: 'AI产品经理',
    location: 'CN',
    status: 'interviewing',
    source: 'other',
    interestLevel: 3,
    currentStage: 'AI Interview',
    nextAction: '一面AI面试',
    stages: [
      { id: '6-0', name: 'Applied', status: 'completed' },
      { id: '6-1', name: 'AI Interview', status: 'upcoming' },
      { id: '6-2', name: 'Round 1', status: 'upcoming' },
      { id: '6-3', name: 'Round 2', status: 'upcoming' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
