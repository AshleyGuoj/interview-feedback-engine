import { useState } from 'react';
import { InterviewStage, InterviewQuestion, InterviewReflection } from '@/types/job';
import { QuestionRecorder } from './QuestionRecorder';
import { ReflectionEditor } from './ReflectionEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Lightbulb, BookOpen } from 'lucide-react';

interface StageDetailEditorProps {
  stage: InterviewStage;
  onUpdate: (updates: Partial<InterviewStage>) => void;
  readOnly?: boolean;
}

export function StageDetailEditor({ stage, onUpdate, readOnly = false }: StageDetailEditorProps) {
  const [activeTab, setActiveTab] = useState('questions');

  const handleQuestionsChange = (questions: InterviewQuestion[]) => {
    onUpdate({ questions });
  };

  const handleReflectionChange = (reflection: InterviewReflection) => {
    onUpdate({ reflection });
  };

  const questionCount = stage.questions?.length || 0;
  const hasReflection = stage.reflection && (
    stage.reflection.whatWentWell.length > 0 || 
    stage.reflection.whatCouldImprove.length > 0 ||
    stage.reflection.keyTakeaways.length > 0
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="questions" className="gap-2">
          <MessageSquare className="w-4 h-4" />
          问题记录
          {questionCount > 0 && (
            <Badge variant="secondary" className="text-xs h-5 px-1.5">
              {questionCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="reflection" className="gap-2">
          <Lightbulb className="w-4 h-4" />
          反思复盘
          {hasReflection && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="questions" className="mt-4">
        <QuestionRecorder
          questions={stage.questions || []}
          onChange={handleQuestionsChange}
          readOnly={readOnly}
        />
      </TabsContent>
      
      <TabsContent value="reflection" className="mt-4">
        <ReflectionEditor
          reflection={stage.reflection}
          onChange={handleReflectionChange}
          readOnly={readOnly}
        />
      </TabsContent>
    </Tabs>
  );
}
