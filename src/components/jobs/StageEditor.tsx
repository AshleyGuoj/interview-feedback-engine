import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InterviewStage, StageCategory, STAGE_CATEGORY_CONFIG, detectStageCategory } from '@/types/job';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, GripVertical, X, Pencil, Check, Settings, Sparkles } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Recommended stage suggestions with i18n keys and default categories
const STAGE_SUGGESTIONS = [
  { nameKey: 'jobs.stagePhoneScreen', fallback: 'Phone Screen', category: 'hr_chat' as StageCategory },
  { nameKey: 'jobs.stageTechnicalRound', fallback: 'Technical Round', category: 'interview' as StageCategory },
  { nameKey: 'jobs.stageBehavioralRound', fallback: 'Behavioral Round', category: 'interview' as StageCategory },
  { nameKey: 'jobs.stageSystemDesign', fallback: 'System Design', category: 'interview' as StageCategory },
  { nameKey: 'jobs.stageCodingInterview', fallback: 'Coding Interview', category: 'interview' as StageCategory },
  { nameKey: 'jobs.stageCaseStudy', fallback: 'Case Study', category: 'interview' as StageCategory },
  { nameKey: 'jobs.stageManagerRound', fallback: 'Manager Round', category: 'interview' as StageCategory },
  { nameKey: 'jobs.stageHrRound', fallback: 'HR Round', category: 'hr_chat' as StageCategory },
  { nameKey: 'jobs.stageTeamFit', fallback: 'Team Fit', category: 'interview' as StageCategory },
  { nameKey: 'jobs.stageFinalRound', fallback: 'Final Round', category: 'interview' as StageCategory },
  { nameKey: 'jobs.stageOfferDiscussion', fallback: 'Offer Discussion', category: 'offer_call' as StageCategory },
];

interface StageEditorProps {
  stages: InterviewStage[];
  onSave: (stages: InterviewStage[]) => void;
}

interface SortableStageItemProps {
  stage: InterviewStage;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onCategoryChange: (id: string, category: StageCategory) => void;
}

const CATEGORY_COLORS: Record<StageCategory, string> = {
  application: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  resume_screen: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  assessment: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  written_test: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  interview: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  hr_chat: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  offer_call: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  offer_received: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

function SortableStageItem({ stage, onEdit, onDelete, onCategoryChange }: SortableStageItemProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(stage.name);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    if (editName.trim()) {
      onEdit(stage.id, editName.trim());
      setIsEditing(false);
    }
  };

  // Get localized status label
  const getStatusLabel = (status: string) => {
    const statusKey = `jobs.stageStatus${status.charAt(0).toUpperCase() + status.slice(1).replace('_', '')}` as const;
    return t(statusKey, status);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-2 bg-background border rounded-md",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      
      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="h-8 text-sm"
            autoFocus
          />
          <Button size="sm" variant="ghost" onClick={handleSave}>
            <Check className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <>
          <span className="flex-1 text-sm truncate">{stage.name}</span>
          <Select
            value={stage.category || detectStageCategory(stage.name)}
            onValueChange={(val) => onCategoryChange(stage.id, val as StageCategory)}
          >
            <SelectTrigger className={cn(
              "h-6 w-auto min-w-[80px] max-w-[120px] text-[10px] border-0 px-2 py-0 gap-1 font-medium rounded-full",
              CATEGORY_COLORS[stage.category || detectStageCategory(stage.name)]
            )}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STAGE_CATEGORY_CONFIG) as StageCategory[]).map(cat => (
                <SelectItem key={cat} value={cat} className="text-xs">
                  {t(`stageCategory.${cat}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
            <Pencil className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(stage.id)} className="text-destructive hover:text-destructive">
            <X className="w-3 h-3" />
          </Button>
        </>
      )}
    </div>
  );
}

export function StageEditor({ stages, onSave }: StageEditorProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [localStages, setLocalStages] = useState<InterviewStage[]>(stages);
  const [newStageName, setNewStageName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setLocalStages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleEdit = (id: string, name: string) => {
    setLocalStages((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name, category: detectStageCategory(name) } : s))
    );
  };

  const handleCategoryChange = (id: string, category: StageCategory) => {
    setLocalStages((prev) =>
      prev.map((s) => (s.id === id ? { ...s, category } : s))
    );
  };

  const handleDelete = (id: string) => {
    if (localStages.length <= 1) return; // Keep at least one stage
    setLocalStages((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddStage = (stageName?: string, stageCategory?: StageCategory) => {
    const nameToAdd = stageName || newStageName.trim();
    if (!nameToAdd) return;
    
    // Check if stage with similar name already exists
    const exists = localStages.some(
      s => s.name.toLowerCase() === nameToAdd.toLowerCase()
    );
    if (exists) return;
    
    const newStage: InterviewStage = {
      id: `stage-${Date.now()}`,
      name: nameToAdd,
      status: 'pending',
      category: stageCategory || detectStageCategory(nameToAdd),
    };
    setLocalStages((prev) => [...prev, newStage]);
    if (!stageName) setNewStageName('');
  };

  const handleSave = () => {
    onSave(localStages);
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setLocalStages(stages);
    }
    setOpen(isOpen);
  };

  // Get translated stage names for suggestions
  const getTranslatedSuggestions = () => {
    return STAGE_SUGGESTIONS.map(s => ({
      name: t(s.nameKey, s.fallback),
      key: s.nameKey,
      category: s.category,
    }));
  };

  // Filter out suggestions that are already added
  const availableSuggestions = getTranslatedSuggestions().filter(
    suggestion => !localStages.some(
      s => s.name.toLowerCase() === suggestion.name.toLowerCase()
    )
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          {t('jobs.customizeStages')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('jobs.customizeStagesTitle')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            {t('jobs.customizeStagesHint')}
          </p>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localStages.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {localStages.map((stage) => (
                  <SortableStageItem
                    key={stage.id}
                    stage={stage}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCategoryChange={handleCategoryChange}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Quick add suggestions */}
          {availableSuggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                <span>{t('jobs.quickAddStages')}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableSuggestions.map((suggestion) => (
                  <Badge
                    key={suggestion.key}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-2 py-1"
                    onClick={() => handleAddStage(suggestion.name, suggestion.category)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {suggestion.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder={t('jobs.customStagePlaceholder')}
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
            />
            <Button onClick={() => handleAddStage()} disabled={!newStageName.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave}>{t('common.save')}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
