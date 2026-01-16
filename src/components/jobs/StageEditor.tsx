import { useState } from 'react';
import { InterviewStage } from '@/types/job';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, GripVertical, X, Pencil, Check, Settings } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface StageEditorProps {
  stages: InterviewStage[];
  onSave: (stages: InterviewStage[]) => void;
}

interface SortableStageItemProps {
  stage: InterviewStage;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

function SortableStageItem({ stage, onEdit, onDelete }: SortableStageItemProps) {
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
          <span className="flex-1 text-sm">{stage.name}</span>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            stage.status === 'completed' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
            stage.status === 'upcoming' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            stage.status === 'skipped' && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
          )}>
            {stage.status}
          </span>
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
      prev.map((s) => (s.id === id ? { ...s, name } : s))
    );
  };

  const handleDelete = (id: string) => {
    if (localStages.length <= 1) return; // Keep at least one stage
    setLocalStages((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddStage = () => {
    if (!newStageName.trim()) return;
    const newStage: InterviewStage = {
      id: `stage-${Date.now()}`,
      name: newStageName.trim(),
      status: 'upcoming',
    };
    setLocalStages((prev) => [...prev, newStage]);
    setNewStageName('');
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Customize Stages
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Customize Interview Stages</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Drag to reorder, click pencil to rename, or add new stages.
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
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {localStages.map((stage) => (
                  <SortableStageItem
                    key={stage.id}
                    stage={stage}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex gap-2">
            <Input
              placeholder="New stage name..."
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
            />
            <Button onClick={handleAddStage} disabled={!newStageName.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
