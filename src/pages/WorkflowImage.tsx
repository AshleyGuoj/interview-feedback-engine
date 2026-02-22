import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Download, RefreshCw, Workflow } from "lucide-react";

const WORKFLOW_PROMPT = `Draw an n8n-style workflow diagram titled "OfferMind Agent 2 — Role Debrief".

Linear left-to-right flow with 4 nodes connected by arrows:

1. Trigger (green) — "Generate Role Debrief". Label above: "Precondition: ≥1 completed Agent 1 analysis"
2. Collector (gray) — "Collects all analyzed interview rounds under same job". Badge: "N rounds"
3. Context Builder (gray) — bullet list: Company Name, Role Title, Round Count, Questions list, Reflections
4. AI Node (dark purple, highlighted) — "generate-role-debrief", badge: "Gemini 3 Flash | Temp: 0.7", label below: "Max: 4000 Tokens"
5. Output (dark gray) — "Return Complete Debrief object", metadata: jobId, generatedAt, sourceRoundIds

Next to AI Node, show Output Structure box:
• interviewerMapping: interviewer background + evaluation focus per round
• competencyHeatmap: 10-dimension scores (1–5)
• keyInsights: company priorities / strengths / risks
• hiringLikelihood: Low/Medium/High + confidence
• nextBestActions: prioritized action recommendations

Style: clean white background, rounded rectangle nodes with subtle shadows, arrow connectors, professional technical diagram.`;

export default function WorkflowImage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "generate-workflow-image",
        { body: { prompt: WORKFLOW_PROMPT } }
      );

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      if (data?.imageUrl) {
        setImageUrl(data.imageUrl);
        toast.success("工作流图生成成功！");
      } else {
        throw new Error("未能生成图片");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "生成失败";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "agent2-role-debrief-workflow.png";
    link.click();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Agent 2 工作流图生成器</h1>
          <p className="text-muted-foreground text-sm">
            使用 AI 生成 Role Debrief Agent 的 n8n 风格工作流图
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                生成中...
              </>
            ) : imageUrl ? (
              <>
                <RefreshCw className="w-4 h-4" />
                重新生成
              </>
            ) : (
              <>
                <Workflow className="w-4 h-4" />
                生成工作流图
              </>
            )}
          </Button>
          {imageUrl && (
            <Button variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              下载图片
            </Button>
          )}
        </div>

        {error && (
          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              正在调用 AI 生成工作流图，预计需要 15-30 秒...
            </p>
          </div>
        )}

        {imageUrl && !isGenerating && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Agent 2 (Role Debrief) n8n 工作流图
              </CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={imageUrl}
                alt="Agent 2 Role Debrief Workflow"
                className="w-full rounded-lg border"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
