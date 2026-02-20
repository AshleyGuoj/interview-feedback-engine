
# 修复：保存后部分内容变成英文的问题

## 根本原因分析

**不是 UI 标签的问题**——分类名（"行为面试"等）、"表现良好"、"面试重点"等 UI 标签都是走 i18n 翻译键的，语言没问题。

真正的问题在于 **AI 生成的自然语言内容本身**：`question`、`evaluationFocus`、`qualityReasoning`、`tags` 这些字段的文本是 AI 直接写入、原样保存到数据库的。当语言设为中文时，部分字段仍然被 AI 以英文生成，原因如下：

### 原因 1：JSON schema 字段描述是英文，形成"上下文暗示"

在 `supabase/functions/analyze-transcript/index.ts` 的系统提示中，JSON 结构里每个字段的描述本身是英文：

```json
{
  "question": "string - the core question asked",       // ← 英文描述
  "myAnswerSummary": "string - brief summary of how the candidate answered",  // ← 英文描述
  "evaluationFocus": "string - what the interviewer was really testing",      // ← 英文描述
  "qualityReasoning": "string - why this quality rating",                     // ← 英文描述
  "tags": ["string array of relevant skills/topics"]                          // ← 英文描述
}
```

即便告诉 AI "必须用中文"，这些英文字段描述会在生成时造成语言"漂移"，AI 倾向于模仿描述的语言来填充内容。

### 原因 2：`tags` 字段没有中文示例，AI 默认生成英文标签

`tags` 字段的描述是 `"string array of relevant skills/topics"`，没有中文示例，Gemini 通常会输出英文标签（如 `"Product Sense"`, `"Leadership"`, `"System Design"`），这是最容易出现中英混杂的字段。

### 原因 3：语言强制指令位置不够突出

当前提示把 `IMPORTANT` 放在靠前的位置，但 JSON schema 内部没有在每个文本字段旁边重复强调语言要求，AI 容易在生成长 JSON 时"遗忘"语言约束。

---

## 修复方案

### 改动 1：强化 `analyze-transcript` edge function 的语言锁定

**`supabase/functions/analyze-transcript/index.ts`**

1. 将 JSON schema 里每个文本字段的英文描述**替换为对应语言的描述**（根据 `isEnglish` 动态切换）
2. 在 `tags` 字段旁边明确举例：中文时给出中文示例（如 `"产品思维", "领导力"`），英文时给出英文示例
3. 在系统提示最末尾**再次重复**语言强制要求，并在 JSON schema 内部添加 `// MUST BE IN [LANGUAGE]` 注释
4. 在 user prompt 末尾的语言提醒从一行改为加粗的多行强调

具体修改位置：`getSystemPrompt` 函数（lines 9-73），让 schema 描述随语言切换：

```ts
const getSystemPrompt = (language: string) => {
  const isEnglish = language === 'en';
  const langLabel = isEnglish ? 'English' : '中文';
  
  // JSON schema 里的字段描述也根据语言切换
  const questionDesc = isEnglish 
    ? 'string - the core question asked (in English)'
    : 'string - 面试官提问的核心问题（必须用中文）';
  const answerDesc = isEnglish
    ? 'string - brief summary of how the candidate answered (in English)'
    : 'string - 候选人回答的简要总结（必须用中文）';
  // ... 其余字段同理
  const tagsExample = isEnglish
    ? '["Product Sense", "Leadership", "Data Analysis"]'
    : '["产品思维", "领导力", "数据分析"]';
  
  return `... (同语言要求的系统提示) ...`;
};
```

---

## 需要修改的文件

| 文件 | 修改内容 |
|---|---|
| `supabase/functions/analyze-transcript/index.ts` | 强化语言锁定：JSON schema 字段描述随语言切换；`tags` 加中文示例；末尾重复强调语言规则 |

## 改动范围

- 只修改 edge function 的系统提示文本，不改数据结构
- 不影响已保存的历史数据
- 不需要修改任何前端代码或数据库 schema
- 部署后立即生效（新分析才会产生全中文输出）

## 预期效果

修复后，当语言设为中文时，AI 生成的所有文本内容（问题文本、答案摘要、面试重点、原因分析、标签）都将以中文输出，保存后不会再出现中英文混杂现象。
