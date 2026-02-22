import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Download, RefreshCw, Workflow } from "lucide-react";

const WORKFLOW_PROMPT = `绘制 OfferMind Agent 2（Role Debrief）n8n 风格工作流图

请绘制一个 n8n 风格的 AI Agent 工作流图，节点和连线规则如下：

节点定义（共 7 个）：

1. Trigger：用户在 Analytics 页面点击"Generate Role Debrief"
2. Collector：收集该 Job 下所有已分析的面试轮次数据（questions + reflection），来源为 Agent 1 的输出
3. Context Builder：拼装上下文（Company Name, Role Title, Round Count, 每轮的问题列表 + 反思）
4. AI Node: generate-role-debrief：Gemini 3 Flash Preview, Temperature 0.7, Max Tokens 4000
5. JSON Parser：去除 markdown 代码围栏，解析 JSON
6. Schema Validator：验证输出包含 interviewerMapping / competencyHeatmap / keyInsights / hiringLikelihood / nextBestActions / roleSummary
7. Output：返回完整 RoleDebrief 对象（附加 jobId, generatedAt, sourceRoundIds 等元数据）

连线关系：
Trigger → Collector → Context Builder → AI Node → JSON Parser → Schema Validator → Output

输出结构标注（在 AI Node 旁标注）：
- interviewerMapping: 每轮面试官背景 + 关注维度
- competencyHeatmap: 10 维能力评分（1-5）
- keyInsights: 公司关注点 / 优势 / 风险
- hiringLikelihood: Low / Medium / High + 置信度
- nextBestActions: 优先级排序的行动建议

视觉要求：
- AI Node 用醒目颜色高亮（如橙色或紫色），标注模型名"Gemini 3 Flash Preview"和温度"T=0.7"
- Collector 节点标注"N rounds"表示多轮输入
- 在 Trigger 上方标注前置条件："需要 ≥ 1 轮 Agent 1 分析结果"
- 整体从左到右水平排列，线性流程，无分支
- 使用 n8n 的标准节点样式：圆角矩形，带图标，节点间用带箭头的连线连接
- 背景为浅色（白色或浅灰），节点有轻微阴影
- 整体为专业的技术架构图风格`;

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
