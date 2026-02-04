import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Job, InterviewStage, DEFAULT_STAGES, JobStatus, InterviewingSubStatus, OfferSubStatus, ClosedReason, RiskTag } from '@/types/job';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Transform database row to Job type
function dbToJob(row: any): Job {
  // Parse stages JSON which may contain extended fields
  const stagesData = row.stages || [];
  
  // Extract extended fields from stages metadata if stored there
  // (for backward compatibility with existing data structure)
  const metadata = stagesData._metadata || {};
  
  return {
    id: row.id,
    companyName: row.company_name,
    roleTitle: row.role_title,
    location: row.location as Job['location'],
    status: row.status as Job['status'],
    jobLink: row.job_link || undefined,
    source: row.source as Job['source'],
    interestLevel: row.interest_level as Job['interestLevel'],
    careerFitNotes: row.career_fit_notes || undefined,
    currentStage: row.current_stage || undefined,
    nextAction: row.next_action || undefined,
    stages: Array.isArray(stagesData) ? stagesData as InterviewStage[] : (stagesData.list || []) as InterviewStage[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Extended fields from metadata
    subStatus: metadata.subStatus as InterviewingSubStatus | OfferSubStatus | undefined,
    closedReason: metadata.closedReason as ClosedReason | undefined,
    riskTags: metadata.riskTags as RiskTag[] | undefined,
    lastContactDate: metadata.lastContactDate as string | undefined,
  };
}

// Transform Job to database row
function jobToDb(job: Partial<Job>, userId: string) {
  const result: any = { user_id: userId };
  
  if (job.companyName !== undefined) result.company_name = job.companyName;
  if (job.roleTitle !== undefined) result.role_title = job.roleTitle;
  if (job.location !== undefined) result.location = job.location;
  if (job.status !== undefined) result.status = job.status;
  if (job.jobLink !== undefined) result.job_link = job.jobLink || null;
  if (job.source !== undefined) result.source = job.source;
  if (job.interestLevel !== undefined) result.interest_level = job.interestLevel;
  if (job.careerFitNotes !== undefined) result.career_fit_notes = job.careerFitNotes || null;
  if (job.currentStage !== undefined) result.current_stage = job.currentStage || null;
  if (job.nextAction !== undefined) result.next_action = job.nextAction || null;
  
  // Store stages with metadata for extended fields
  if (job.stages !== undefined || job.subStatus !== undefined || job.closedReason !== undefined || job.riskTags !== undefined || job.lastContactDate !== undefined) {
    result.stages = {
      list: job.stages || [],
      _metadata: {
        subStatus: job.subStatus,
        closedReason: job.closedReason,
        riskTags: job.riskTags,
        lastContactDate: job.lastContactDate,
      }
    };
  }
  
  return result;
}

/**
 * Derive job status from interview stages
 * Priority: closed (manual) > offer (from stages) > interviewing > applied
 */
export function deriveJobStatusFromStages(stages: InterviewStage[], currentStatus: JobStatus): JobStatus {
  // Closed is a terminal state, only changeable manually
  if (currentStatus === 'closed') {
    return currentStatus;
  }
  
  // Check if offer stage is completed - this takes priority
  const offerStageCompleted = stages.some(
    s => s.status === 'completed' && 
         (s.name.toLowerCase().includes('offer') || s.name.toLowerCase() === 'offer discussion')
  );
  
  if (offerStageCompleted) {
    return 'offer';
  }
  
  // If current status is offer (manually set), keep it unless we need to derive
  if (currentStatus === 'offer') {
    return currentStatus;
  }
  
  // Check for interview activity
  const hasInterviewActivity = stages.some(
    s => (s.status === 'upcoming' || s.status === 'completed') && 
         s.name.toLowerCase() !== 'applied'
  );
  
  if (hasInterviewActivity) {
    return 'interviewing';
  }
  
  return currentStatus;
}

interface JobsContextType {
  jobs: Job[];
  loading: boolean;
  addJob: (newJob: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Job | null>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  getJob: (id: string) => Job | undefined;
  refetch: () => Promise<void>;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    if (!user) {
      setJobs([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to load jobs');
        return;
      }

      setJobs(data?.map(dbToJob) || []);
    } catch (e) {
      console.error('Error fetching jobs:', e);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const addJob = async (newJob: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      toast.error('Please sign in to add jobs');
      return null;
    }

    const stages = newJob.stages.length > 0 
      ? newJob.stages 
      : DEFAULT_STAGES.map((s, i) => ({ ...s, id: `stage-${Date.now()}-${i}` }));

    const dbData = {
      ...jobToDb({ ...newJob, stages }, user.id),
    };

    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('Error adding job:', error);
        toast.error('Failed to add job');
        return null;
      }

      const job = dbToJob(data);
      setJobs(prev => [job, ...prev]);
      toast.success('Job added');
      return job;
    } catch (e) {
      console.error('Error adding job:', e);
      toast.error('Failed to add job');
      return null;
    }
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    if (!user) {
      toast.error('Please sign in to update jobs');
      return;
    }

    // Optimistic update - immediately update local state
    setJobs(prev => prev.map(job => 
      job.id === id ? { ...job, ...updates, updatedAt: new Date().toISOString() } : job
    ));

    const dbData = jobToDb(updates, user.id);
    delete dbData.user_id;

    try {
      const { error } = await supabase
        .from('jobs')
        .update(dbData)
        .eq('id', id);

      if (error) {
        console.error('Error updating job:', error);
        toast.error('Failed to update job');
        await fetchJobs();
        return;
      }

      toast.success('Job updated');
    } catch (e) {
      console.error('Error updating job:', e);
      toast.error('Failed to update job');
      await fetchJobs();
    }
  };

  const deleteJob = async (id: string) => {
    if (!user) {
      toast.error('Please sign in to delete jobs');
      return;
    }

    setJobs(prev => prev.filter(job => job.id !== id));

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting job:', error);
        toast.error('Failed to delete job');
        await fetchJobs();
        return;
      }

      toast.success('Job deleted');
    } catch (e) {
      console.error('Error deleting job:', e);
      toast.error('Failed to delete job');
      await fetchJobs();
    }
  };

  const getJob = (id: string) => jobs.find(job => job.id === id);

  return (
    <JobsContext.Provider value={{ jobs, loading, addJob, updateJob, deleteJob, getJob, refetch: fetchJobs }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
}
