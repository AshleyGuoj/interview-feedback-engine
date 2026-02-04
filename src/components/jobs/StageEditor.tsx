import { useState } from 'react';
import { InterviewStage } from '@/types/job';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, GripVertical, X, Pencil, Check, Settings, Sparkles } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Recommended stage suggestions
const STAGE_SUGGESTIONS = [
  { name: 'Phone Screen', nameZh: '电话面试' },
  { name: 'Technical Round', nameZh: '技术面' },
  { name: 'Behavioral Round', nameZh: '行为面' },
  { name: 'System Design', nameZh: '系统设计' },
  { name: 'Coding Interview', nameZh: '代码面试' },
  { name: 'Case Study', nameZh: '案例分析' },
  { name: 'Manager Round', nameZh: 'Manager面' },
  { name: 'HR Round', nameZh: 'HR面' },
  { name: 'Team Fit', nameZh: '团队匹配' },
  { name: 'Final Round', nameZh: '终面' },
  { name: 'Offer Discussion', nameZh: 'Offer谈判' },
];

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

  const handleAddStage = (stageName?: string) => {
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
      status: 'upcoming',
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

  // Filter out suggestions that are already added
  const availableSuggestions = STAGE_SUGGESTIONS.filter(
    suggestion => !localStages.some(
      s => s.name.toLowerCase() === suggestion.name.toLowerCase() || 
           s.name.toLowerCase() === suggestion.nameZh.toLowerCase()
    )
  );

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
            拖拽排序，点击编辑重命名，或添加新阶段
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
                <span>快速添加常用阶段</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableSuggestions.map((suggestion) => (
                  <Badge
                    key={suggestion.name}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-2 py-1"
                    onClick={() => handleAddStage(suggestion.name)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {suggestion.nameZh}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="输入自定义阶段名称..."
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
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
