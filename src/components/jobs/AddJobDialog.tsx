import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Star } from 'lucide-react';
import { Job, JobSource, DEFAULT_STAGES } from '@/types/job';
import { cn } from '@/lib/utils';

interface AddJobDialogProps {
  onAdd: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function AddJobDialog({ onAdd }: AddJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    roleTitle: '',
    location: 'US' as 'CN' | 'US' | 'Remote' | 'Other',
    jobLink: '',
    source: 'linkedin' as JobSource,
    interestLevel: 3 as 1 | 2 | 3 | 4 | 5,
    careerFitNotes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const stages = DEFAULT_STAGES.map((stage, index) => ({
      ...stage,
      id: `stage-${Date.now()}-${index}`,
    }));

    onAdd({
      ...formData,
      status: 'applied',
      currentStage: 'Applied',
      nextAction: 'Wait for response',
      stages,
    });

    setFormData({
      companyName: '',
      roleTitle: '',
      location: 'US',
      jobLink: '',
      source: 'linkedin',
      interestLevel: 3,
      careerFitNotes: '',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Job Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Google"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleTitle">Role Title *</Label>
              <Input
                id="roleTitle"
                value={formData.roleTitle}
                onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                placeholder="Senior PM"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={formData.location}
                onValueChange={(value: 'CN' | 'US' | 'Remote' | 'Other') => 
                  setFormData({ ...formData, location: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">US</SelectItem>
                  <SelectItem value="CN">China</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value: JobSource) => 
                  setFormData({ ...formData, source: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="boss">BOSS直聘</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="website">Company Website</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobLink">Job Link</Label>
            <Input
              id="jobLink"
              type="url"
              value={formData.jobLink}
              onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label>Interest Level</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, interestLevel: level as 1 | 2 | 3 | 4 | 5 })}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={cn(
                      'w-6 h-6 transition-colors',
                      level <= formData.interestLevel
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="careerFitNotes">Career Fit Notes</Label>
            <Textarea
              id="careerFitNotes"
              value={formData.careerFitNotes}
              onChange={(e) => setFormData({ ...formData, careerFitNotes: e.target.value })}
              placeholder="Why does this role interest you? How does it fit your career goals?"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Job</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
