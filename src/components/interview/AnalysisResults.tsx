import { AnalysisResult } from "@/types/interview";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Building2, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  FileCheck, 
  Lightbulb,
  BookOpen,
  ArrowLeft,
  Copy,
  CheckCircle2,
  XCircle,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

export function AnalysisResults({ result, onReset }: AnalysisResultsProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleCheckItem = (index: number) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleCopyToClipboard = () => {
    const text = formatResultAsText(result);
    navigator.clipboard.writeText(text);
    toast.success("Analysis copied to clipboard!");
  };

  const getSignalBadgeVariant = (signal: string) => {
    switch (signal) {
      case "Strong":
        return "default";
      case "Medium":
        return "secondary";
      case "Weak":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case "Strong":
        return <CheckCircle2 className="h-4 w-4" />;
      case "Medium":
        return <Target className="h-4 w-4" />;
      case "Weak":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="ghost" onClick={onReset} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Analyze Another Interview
        </Button>
        <Button variant="outline" onClick={handleCopyToClipboard} className="gap-2">
          <Copy className="h-4 w-4" />
          Copy to Clipboard
        </Button>
      </div>

      {/* Overview Card */}
      <Card className="border-border/50 shadow-lg overflow-hidden">
        <div className="gradient-primary h-2" />
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{result.overview.company}</CardTitle>
                <CardDescription className="text-base">{result.overview.role}</CardDescription>
              </div>
            </div>
            <Badge 
              variant={getSignalBadgeVariant(result.overview.signalStrength)}
              className="text-sm px-3 py-1 gap-1"
            >
              {getSignalIcon(result.overview.signalStrength)}
              {result.overview.signalStrength} Signal
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium text-foreground">Round:</span>
              {result.overview.round || "Not specified"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium text-foreground">Focus:</span>
              {result.overview.interviewFocus}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Strengths */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <CardTitle className="text-lg">Key Strengths</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.keyStrengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-3 animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Key Risks & Gaps */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <CardTitle className="text-lg">Key Risks & Gaps</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.keyRisksAndGaps.map((risk, index) => (
              <li key={index} className="flex items-start gap-3 animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Resume & JD Alignment */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileCheck className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Resume & JD Alignment Notes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">What Worked</h4>
            <ul className="space-y-2">
              {result.alignmentNotes.whatWorked.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Underused or Missing</h4>
            <ul className="space-y-2">
              {result.alignmentNotes.underusedOrMissing.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Repositioning Advice</h4>
            <ul className="space-y-2">
              {result.alignmentNotes.repositioningAdvice.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Next Round Preparation */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Next Round Preparation Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Likely Question Areas</h4>
            <div className="flex flex-wrap gap-2">
              {result.nextRoundPreparation.likelyQuestionAreas.map((area, index) => (
                <Badge key={index} variant="secondary">{area}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">Preparation Checklist</h4>
            <ul className="space-y-3">
              {result.nextRoundPreparation.preparationChecklist.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Checkbox
                    id={`prep-${index}`}
                    checked={checkedItems.has(index)}
                    onCheckedChange={() => toggleCheckItem(index)}
                  />
                  <label
                    htmlFor={`prep-${index}`}
                    className={`text-sm cursor-pointer ${checkedItems.has(index) ? "line-through text-muted-foreground" : ""}`}
                  >
                    {item}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Recommended Stories/Projects</h4>
            <ul className="space-y-2">
              {result.nextRoundPreparation.recommendedStories.map((story, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{story}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Reusable Insights */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Reusable Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Company Preferences</h4>
            <ul className="space-y-2">
              {result.reusableInsights.companyPreferences.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Lessons for Future Interviews</h4>
            <ul className="space-y-2">
              {result.reusableInsights.lessonsForFuture.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Lightbulb className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatResultAsText(result: AnalysisResult): string {
  return `
# Interview Analysis Summary

## 1. Interview Overview
- Company: ${result.overview.company}
- Role: ${result.overview.role}
- Round: ${result.overview.round || "Not specified"}
- Interview Focus: ${result.overview.interviewFocus}
- Signal Strength: ${result.overview.signalStrength}

## 2. Key Strengths
${result.keyStrengths.map((s) => `• ${s}`).join("\n")}

## 3. Key Risks & Gaps
${result.keyRisksAndGaps.map((r) => `• ${r}`).join("\n")}

## 4. Resume & JD Alignment Notes

### What Worked
${result.alignmentNotes.whatWorked.map((w) => `• ${w}`).join("\n")}

### Underused or Missing
${result.alignmentNotes.underusedOrMissing.map((u) => `• ${u}`).join("\n")}

### Repositioning Advice
${result.alignmentNotes.repositioningAdvice.map((r) => `• ${r}`).join("\n")}

## 5. Next Round Preparation Plan

### Likely Question Areas
${result.nextRoundPreparation.likelyQuestionAreas.map((q) => `• ${q}`).join("\n")}

### Preparation Checklist
${result.nextRoundPreparation.preparationChecklist.map((p) => `☐ ${p}`).join("\n")}

### Recommended Stories/Projects
${result.nextRoundPreparation.recommendedStories.map((s) => `• ${s}`).join("\n")}

## 6. Reusable Insights

### Company Preferences
${result.reusableInsights.companyPreferences.map((c) => `• ${c}`).join("\n")}

### Lessons for Future Interviews
${result.reusableInsights.lessonsForFuture.map((l) => `• ${l}`).join("\n")}
`.trim();
}
