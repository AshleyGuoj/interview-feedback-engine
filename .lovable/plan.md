

# 在产品核心文档中补充 Strict JSON Schema 和 Bounded Scoring 的技术实现细节

## 现状

文档中 4.5 节（第 151-152 行）和 4.6 节（第 160-163 行）已经提到了这两个概念，但只是一句话概述，缺少具体的技术实现细节。用户希望把"到底怎么做的"写清楚。

## 修改方案

### 修改 1：扩展 4.5 节防幻觉表格中的 Strict JSON Schema 行（第 151 行）

在表格下方新增一个展开说明小节 **"Strict JSON Schema 实现细节"**，包含：

- 每个 AI Agent 在 System Prompt 中预定义了精确的 JSON 输出结构（举例：`analyze-transcript` 要求 `{ questions: [...], reflection: {...}, metadata: {...} }`）
- 后端解析后做结构验证：`if (!analysisResult.questions || !analysisResult.reflection) { throw new Error(...) }`，不合规直接报错拒绝
- 前端用 TypeScript 类型（`ExtractedQuestion`, `AnalyzedReflection` 等）做二次约束，字段名、类型、枚举值全部固定
- 一句话总结：**Prompt 定义结构 → 后端验证合规 → 前端类型约束，三层保证输出稳定性**

### 修改 2：扩展 4.5 节防幻觉表格中的 Bounded Scoring 行（第 152 行）

在上面小节之后新增 **"Bounded Scoring 实现细节"**，包含：

- 具体枚举值列表：
  - `difficulty: 1 | 2 | 3 | 4 | 5`（整数，非浮点）
  - `responseQuality: 'high' | 'medium' | 'low'`
  - `overallFeeling: 'great' | 'good' | 'neutral' | 'poor' | 'bad'`
- 这些是有限离散值，模型无法输出 `3.7` 或 `"pretty good"` 这样的模糊结果
- 每个值在 prompt 中配有评分标准（rubric），明确对应行为描述
- 一句话总结：**Schema 控制输出结构，Bounded Scoring 控制评分精度，两者共同限制模型的自由发挥空间**

## 技术细节

- 仅修改 `docs/OfferMind-Product-Core-Structure.md` 一个文件
- 在第 154 行（表格结束后、4.6 节之前）插入两个展开说明小节
- 不涉及代码或数据库变更

