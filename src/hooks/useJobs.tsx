import { useState, useEffect } from 'react';
import { Job, InterviewStage, DEFAULT_STAGES } from '@/types/job';
import { toast } from 'sonner';

const STORAGE_KEY = 'career-pilot-jobs';
const STORAGE_VERSION_KEY = 'career-pilot-jobs-version';
const CURRENT_VERSION = 2; // Increment this when initial data changes
// Initial sample data
const initialJobs: Job[] = [
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
    nextAction: '一面 1/20 14:00 (北京)',
    stages: [
      { id: '5-0', name: 'Applied', status: 'completed' },
      { 
        id: '5-1', 
        name: 'Round 1', 
        status: 'upcoming',
        scheduledTime: '2026-01-20T14:00:00',
        scheduledTimezone: 'Asia/Shanghai',
      },
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
    nextAction: 'AI面试截止 1/16 23:59 (北京)',
    stages: [
      { id: '6-0', name: 'Applied', status: 'completed' },
      { 
        id: '6-1', 
        name: 'AI Interview', 
        status: 'upcoming',
        deadline: '2026-01-16T23:59:00',
        deadlineTimezone: 'Asia/Shanghai',
      },
      { id: '6-2', name: 'Round 1', status: 'upcoming' },
      { id: '6-3', name: 'Round 2', status: 'upcoming' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function loadJobs(): Job[] {
  try {
    const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
    // If version mismatch or no version, use initial data
    if (!storedVersion || parseInt(storedVersion) < CURRENT_VERSION) {
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION.toString());
      return initialJobs;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load jobs from localStorage:', e);
  }
  return initialJobs;
}

function saveJobs(jobs: Job[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch (e) {
    console.error('Failed to save jobs to localStorage:', e);
  }
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>(() => loadJobs());
  const [loading, setLoading] = useState(false);

  // Save to localStorage whenever jobs change
  useEffect(() => {
    saveJobs(jobs);
  }, [jobs]);

  const addJob = async (newJob: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    const stages = newJob.stages.length > 0 
      ? newJob.stages 
      : DEFAULT_STAGES.map((s, i) => ({ ...s, id: `stage-${Date.now()}-${i}` }));

    const job: Job = {
      ...newJob,
      id: `job-${Date.now()}`,
      stages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setJobs(prev => [job, ...prev]);
    toast.success('Job added');
    return job;
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    setJobs(prev => prev.map(job => 
      job.id === id ? { ...job, ...updates, updatedAt: new Date().toISOString() } : job
    ));
    toast.success('Job updated');
  };

  const deleteJob = async (id: string) => {
    setJobs(prev => prev.filter(job => job.id !== id));
    toast.success('Job deleted');
  };

  const getJob = (id: string) => jobs.find(job => job.id === id);

  return { jobs, loading, addJob, updateJob, deleteJob, getJob };
}
