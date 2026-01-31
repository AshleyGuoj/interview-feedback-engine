import { useState } from 'react';
import { StoryMaterial } from '@/types/job';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  BookOpen, 
  Trash2,
  ChevronDown,
  ChevronUp,
  Star,
  Building2,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface StoryLibraryProps {
  stories: StoryMaterial[];
  onChange: (stories: StoryMaterial[]) => void;
  selectedStoryIds?: string[];
  onSelectStory?: (storyId: string) => void;
  mode?: 'manage' | 'select';
}

export function StoryLibrary({ 
  stories, 
  onChange, 
  selectedStoryIds = [], 
  onSelectStory,
  mode = 'manage' 
}: StoryLibraryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStory, setNewStory] = useState<Partial<StoryMaterial>>({
    skills: [],
  });

  const handleAddStory = () => {
    if (!newStory.title?.trim() || !newStory.situation?.trim()) return;
    
    const story: StoryMaterial = {
      id: `story-${Date.now()}`,
      title: newStory.title.trim(),
      situation: newStory.situation.trim(),
      task: newStory.task?.trim() || '',
      action: newStory.action?.trim() || '',
      result: newStory.result?.trim() || '',
      metrics: newStory.metrics?.trim(),
      skills: newStory.skills || [],
      effectiveness: 'medium',
    };
    
    onChange([...stories, story]);
    setNewStory({ skills: [] });
    setIsAddDialogOpen(false);
  };

  const handleDeleteStory = (id: string) => {
    onChange(stories.filter(s => s.id !== id));
  };

  const handleSkillsChange = (value: string) => {
    const skills = value.split(/[,，]/).map(s => s.trim()).filter(Boolean);
    setNewStory(prev => ({ ...prev, skills }));
  };

  const getEffectivenessConfig = (eff?: 'high' | 'medium' | 'low') => {
    switch (eff) {
      case 'high': return { label: '效果很好', color: 'emerald' };
      case 'medium': return { label: '效果一般', color: 'amber' };
      case 'low': return { label: '效果不佳', color: 'red' };
      default: return { label: '未评估', color: 'gray' };
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            故事素材库
            <Badge variant="secondary" className="text-xs">
              {stories.length} 个故事
            </Badge>
          </CardTitle>
          {mode === 'manage' && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Plus className="w-3 h-3" />
                  添加故事
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>添加STAR故事</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">故事标题 *</label>
                    <Input
                      placeholder="例如：主导XX系统重构项目"
                      value={newStory.title || ''}
                      onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Situation（背景）*</label>
                    <Textarea
                      placeholder="描述当时的背景和情境..."
                      value={newStory.situation || ''}
                      onChange={(e) => setNewStory(prev => ({ ...prev, situation: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Task（任务）</label>
                    <Textarea
                      placeholder="你需要完成的任务或目标..."
                      value={newStory.task || ''}
                      onChange={(e) => setNewStory(prev => ({ ...prev, task: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Action（行动）</label>
                    <Textarea
                      placeholder="你采取了哪些具体行动..."
                      value={newStory.action || ''}
                      onChange={(e) => setNewStory(prev => ({ ...prev, action: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Result（结果）</label>
                    <Textarea
                      placeholder="最终的结果是什么..."
                      value={newStory.result || ''}
                      onChange={(e) => setNewStory(prev => ({ ...prev, result: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">量化指标</label>
                    <Input
                      placeholder="例如：性能提升50%，成本降低30%"
                      value={newStory.metrics || ''}
                      onChange={(e) => setNewStory(prev => ({ ...prev, metrics: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">相关技能（逗号分隔）</label>
                    <Input
                      placeholder="例如：系统设计, 团队协作, 项目管理"
                      value={newStory.skills?.join(', ') || ''}
                      onChange={(e) => handleSkillsChange(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>
                      取消
                    </Button>
                    <Button 
                      onClick={handleAddStory}
                      disabled={!newStory.title?.trim() || !newStory.situation?.trim()}
                    >
                      保存故事
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {stories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无故事素材</p>
            <p className="text-xs">整理你的STAR故事，面试时随时调用</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stories.map((story) => {
              const isExpanded = expandedId === story.id;
              const isSelected = selectedStoryIds.includes(story.id);
              const effConfig = getEffectivenessConfig(story.effectiveness);
              
              return (
                <Collapsible 
                  key={story.id} 
                  open={isExpanded} 
                  onOpenChange={() => setExpandedId(isExpanded ? null : story.id)}
                >
                  <div className={cn(
                    'border rounded-lg transition-all',
                    isExpanded && 'ring-1 ring-primary/20',
                    isSelected && 'bg-primary/5 border-primary/30'
                  )}>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                        {mode === 'select' && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              onSelectStory?.(story.id);
                            }}
                            className="mt-1"
                          />
                        )}
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{story.title}</span>
                            {story.usedInCompanies && story.usedInCompanies.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Building2 className="w-3 h-3" />
                                {story.usedInCompanies.length}家公司使用
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {story.skills.slice(0, 3).map(skill => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {story.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{story.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-3 pb-3 pt-0 border-t space-y-3">
                        <div className="grid gap-3 pt-3 text-sm">
                          <div>
                            <span className="text-xs font-medium text-blue-600">S - 背景</span>
                            <p className="mt-1">{story.situation}</p>
                          </div>
                          {story.task && (
                            <div>
                              <span className="text-xs font-medium text-green-600">T - 任务</span>
                              <p className="mt-1">{story.task}</p>
                            </div>
                          )}
                          {story.action && (
                            <div>
                              <span className="text-xs font-medium text-amber-600">A - 行动</span>
                              <p className="mt-1">{story.action}</p>
                            </div>
                          )}
                          {story.result && (
                            <div>
                              <span className="text-xs font-medium text-purple-600">R - 结果</span>
                              <p className="mt-1">{story.result}</p>
                            </div>
                          )}
                          {story.metrics && (
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded">
                              <Star className="w-4 h-4" />
                              <span>{story.metrics}</span>
                            </div>
                          )}
                        </div>
                        
                        {mode === 'manage' && (
                          <div className="flex justify-end pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive h-7"
                              onClick={() => handleDeleteStory(story.id)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              删除
                            </Button>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
