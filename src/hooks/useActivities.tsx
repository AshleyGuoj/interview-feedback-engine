import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Activity {
  id: string;
  jobId: string;
  type: 'interview_scheduled' | 'stage_completed' | 'status_changed' | 'offer_received' | 'stage_updated';
  message: string;
  metadata: Record<string, any>;
  createdAt: string;
}

interface ActivityInput {
  jobId: string;
  type: Activity['type'];
  message: string;
  metadata?: Record<string, any>;
}

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchActivities = useCallback(async () => {
    if (!user) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('recent_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        jobId: row.job_id,
        type: row.type,
        message: row.message,
        metadata: row.metadata || {},
        createdAt: row.created_at,
      }));

      setActivities(mapped);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const addActivity = useCallback(async (input: ActivityInput) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('recent_activities')
        .insert({
          user_id: user.id,
          job_id: input.jobId,
          type: input.type,
          message: input.message,
          metadata: input.metadata || {},
        });

      if (error) throw error;

      // Optimistically add to local state
      const newActivity: Activity = {
        id: crypto.randomUUID(),
        jobId: input.jobId,
        type: input.type,
        message: input.message,
        metadata: input.metadata || {},
        createdAt: new Date().toISOString(),
      };

      setActivities(prev => [newActivity, ...prev]);
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  }, [user]);

  return {
    activities,
    loading,
    addActivity,
    refetch: fetchActivities,
  };
}
