import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Job } from '@/types/job';

const STORAGE_KEY = 'career-pilot-jobs';

interface ImportJobsDialogProps {
  onImportComplete: () => void;
}

export function ImportJobsDialog({ onImportComplete }: ImportJobsDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [localJobs, setLocalJobs] = useState<Job[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const checkLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const jobs = JSON.parse(stored) as Job[];
        setLocalJobs(jobs);
        return jobs;
      }
    } catch (e) {
      console.error('Failed to read localStorage:', e);
    }
    setLocalJobs([]);
    return [];
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      checkLocalStorage();
      setImportStatus('idle');
    }
    setOpen(isOpen);
  };

  const handleImport = async () => {
    if (!user || localJobs.length === 0) return;

    setImporting(true);
    try {
      // Transform jobs to database format (cast stages to Json for Supabase)
      const dbJobs = localJobs.map(job => ({
        user_id: user.id,
        company_name: job.companyName,
        role_title: job.roleTitle,
        location: job.location,
        status: job.status,
        job_link: job.jobLink || null,
        source: job.source,
        interest_level: job.interestLevel,
        career_fit_notes: job.careerFitNotes || null,
        current_stage: job.currentStage || null,
        next_action: job.nextAction || null,
        stages: JSON.parse(JSON.stringify(job.stages)), // Convert to plain JSON
      }));

      const { error } = await supabase
        .from('jobs')
        .insert(dbJobs);

      if (error) {
        console.error('Import error:', error);
        setImportStatus('error');
        toast.error('Failed to import jobs: ' + error.message);
        return;
      }

      // Clear localStorage after successful import
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('career-pilot-jobs-version');
      
      setImportStatus('success');
      toast.success(`Successfully imported ${localJobs.length} jobs!`);
      onImportComplete();
      
      // Close dialog after a delay
      setTimeout(() => {
        setOpen(false);
      }, 1500);
    } catch (e) {
      console.error('Import error:', e);
      setImportStatus('error');
      toast.error('Failed to import jobs');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="w-4 h-4" />
          Import Local Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Import Jobs from Local Storage</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {importStatus === 'success' ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
              <p className="text-lg font-medium">Import Complete!</p>
              <p className="text-sm text-muted-foreground">
                {localJobs.length} jobs have been imported to your account.
              </p>
            </div>
          ) : importStatus === 'error' ? (
            <div className="flex flex-col items-center py-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-lg font-medium">Import Failed</p>
              <p className="text-sm text-muted-foreground">
                There was an error importing your jobs. Please try again.
              </p>
              <Button onClick={handleImport} className="mt-4" disabled={importing}>
                Retry Import
              </Button>
            </div>
          ) : localJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No jobs found in local storage.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Found <span className="font-semibold text-foreground">{localJobs.length}</span> jobs in local storage:
              </p>
              
              <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-lg p-3">
                {localJobs.map((job, index) => (
                  <div key={index} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                    <div>
                      <span className="font-medium">{job.companyName}</span>
                      <span className="text-muted-foreground ml-2">- {job.roleTitle}</span>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{job.status}</span>
                  </div>
                ))}
              </div>

              <p className="text-sm text-amber-600 dark:text-amber-400">
                ⚠️ This will import all jobs to your account and clear the local storage data.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Import {localJobs.length} Jobs
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
