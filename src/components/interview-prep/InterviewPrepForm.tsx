import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Briefcase, MessageSquare, Sparkles } from "lucide-react";
import { FileUploadInput } from "./FileUploadInput";

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
      <FileUploadInput
        title="Job Description"
        description="上传 JD 截图/PDF 或直接粘贴文本"
        icon={<Briefcase className="h-5 w-5 text-primary" />}
        value={jobDescription}
        onChange={setJobDescription}
        placeholder="粘贴 Job Description 内容..."
        required
      />

      <FileUploadInput
        title="Your Resume"
        description="上传简历图片/PDF 或直接粘贴文本"
        icon={<FileText className="h-5 w-5 text-primary" />}
        value={resume}
        onChange={setResume}
        placeholder="粘贴简历内容..."
        required
      />

      <FileUploadInput
        title="Interview Experience Notes"
        description="上传面经截图或粘贴小红书/牛客面经"
        icon={<MessageSquare className="h-5 w-5 text-primary" />}
        value={interviewNotes}
        onChange={setInterviewNotes}
        placeholder="粘贴面经内容 (可选)..."
      />

      <Button 
        type="submit" 
        className="w-full h-12 text-base font-medium"
        disabled={!isValid || isLoading}
      >
        {isLoading ? (
          <>
            <Sparkles className="mr-2 h-5 w-5 animate-spin" />
            分析中...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            生成面试准备
          </>
        )}
      </Button>
    </form>
  );
}
