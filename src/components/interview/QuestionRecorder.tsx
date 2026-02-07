import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InterviewQuestion, QUESTION_CATEGORIES } from '@/types/job';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  ThumbsUp, 
  ThumbsDown, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Star,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface QuestionRecorderProps {
  questions: InterviewQuestion[];
  onChange: (questions: InterviewQuestion[]) => void;
  readOnly?: boolean;
}

export function QuestionRecorder({ questions, onChange, readOnly = false }: QuestionRecorderProps) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<InterviewQuestion>>({
    category: 'behavioral',
    difficulty: 3,
    wasAsked: true,
  });

  const handleAddQuestion = () => {
    if (!newQuestion.question?.trim()) return;
    
    const question: InterviewQuestion = {
      id: `q-${Date.now()}`,
      question: newQuestion.question.trim(),
      category: newQuestion.category || 'other',
      myAnswer: newQuestion.myAnswer,
      idealAnswer: newQuestion.idealAnswer,
      difficulty: newQuestion.difficulty || 3,
      wasAsked: newQuestion.wasAsked ?? true,
      answeredWell: newQuestion.answeredWell,
      tags: newQuestion.tags,
    };
    
    onChange([...questions, question]);
    setNewQuestion({ category: 'behavioral', difficulty: 3, wasAsked: true });
    setIsAddingNew(false);
  };

  const handleUpdateQuestion = (id: string, updates: Partial<InterviewQuestion>) => {
    onChange(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const handleDeleteQuestion = (id: string) => {
    onChange(questions.filter(q => q.id !== id));
  };

  const getCategoryLabel = (category: InterviewQuestion['category']) => {
    return t(`questionCategory.${category}`);
  };

  const getCategoryConfig = (category: InterviewQuestion['category']) => {
    return QUESTION_CATEGORIES[category];
  };

  const renderDifficultyStars = (difficulty: number, onChange?: (d: number) => void) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={cn(
              'w-3.5 h-3.5 transition-colors',
              star <= difficulty ? 'text-amber-500 fill-amber-500' : 'text-muted',
              onChange && 'cursor-pointer hover:text-amber-400'
            )}
            onClick={() => onChange?.(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            {t('questionRecorder.title')}
            <Badge variant="secondary" className="text-xs">
              {t('questionRecorder.count', { count: questions.length })}
            </Badge>
          </CardTitle>
          {!readOnly && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAddingNew(true)}
              className="gap-1"
            >
              <Plus className="w-3 h-3" />
              {t('questionRecorder.addQuestion')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* New Question Form */}
        {isAddingNew && (
          <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder={t('questionRecorder.inputPlaceholder')}
                value={newQuestion.question || ''}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{t('questionRecorder.category')}</label>
                <Select
                  value={newQuestion.category}
                  onValueChange={(v) => setNewQuestion(prev => ({ 
                    ...prev, 
                    category: v as InterviewQuestion['category'] 
                  }))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(QUESTION_CATEGORIES).map((key) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        {t(`questionCategory.${key}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{t('questionRecorder.difficulty')}</label>
                <div className="h-8 flex items-center">
                  {renderDifficultyStars(newQuestion.difficulty || 3, (d) => 
                    setNewQuestion(prev => ({ ...prev, difficulty: d as 1|2|3|4|5 }))
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{t('questionRecorder.howAnswered')}</label>
                <div className="h-8 flex items-center gap-2">
                  <Button
                    variant={newQuestion.answeredWell === true ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setNewQuestion(prev => ({ ...prev, answeredWell: true }))}
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant={newQuestion.answeredWell === false ? 'destructive' : 'outline'}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setNewQuestion(prev => ({ ...prev, answeredWell: false }))}
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">{t('questionRecorder.myAnswerOptional')}</label>
              <Textarea
                placeholder={t('questionRecorder.myAnswerPlaceholder')}
                value={newQuestion.myAnswer || ''}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, myAnswer: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsAddingNew(false)}>
                {t('questionRecorder.cancel')}
              </Button>
              <Button size="sm" onClick={handleAddQuestion} disabled={!newQuestion.question?.trim()}>
                {t('questionRecorder.save')}
              </Button>
            </div>
          </div>
        )}

        {/* Question List */}
        {questions.length === 0 && !isAddingNew ? (
          <div className="text-center py-8 text-muted-foreground">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('questionRecorder.emptyTitle')}</p>
            <p className="text-xs">{t('questionRecorder.emptyDescription')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {questions.map((q) => {
              const categoryConfig = getCategoryConfig(q.category);
              const isExpanded = expandedId === q.id;
              
              return (
                <Collapsible key={q.id} open={isExpanded} onOpenChange={() => setExpandedId(isExpanded ? null : q.id)}>
                  <div className={cn(
                    'border rounded-lg transition-all',
                    isExpanded && 'ring-1 ring-primary/20'
                  )}>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                'text-xs',
                                categoryConfig.color === 'blue' && 'border-blue-300 text-blue-700 bg-blue-50',
                                categoryConfig.color === 'purple' && 'border-purple-300 text-purple-700 bg-purple-50',
                                categoryConfig.color === 'green' && 'border-green-300 text-green-700 bg-green-50',
                                categoryConfig.color === 'orange' && 'border-orange-300 text-orange-700 bg-orange-50',
                                categoryConfig.color === 'pink' && 'border-pink-300 text-pink-700 bg-pink-50',
                                categoryConfig.color === 'gray' && 'border-gray-300 text-gray-700 bg-gray-50',
                              )}
                            >
                              {getCategoryLabel(q.category)}
                            </Badge>
                            {renderDifficultyStars(q.difficulty)}
                            {q.answeredWell === true && (
                              <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                            {q.answeredWell === false && (
                              <ThumbsDown className="w-3.5 h-3.5 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm font-medium">{q.question}</p>
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
                        {q.myAnswer && (
                          <div className="space-y-1 pt-3">
                            <label className="text-xs text-muted-foreground">{t('questionRecorder.myAnswer')}</label>
                            <p className="text-sm bg-muted/50 p-2 rounded">{q.myAnswer}</p>
                          </div>
                        )}
                        {q.idealAnswer && (
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">{t('questionRecorder.idealAnswer')}</label>
                            <p className="text-sm bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded text-emerald-800 dark:text-emerald-200">
                              {q.idealAnswer}
                            </p>
                          </div>
                        )}
                        
                        {!readOnly && (
                          <div className="flex justify-end pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive h-7"
                              onClick={() => handleDeleteQuestion(q.id)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              {t('questionRecorder.delete')}
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
