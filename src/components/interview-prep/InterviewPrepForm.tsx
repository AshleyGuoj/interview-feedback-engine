import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Briefcase, MessageSquare, Sparkles } from "lucide-react";

interface InterviewPrepFormProps {
  onSubmit: (data: { resume: string; jobDescription: string; interviewNotes: string }) => void;
  isLoading: boolean;
}

export function InterviewPrepForm({ onSubmit, isLoading }: InterviewPrepFormProps) {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ resume, jobDescription, interviewNotes });
  };

  const isValid = resume.trim() && jobDescription.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5 text-primary" />
            Job Description
          </CardTitle>
          <CardDescription>
            Paste the full job description to analyze role requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            className="min-h-[180px] resize-y"
            required
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Your Resume
          </CardTitle>
          <CardDescription>
            Paste your resume to identify strengths and potential weak points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your resume content here..."
            className="min-h-[180px] resize-y"
            required
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
            Interview Experience Notes
            <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
          </CardTitle>
          <CardDescription>
            Paste interview experiences from Xiaohongshu, Niuke, or other platforms to identify patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={interviewNotes}
            onChange={(e) => setInterviewNotes(e.target.value)}
            placeholder="Paste interview experience notes here (optional)..."
            className="min-h-[140px] resize-y"
          />
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        className="w-full h-12 text-base font-medium"
        disabled={!isValid || isLoading}
      >
        {isLoading ? (
          <>
            <Sparkles className="mr-2 h-5 w-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Interview Preparation
          </>
        )}
      </Button>
    </form>
  );
}
