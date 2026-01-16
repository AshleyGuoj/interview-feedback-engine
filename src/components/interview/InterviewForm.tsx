import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InterviewInput } from "@/types/interview";
import { Upload, FileText, Briefcase, Calendar, Sparkles, X } from "lucide-react";

interface InterviewFormProps {
  onSubmit: (data: InterviewInput) => void;
  isLoading: boolean;
}

const INTERVIEW_TYPES = [
  "Product Sense",
  "Technical",
  "Behavioral",
  "System Design",
  "Case Study",
  "Culture Fit",
  "Leadership",
  "Analytical",
];

const ROUND_OPTIONS = [
  "Phone Screen",
  "Recruiter Call",
  "Hiring Manager",
  "Technical Round 1",
  "Technical Round 2",
  "Final Round",
  "Panel Interview",
  "On-site",
  "Other",
];

export function InterviewForm({ onSubmit, isLoading }: InterviewFormProps) {
  const [formData, setFormData] = useState<InterviewInput>({
    company: "",
    role: "",
    round: "",
    interviewDate: "",
    interviewType: [],
    interviewContent: "",
    jobDescription: "",
    resume: "",
  });

  const handleTypeToggle = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      interviewType: prev.interviewType.includes(type)
        ? prev.interviewType.filter((t) => t !== type)
        : [...prev.interviewType, type],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isValid = formData.company && formData.role && formData.interviewContent;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Interview Details Card */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Interview Details</CardTitle>
              <CardDescription>Basic information about your interview</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                placeholder="e.g., Google, Meta, Stripe"
                value={formData.company}
                onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role Title *</Label>
              <Input
                id="role"
                placeholder="e.g., Senior Product Manager"
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                className="bg-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="round">Interview Round</Label>
              <Select
                value={formData.round}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, round: value }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select round" />
                </SelectTrigger>
                <SelectContent>
                  {ROUND_OPTIONS.map((round) => (
                    <SelectItem key={round} value={round}>
                      {round}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Interview Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.interviewDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, interviewDate: e.target.value }))}
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Interview Focus Areas</Label>
            <div className="flex flex-wrap gap-2">
              {INTERVIEW_TYPES.map((type) => (
                <Badge
                  key={type}
                  variant={formData.interviewType.includes(type) ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => handleTypeToggle(type)}
                >
                  {type}
                  {formData.interviewType.includes(type) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interview Content Card */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Interview Content *</CardTitle>
              <CardDescription>Paste your notes, transcript, or bullet points from the interview</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your interview notes here. Include:
• Questions asked and your answers
• Topics discussed
• Any feedback received
• Your impressions and observations

The more detail you provide, the better the analysis will be."
            value={formData.interviewContent}
            onChange={(e) => setFormData((prev) => ({ ...prev, interviewContent: e.target.value }))}
            className="min-h-[200px] bg-background resize-y"
          />
        </CardContent>
      </Card>

      {/* Optional Context Card */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Additional Context (Optional)</CardTitle>
              <CardDescription>Add your job description and resume for deeper alignment analysis</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="jd" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="jd">Job Description</TabsTrigger>
              <TabsTrigger value="resume">Resume/CV</TabsTrigger>
            </TabsList>
            <TabsContent value="jd" className="mt-4">
              <Textarea
                placeholder="Paste the job description here for alignment analysis..."
                value={formData.jobDescription}
                onChange={(e) => setFormData((prev) => ({ ...prev, jobDescription: e.target.value }))}
                className="min-h-[150px] bg-background resize-y"
              />
            </TabsContent>
            <TabsContent value="resume" className="mt-4">
              <Textarea
                placeholder="Paste relevant sections from your resume/CV here..."
                value={formData.resume}
                onChange={(e) => setFormData((prev) => ({ ...prev, resume: e.target.value }))}
                className="min-h-[150px] bg-background resize-y"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        disabled={!isValid || isLoading}
        className="w-full gradient-primary text-primary-foreground shadow-lg hover:shadow-glow transition-all duration-300"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Analyzing Interview...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Analyze Interview
          </span>
        )}
      </Button>
    </form>
  );
}
