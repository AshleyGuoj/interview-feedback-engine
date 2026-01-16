import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Job, InterviewStage, DEFAULT_STAGES, JobStatus, JobSource } from '@/types/job';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

// Convert database row to Job type
function rowToJob(row: {
  id: string;
  user_id: string;
  company_name: string;
  role_title: string;
  location: string;
  status: string;
  job_link: string | null;
  source: string;
  interest_level: number;
  career_fit_notes: string | null;
  current_stage: string | null;
  next_action: string | null;
  stages: Json;
  created_at: string;
  updated_at: string;
}): Job {
  return {
    id: row.id,
    companyName: row.company_name,
    roleTitle: row.role_title,
    location: row.location as Job['location'],
    status: row.status as JobStatus,
    jobLink: row.job_link ?? undefined,
    source: row.source as JobSource,
    interestLevel: row.interest_level as Job['interestLevel'],
    careerFitNotes: row.career_fit_notes ?? undefined,
    currentStage: row.current_stage ?? undefined,
    nextAction: row.next_action ?? undefined,
    stages: (row.stages as unknown as InterviewStage[]) || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchJobs();
    } else {
      setJobs([]);
      setLoading(false);
    }
  }, [user]);

  const fetchJobs = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } else if (data) {
      setJobs(data.map(rowToJob));
    }
    setLoading(false);
  };

  const addJob = async (newJob: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      toast.error('You must be logged in to add jobs');
      return null;
    }

    const stages = newJob.stages.length > 0 
      ? newJob.stages 
      : DEFAULT_STAGES.map((s, i) => ({ ...s, id: `stage-${Date.now()}-${i}` }));

    const { data, error } = await supabase
      .from('jobs')
      .insert([{
        user_id: user.id,
        company_name: newJob.companyName,
        role_title: newJob.roleTitle,
        location: newJob.location,
        status: newJob.status,
        job_link: newJob.jobLink || null,
        source: newJob.source,
        interest_level: newJob.interestLevel,
        career_fit_notes: newJob.careerFitNotes || null,
        current_stage: newJob.currentStage || null,
        next_action: newJob.nextAction || null,
        stages: stages as unknown as Json,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding job:', error);
      toast.error('Failed to add job');
      return null;
    }

    if (!data) {
      toast.error('Failed to add job');
      return null;
    }

    const job = rowToJob(data);
    setJobs(prev => [job, ...prev]);
    toast.success('Job added successfully');
    return job;
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    if (!user) return;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName;
    if (updates.roleTitle !== undefined) dbUpdates.role_title = updates.roleTitle;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.jobLink !== undefined) dbUpdates.job_link = updates.jobLink || null;
    if (updates.source !== undefined) dbUpdates.source = updates.source;
    if (updates.interestLevel !== undefined) dbUpdates.interest_level = updates.interestLevel;
    if (updates.careerFitNotes !== undefined) dbUpdates.career_fit_notes = updates.careerFitNotes || null;
    if (updates.currentStage !== undefined) dbUpdates.current_stage = updates.currentStage || null;
    if (updates.nextAction !== undefined) dbUpdates.next_action = updates.nextAction || null;
    if (updates.stages !== undefined) dbUpdates.stages = updates.stages;

    const { error } = await supabase
      .from('jobs')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
      return;
    }

    setJobs(prev => prev.map(job => 
      job.id === id ? { ...job, ...updates, updatedAt: new Date().toISOString() } : job
    ));
    toast.success('Job updated');
  };

  const deleteJob = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
      return;
    }

    setJobs(prev => prev.filter(job => job.id !== id));
    toast.success('Job deleted');
  };

  return { jobs, loading, addJob, updateJob, deleteJob, refetch: fetchJobs };
}
