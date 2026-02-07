# 🚀 CareerPilot — 完整平台产品需求文档 (PRD)

> **Document Version**: 1.0  
> **Last Updated**: 2026-02-07  
> **Author**: Product & AI Architecture Team  
> **Status**: Production

---

## 📋 Table of Contents

1. [产品概述](#1️⃣-产品概述)
2. [目标用户](#2️⃣-目标用户)
3. [核心价值主张](#3️⃣-核心价值主张)
4. [系统架构](#4️⃣-系统架构)
5. [功能模块详解](#5️⃣-功能模块详解)
6. [AI Agent 体系](#6️⃣-ai-agent-体系)
7. [数据模型](#7️⃣-数据模型)
8. [用户工作流](#8️⃣-用户工作流)
9. [技术栈](#9️⃣-技术栈)
10. [设计系统](#🔟-设计系统)
11. [安全与权限](#1️⃣1️⃣-安全与权限)
12. [未来规划](#1️⃣2️⃣-未来规划)

---

## 1️⃣ 产品概述

### 产品名称
**CareerPilot** — AI-First Job Search Command Center

### 一句话描述
> CareerPilot 是一个 **AI 驱动的求职指挥中心**，将凌乱的面试笔记转化为战略性职业智慧，帮助求职者从"被动求职"转向"主动掌控"。

### 产品愿景

```
┌─────────────────────────────────────────────────────────────────┐
│                       CareerPilot Vision                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FROM: 传统求职工具                                              │
│  ├─ 简单的 Kanban 看板                                          │
│  ├─ 静态的申请状态追踪                                           │
│  └─ 被动等待结果                                                 │
│                                                                 │
│  TO: 职业智慧引擎                                                │
│  ├─ 面试知识资产化 (Knowledge Assetization)                      │
│  ├─ AI 驱动的能力洞察                                            │
│  ├─ 跨岗位长期成长追踪                                           │
│  └─ 可复用的 STAR 故事库                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 核心理念：面试知识沉淀 (Interview Knowledge Assetization)

**传统求职的问题**：每次面试都是一次性事件，面试结束后只留下模糊记忆，无法系统化积累经验。

**CareerPilot 的解决方案**：将每一次面试从"一次性事件"转化为"可复用的职业资产"：
- 问题被结构化提取和分类
- 表现被量化评估
- 洞察跨时间对比
- 故事可跨公司复用

---

## 2️⃣ 目标用户

### 主要用户画像

| 用户类型 | 描述 | 核心需求 | 使用场景 |
|----------|------|----------|----------|
| **积极求职者** | 正在进行多家公司面试的候选人 | 高效管理多个申请流程，不遗漏任何机会 | 同时追踪 10+ 个申请，需要清晰的下一步行动 |
| **海外留学生** | 中美双向求职，需跨语言面试复盘 | 中英双语支持，处理 messy transcripts | 使用英文面试，但习惯用中文做笔记 |
| **职业转型者** | 从一个领域转向另一个领域 | 系统化提炼可迁移能力信号 | 从工程师转 PM，需要证明产品思维 |
| **高潜人才** | 目标是顶级科技公司的候选人 | 精准识别短板，针对性提升 | 冲刺 FAANG/顶级独角兽，每轮面试都需要最大化表现 |
| **长期用户** | 使用 CareerPilot 超过 3 个月 | 回顾成长轨迹，规划职业发展 | 定期回顾自己的能力演化趋势 |

### 用户痛点矩阵

| 痛点 | 严重程度 | 现状 | CareerPilot 解决方案 |
|------|----------|------|---------------------|
| 🔴 **面试无法复盘** | 高 | 面试结束后只有模糊记忆，无法结构化分析 | AI 自动从 transcript 提取问题、评估质量 |
| 🔴 **不知道失败原因** | 高 | 被拒后无法定位具体短板 | 能力热力图 + 风险信号识别 |
| 🔴 **无法提炼能力信号** | 高 | 面试中表现分散，难以形成系统认知 | 多轮汇总生成 Role Debrief |
| 🟡 **岗位匹配不精准** | 中 | 不清楚公司最看重什么 | Hiring Likelihood + Company Insights |
| 🟡 **重复造轮子** | 中 | 同样的 STAR 故事每次重新组织 | 可复用的 Story Library |
| 🟡 **看不到成长** | 中 | 一次次面试后不知道是否进步 | 跨岗位长期能力追踪 |
| 🟢 **多线程混乱** | 低 | 多个申请同时进行容易遗漏 | Kanban + 下一步行动提醒 |

---

## 3️⃣ 核心价值主张

### Elevator Pitch

> **CareerPilot** 是一个 **AI-first 求职指挥中心**，将凌乱的面试笔记转化为战略性职业智慧。它结合了全栈追踪能力（Kanban 看板 + 多管道分支处理 HC 冻结/内转）与三层 AI Agent 体系，生成能力热力图、预测录用可能性、追踪长期成长趋势——让每一次面试都成为可复用的职业资产。

### 价值主张画布

```
┌─────────────────────────────────────────────────────────────────┐
│                    Value Proposition Canvas                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  用户任务 (Jobs to be Done)                                      │
│  ├─ 管理多个同时进行的求职申请                                    │
│  ├─ 准备即将到来的面试                                           │
│  ├─ 复盘已完成的面试并提取经验                                    │
│  ├─ 了解自己的能力优劣势                                         │
│  └─ 做出 offer 决策时的信息支持                                  │
│                                                                 │
│  痛点 (Pains)                                                   │
│  ├─ 面试后只有模糊记忆                                           │
│  ├─ 不知道为什么被拒                                             │
│  ├─ 无法量化自己的成长                                           │
│  ├─ 同样的故事每次重新组织                                       │
│  └─ 等待结果时的焦虑无处释放                                     │
│                                                                 │
│  收益 (Gains)                                                   │
│  ├─ 清晰的能力自我认知                                           │
│  ├─ 可复用的面试素材库                                           │
│  ├─ 数据驱动的求职决策                                           │
│  ├─ 可见的成长轨迹                                               │
│  └─ 系统化的职业复盘                                             │
│                                                                 │
│  CareerPilot 解决方案                                            │
│  ├─ 💼 全栈求职追踪 (Kanban + Multi-Pipeline)                    │
│  ├─ 🧠 AI 面试分析 (Transcript → Insights)                       │
│  ├─ 📊 能力热力图 (10 维度量化评估)                               │
│  ├─ 📈 成长追踪 (跨岗位长期趋势)                                  │
│  ├─ 🎯 面试准备 (问题预测 + 模拟面试)                             │
│  └─ 📚 知识沉淀 (可复用 Story Library)                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4️⃣ 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CareerPilot System Architecture                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Frontend (React + Vite)                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │Dashboard │ │Job Board │ │ Timeline │ │Analytics │ │ Archive  │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  │  ┌──────────────────┐ ┌──────────────────┐                          │   │
│  │  │ Interview Prep   │ │ Job Detail       │                          │   │
│  │  └──────────────────┘ └──────────────────┘                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    State Management Layer                            │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │ AuthContext  │  │ JobsContext  │  │ TanStack     │               │   │
│  │  │ (Supabase)   │  │ (CRUD + Sync)│  │ Query        │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Supabase (Lovable Cloud)                        │   │
│  │                                                                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │ PostgreSQL  │  │ Auth        │  │ Storage     │  │ Edge       │  │   │
│  │  │ (jobs,      │  │ (email +    │  │ (interview- │  │ Functions  │  │   │
│  │  │  activities)│  │  session)   │  │  prep-docs) │  │ (AI Agents)│  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     AI Layer (Lovable AI Gateway)                    │   │
│  │                                                                      │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │  Model: google/gemini-3-flash-preview                        │   │   │
│  │  │  Features: Long context, Bilingual, Structured output        │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │ Transcript  │  │ Role        │  │ Career      │  │ Interview  │  │   │
│  │  │ Analyzer    │  │ Debrief     │  │ Growth      │  │ Prep       │  │   │
│  │  │ (Layer 1)   │  │ (Layer 2)   │  │ (Layer 3)   │  │ Agent      │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 页面路由结构

| 路由 | 页面 | 功能 | 权限 |
|------|------|------|------|
| `/` | Dashboard | 求职指挥中心主页 | 需登录 |
| `/auth` | Auth | 登录/注册 | 公开 |
| `/jobs` | Job Board | Kanban 看板 | 需登录 |
| `/jobs/:id` | Job Detail | 单个岗位详情 + 面试时间线 | 需登录 |
| `/timeline` | Timeline | 全局面试时间线 | 需登录 |
| `/analytics` | Analytics | AI 面试分析中心 | 需登录 |
| `/archive` | Archive | 职业成长 & 历史记录 | 需登录 |
| `/interview-prep` | Interview Prep | 面试准备 Agent | 需登录 |
| `/analyze` | Analyze Interview | 快速 Transcript 分析 | 需登录 |

---

## 5️⃣ 功能模块详解

### 5.1 Dashboard — 求职指挥中心

**功能定位**：决策驱动的"职业指挥中心"，一眼掌握求职全局。

**核心组件**：

| 组件 | 功能 | 数据来源 |
|------|------|----------|
| **Stats Grid** | 4 个关键指标：活跃申请数、面试中、已获 Offer、响应率 | 从 jobs 表派生计算 |
| **Upcoming Interviews** | 即将到来的面试列表（按时间排序） | 从 stages.scheduledTime 派生 |
| **Recent Activity** | 最近 5 条活动（状态变更、新申请等） | recent_activities 表 |
| **Quick Action CTA** | "Analyze Interview" 快捷入口 | 导航到 /analyze |

**数据派生逻辑**：
```typescript
// 活跃申请 = status !== 'closed'
const activeApplications = jobs.filter(j => j.status !== 'closed').length;

// 响应率 = (面试中 + offer + closed) / 总数
const responseRate = (interviewing + offers + closed) / jobs.length * 100;
```

**设计理念**：
- 所有数据都是"派生视图"，不存储冗余数据
- 优先展示"可行动"信息（下一步做什么）
- 采用 AI-native 的鼓励性语言

---

### 5.2 Job Board — Kanban 看板

**功能定位**：可视化管理所有求职申请的流程状态。

**核心功能**：

| 功能 | 描述 | 交互方式 |
|------|------|----------|
| **Kanban 列** | 4 个状态列：Applied / Interviewing / Offer / Closed | 拖拽移动 |
| **Job Card** | 展示公司、职位、兴趣等级、下一步行动 | 点击进入详情 |
| **快速添加** | "Add Job" 对话框 | 顶部按钮 |
| **批量导入** | 从外部导入多个申请 | Import 对话框 |
| **Pipeline 状态** | 显示当前阶段进度 | InsightStrip 组件 |

**状态定义**：

| 状态 | 定义 | 自动触发条件 |
|------|------|--------------|
| `applied` | 已投递，等待回复 | 新建 Job 默认状态 |
| `interviewing` | 有面试活动进行中 | 任何非 Applied 阶段有活动 |
| `offer` | 已收到 Offer | Offer 阶段 completed |
| `closed` | 已结束（被拒/放弃/接受） | 手动设置或所有管道终止 |

**拖拽交互**：
- 使用 `@dnd-kit` 实现流畅拖拽
- 支持跨列移动
- 自动触发状态更新

---

### 5.3 Job Detail — 岗位详情页

**功能定位**：单个岗位的完整信息视图 + 面试时间线管理。

**核心区域**：

| 区域 | 内容 | 交互 |
|------|------|------|
| **Header** | 公司名、职位、状态 Badge、兴趣星级 | 编辑基本信息 |
| **Pipeline Timeline** | 可视化面试流程（多管道支持） | 添加/编辑阶段 |
| **Stage Detail Editor** | 单个阶段的详细信息编辑 | 展开编辑 |
| **Collapsible History** | 历史管道（如 HC 冻结后的转岗） | 折叠查看 |

**多管道架构 (Multi-Pipeline Branching)**：

```
┌─────────────────────────────────────────────────────────────────┐
│  Job: Google - Product Manager                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Pipeline 1 (Primary) - PM, Search                              │
│  ├─ Applied ✓                                                   │
│  ├─ Phone Screen ✓                                              │
│  ├─ Onsite Round 1 → HC Frozen! ❄️                              │
│  └─ [Paused]                                                    │
│           │                                                     │
│           │ Transfer (hc_freeze)                                │
│           ▼                                                     │
│  Pipeline 2 (Transfer) - PM, Cloud                              │
│  ├─ (Inherited context)                                         │
│  ├─ Technical Interview ✓                                       │
│  ├─ Hiring Manager ⏳                                            │
│  └─ [Active]                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**为什么需要多管道**：
- 真实场景：HC 冻结 → 内部转岗
- 保留历史：原管道的面试记录不丢失
- AI 洞察：跨管道的能力信号可以汇总

---

### 5.4 Timeline — 全局面试时间线

**功能定位**：跨岗位的全局面试日历视图。

**核心功能**：

| 功能 | 描述 |
|------|------|
| **时间线视图** | 按时间顺序展示所有面试事件 |
| **快速筛选** | 按公司、状态筛选 |
| **Deep Link** | 点击事件跳转到 Analytics 查看分析 |
| **全局搜索** | 搜索历史问题、公司、关键词 |

**使用场景**：
- "上周我面了哪些公司？"
- "这个月有多少个面试？"
- "某公司之前问过什么问题？"

---

### 5.5 Analytics — AI 面试分析中心

**功能定位**：AI 驱动的面试智慧工作区，按职位管理所有面试记录与复盘。

**布局结构**：

```
┌─────────────────────────────────────────────────────────────────┐
│  Analytics & Insights                                            │
│  AI 面试分析中心 · 按职位管理所有面试记录与复盘                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌──────────────────────────────────────────┐  │
│  │ Job Tree    │  │                                          │  │
│  │ (Left Panel)│  │  Detail Panel (Right)                    │  │
│  │             │  │                                          │  │
│  │ ├─ Google   │  │  [面试分析] [Role Debrief]               │  │
│  │ │  ├─ R1 ✓  │  │                                          │  │
│  │ │  ├─ R2 ✓  │  │  Selected stage analysis content...      │  │
│  │ │  └─ R3    │  │                                          │  │
│  │ │           │  │                                          │  │
│  │ ├─ Meta     │  │                                          │  │
│  │ │  ├─ HR ✓  │  │                                          │  │
│  │ │  └─ Tech  │  │                                          │  │
│  │ │           │  │                                          │  │
│  │ └─ ...      │  │                                          │  │
│  └─────────────┘  └──────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**两个核心 Tab**：

| Tab | 功能 | 解锁条件 | AI Agent |
|-----|------|----------|----------|
| **面试分析** | 单轮面试的问题提取 + 反思生成 | 选中任何阶段 | Layer 1: Transcript Analyzer |
| **Role Debrief** | 多轮汇总的能力热力图 + 录用预测 | ≥2 轮已分析 | Layer 2: Role Debrief Agent |

**特性**：
- **Resizable Panels**：可拖拽调整左右面板宽度
- **Context Bar**：显示当前选中的职位/阶段
- **Empty State**：AI-native 的引导语言

---

### 5.6 Archive — 职业回顾中心

**功能定位**：从"死档存储"转变为"职业回顾中心"——回顾成长轨迹，而非仅仅查看关闭的申请。

**两个核心 Tab**：

| Tab | 功能 | 内容 |
|-----|------|------|
| **Career Growth** | 跨岗位长期能力追踪 | 趋势图表 + AI 教练建议 |
| **Closed Applications** | 历史申请列表 | 可筛选的关闭岗位表格 |

**Career Growth 解锁条件**：
```typescript
// 需要跨所有岗位累计 ≥2 个已分析的面试轮次
const isGrowthUnlocked = totalAnalyzedRounds >= 2;
```

**设计理念**：
- Archive 不是"死亡之地"，而是"成长回顾"
- 将长期分析从 Analytics 分离，保持 Analytics 聚焦当前

---

### 5.7 Interview Prep — 面试准备 Agent

**功能定位**：AI 驱动的面试问题预测 + 模拟面试。

**三步工作流**：

```
┌────────────────────────────────────────────────────────────────┐
│  Step 1: Input (Form)                                           │
│  ├─ 上传简历 (PDF/Word/Text)                                    │
│  ├─ 粘贴 JD (Job Description)                                   │
│  └─ 可选：过往面试经验笔记                                       │
├────────────────────────────────────────────────────────────────┤
│  Step 2: Analysis (AI)                                          │
│  ├─ JD 分析 (核心职责 + 关键能力)                                │
│  ├─ 候选人画像 (优势 + 潜在弱点)                                 │
│  ├─ 面试模式 (高频话题 + 公司特定模式)                           │
│  └─ 问题预测 (Top 10 最可能被问的问题)                           │
├────────────────────────────────────────────────────────────────┤
│  Step 3: Mock Interview (Chat)                                  │
│  ├─ AI 扮演面试官                                               │
│  ├─ 基于预测问题提问                                            │
│  └─ 实时反馈 + 改进建议                                         │
└────────────────────────────────────────────────────────────────┘
```

**输出结构**：

```typescript
interface InterviewPrepAnalysis {
  jdAnalysis: {
    coreResponsibilities: string[];
    keyCompetencies: string[];
    focusAreas: string[];
  };
  candidateProfile: {
    strengths: string[];
    signatureExperiences: string[];
    potentialWeakPoints: string[];
    likelyChallengeAreas: string[];
  };
  interviewPatterns: {
    highFrequencyTopics: string[];
    companySpecificPatterns: string[];
  };
  predictedQuestions: Array<{
    rank: number;
    question: string;
    whyLikely: string;
    skillTested: string;
    sourceReference: "JD" | "Resume" | "Interview Experience" | "Combined";
  }>;
}
```

---

### 5.8 Analyze Interview — 快速 Transcript 分析

**功能定位**：快速入口，直接分析面试笔记/转写，无需先创建 Job。

**使用场景**：
- 刚面完想快速记录
- 只想分析一次面试，不想添加到看板
- 测试 AI 分析效果

**与 Analytics 的区别**：
- Analyze = 快速、独立分析
- Analytics = 系统化、与 Job 关联的分析

---

## 6️⃣ AI Agent 体系

### 三层 Agent 架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    CareerPilot AI Agent Architecture             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LAYER 1: Transcript Analyzer                           │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  Input:  单轮面试 Transcript (messy, 中英混合)          │   │
│  │  Output: questions[] + reflection{}                     │   │
│  │  Trigger: 用户粘贴 transcript 并点击分析                │   │
│  │  Edge Function: analyze-transcript                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          │ Aggregation (≥2 rounds)              │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LAYER 2: Role Debrief Agent                            │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  Input:  单岗位多轮分析数据                              │   │
│  │  Output: competencyHeatmap + hiringLikelihood + actions │   │
│  │  Trigger: 用户查看 Role Debrief Tab (自动)              │   │
│  │  Edge Function: generate-role-debrief                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          │ Cross-Job Analysis (≥2 rounds total) │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LAYER 3: Career Growth Intelligence Agent              │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  Input:  跨岗位历史面试数据                              │   │
│  │  Output: competencyTrends + growthPriorities + coach    │   │
│  │  Trigger: 用户查看 Archive > Career Growth Tab          │   │
│  │  Edge Function: analyze-career-growth                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  STANDALONE: Interview Prep Agent                       │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  Input:  Resume + JD + (optional) Interview Notes       │   │
│  │  Output: predictedQuestions[] + mockInterview           │   │
│  │  Trigger: Interview Prep 页面提交                       │   │
│  │  Edge Function: interview-prep-agent                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 10 维能力评估框架

所有 AI Agent 共享同一套能力评估维度：

| 能力 | Key | 描述 | 证据来源 |
|------|-----|------|----------|
| 产品感 | `product_sense` | 产品思维与用户导向 | Product case 问题表现 |
| 执行力 | `execution` | 落地能力与实际解决方案 | Situational 问题表现 |
| 数据分析 | `analytics_metrics` | 数据驱动思维 | Metrics 相关问题 |
| 沟通能力 | `communication` | 清晰表达想法 | 整体 response quality |
| 技术深度 | `technical_depth` | 技术知识深度 | Technical 问题表现 |
| AI 能力 | `AI_skills` | AI/ML 理解与应用 | AI 相关问题表现 |
| 系统设计 | `system_design` | 系统思维与架构 | System design 问题 |
| 商业战略 | `business_strategy` | 战略思考能力 | Strategy/Case 问题 |
| 领导力 | `leadership` | 领导力与担当 | Behavioral 问题中的领导案例 |
| 抗压能力 | `stress_resilience` | 压力下的表现 | 高难度问题的 response quality |

### 模型配置

| Agent | Model | Temperature | Max Tokens | 理由 |
|-------|-------|-------------|------------|------|
| Transcript Analyzer | gemini-3-flash | 0.3 | 8000 | 低温度确保结构化输出一致性 |
| Role Debrief | gemini-3-flash | 0.7 | 4000 | 稍高温度允许更丰富的推理 |
| Career Growth | gemini-3-flash | 0.5 | 8000 | 平衡结构化输出与洞察生成 |
| Interview Prep | gemini-3-flash | 0.6 | 6000 | 需要创造性的问题预测 |

### Edge Functions 清单

| Function | 路径 | 功能 |
|----------|------|------|
| `analyze-transcript` | `/functions/v1/analyze-transcript` | Layer 1: 单轮 Transcript 分析 |
| `generate-role-debrief` | `/functions/v1/generate-role-debrief` | Layer 2: 单岗位多轮汇总 |
| `analyze-career-growth` | `/functions/v1/analyze-career-growth` | Layer 3: 跨岗位成长追踪 |
| `interview-prep-agent` | `/functions/v1/interview-prep-agent` | 面试准备 + 模拟面试 |
| `analyze-interview` | `/functions/v1/analyze-interview` | 快速分析入口 |
| `parse-document` | `/functions/v1/parse-document` | PDF/Word 文档解析 |

---

## 7️⃣ 数据模型

### 数据库表结构

```sql
-- 主表: jobs
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,  -- 多租户隔离
  
  -- 基本信息
  company_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'CN',  -- 'CN' | 'US' | 'Remote' | 'Other'
  status TEXT NOT NULL DEFAULT 'applied',  -- JobStatus
  job_link TEXT,
  source TEXT NOT NULL DEFAULT 'other',  -- JobSource
  interest_level INTEGER NOT NULL DEFAULT 3,  -- 1-5
  career_fit_notes TEXT,
  
  -- 派生字段 (可从 stages 计算)
  current_stage TEXT,
  next_action TEXT,
  
  -- 核心数据: JSONB 存储 stages + pipelines + metadata
  stages JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- 时间戳
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 活动表: recent_activities (append-only)
CREATE TABLE public.recent_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES jobs(id),
  type TEXT NOT NULL,  -- 'job_created' | 'stage_completed' | 'offer_received' | etc.
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### TypeScript 类型系统

**核心类型层次**：

```typescript
// 顶层: Job
interface Job {
  id: string;
  companyName: string;
  roleTitle: string;
  location: 'CN' | 'US' | 'Remote' | 'Other';
  status: JobStatus;
  stages: InterviewStage[];        // Legacy 单管道
  pipelines: Pipeline[];           // 新多管道架构
  // ... 其他字段
}

// 中层: Pipeline (支持 HC 冻结 -> 转岗)
interface Pipeline {
  id: string;
  type: PipelineType;              // 'primary' | 'transfer' | 'internal_move' | 'reapply'
  status: PipelineStatus;          // 'active' | 'paused' | 'completed' | 'closed'
  targetRole: string;              // 本管道对应的职位名称
  stages: InterviewStage[];
  originPipelineId?: string;       // 转岗时的来源管道
  transferReason?: TransferReason;
}

// 底层: InterviewStage (两维状态模型)
interface InterviewStage {
  id: string;
  name: string;                    // 可自定义: "HR Screen", "Technical", etc.
  status: StageStatus;             // 行为状态: pending | scheduled | completed | ...
  result?: StageResult;            // 决策结果: passed | rejected | on_hold | ...
  questions?: InterviewQuestion[]; // 面试问题记录
  reflection?: InterviewReflection; // 面试反思
  // ... 其他字段
}
```

### 两维状态模型 (Two-Dimensional State Model)

**为什么需要分离 Status 和 Result**：

| 场景 | Stage Status | Stage Result | 解释 |
|------|--------------|--------------|------|
| 刚安排面试 | `scheduled` | `null` | 行为: 已安排，但还没结果 |
| 面试完成，等反馈 | `feedback_pending` | `null` | 行为: 完成了，但不知道结果 |
| 收到通过通知 | `completed` | `passed` | 行为: 完成，决策: 通过 |
| 面试后被拒 | `completed` | `rejected` | 行为: 完成，决策: 拒绝 |
| HC 冻结 | `completed` | `on_hold` | 行为: 完成，决策: 暂停 |

**核心洞察**："发生了什么"（Status）和"意味着什么"（Result）是两个独立维度。

---

## 8️⃣ 用户工作流

### 8.1 新用户入门流程

```
┌─────────────────────────────────────────────────────────────────┐
│                    New User Onboarding                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Sign Up                                                     │
│     └─ 注册账号 (Email)                                         │
│         │                                                       │
│  2. Empty State                                                 │
│     └─ Dashboard 显示引导 CTA: "Add your first job"             │
│         │                                                       │
│  3. Add First Job                                               │
│     └─ 填写公司名、职位、状态                                    │
│         │                                                       │
│  4. Explore Features                                            │
│     ├─ 添加面试阶段                                              │
│     ├─ 记录第一轮面试                                            │
│     └─ 使用 AI 分析 transcript                                  │
│         │                                                       │
│  5. Build Knowledge Base                                        │
│     └─ 随着使用积累，解锁 Role Debrief 和 Career Growth         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 典型面试复盘流程

```
┌─────────────────────────────────────────────────────────────────┐
│               Interview Debrief Workflow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🎤 面试结束后 (30 min)                                          │
│  │                                                              │
│  ├─ 1. 打开 CareerPilot                                         │
│  │                                                              │
│  ├─ 2. 找到对应 Job (Job Board 或搜索)                           │
│  │                                                              │
│  ├─ 3. 进入 Job Detail → 找到对应 Stage                         │
│  │                                                              │
│  ├─ 4. 粘贴面试笔记/录音转写                                     │
│  │     └─ 支持 messy、中英混合的 transcript                     │
│  │                                                              │
│  ├─ 5. AI 自动分析                                              │
│  │     ├─ 提取问题 (分类 + 难度)                                 │
│  │     ├─ 评估回答质量                                          │
│  │     └─ 生成反思 (做得好 + 待改进)                             │
│  │                                                              │
│  ├─ 6. 更新 Stage Status                                        │
│  │     └─ completed → feedback_pending                          │
│  │                                                              │
│  └─ 7. (等结果后) 设置 Stage Result                             │
│        └─ passed / rejected / on_hold                           │
│                                                                 │
│  ✅ 完成! 知识已沉淀到系统中                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 面试准备流程

```
┌─────────────────────────────────────────────────────────────────┐
│               Interview Prep Workflow                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📋 收到面试邀请                                                 │
│  │                                                              │
│  ├─ 1. 打开 Interview Prep 页面                                 │
│  │                                                              │
│  ├─ 2. 上传简历 (PDF/Word/粘贴)                                  │
│  │                                                              │
│  ├─ 3. 粘贴 JD                                                  │
│  │                                                              │
│  ├─ 4. (可选) 添加过往面试经验                                   │
│  │                                                              │
│  ├─ 5. AI 分析                                                  │
│  │     ├─ JD 关键能力解读                                        │
│  │     ├─ 你的优势/潜在弱点                                      │
│  │     └─ Top 10 最可能被问的问题                                │
│  │                                                              │
│  ├─ 6. 模拟面试 (可选)                                          │
│  │     └─ AI 扮演面试官，实时反馈                                │
│  │                                                              │
│  └─ 7. 准备完成，自信面试!                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.4 长期成长回顾流程

```
┌─────────────────────────────────────────────────────────────────┐
│               Career Growth Review Workflow                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📈 每月/每季度回顾                                              │
│  │                                                              │
│  ├─ 1. 打开 Archive > Career Growth Tab                         │
│  │                                                              │
│  ├─ 2. 查看趋势图表                                             │
│  │     ├─ 折线图: 各能力随时间演化                               │
│  │     ├─ 雷达图: 过去 vs 现在对比                               │
│  │     └─ 柱状图: 优势 vs 短板                                   │
│  │                                                              │
│  ├─ 3. 阅读 AI Coach 建议                                       │
│  │     ├─ 最大进步                                              │
│  │     ├─ 持续短板                                              │
│  │     └─ 下一步优先级                                          │
│  │                                                              │
│  └─ 4. 制定提升计划                                             │
│        └─ 针对 gaps 安排学习/练习                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9️⃣ 技术栈

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | ^18.3.1 | UI 框架 |
| **Vite** | Latest | 构建工具 |
| **TypeScript** | Latest | 类型安全 |
| **Tailwind CSS** | Latest | 样式系统 |
| **shadcn/ui** | Latest | UI 组件库 |
| **TanStack Query** | ^5.83.0 | 服务器状态管理 |
| **React Router** | ^6.30.1 | 路由 |
| **Recharts** | ^2.15.4 | 图表 |
| **@dnd-kit** | Latest | 拖拽交互 |
| **Lucide React** | ^0.462.0 | 图标 |
| **date-fns** | ^3.6.0 | 日期处理 |
| **Zod** | ^3.25.76 | 数据验证 |

### 后端技术栈 (Lovable Cloud)

| 技术 | 用途 |
|------|------|
| **Supabase PostgreSQL** | 主数据库 |
| **Supabase Auth** | 用户认证 |
| **Supabase Storage** | 文件存储 (简历等) |
| **Supabase Edge Functions** | 无服务器函数 (Deno) |
| **Lovable AI Gateway** | AI 模型调用 |

### AI 模型

| 模型 | 提供商 | 用途 |
|------|--------|------|
| `google/gemini-3-flash-preview` | Google (via Lovable) | 所有 AI 分析任务 |

### 开发工具

| 工具 | 用途 |
|------|------|
| **Vitest** | 单元测试 |
| **ESLint** | 代码质量 |
| **Prettier** | 代码格式化 |

---

## 🔟 设计系统

### 设计原则

| 原则 | 描述 | 实现 |
|------|------|------|
| **AI-Native** | 使用 AI 原生的语言和交互模式 | 引导性 empty states，鼓励性反馈 |
| **Calm & Focused** | 减少视觉噪音，突出关键信息 | 中性色调，大量留白 |
| **Data-Driven** | 用数据说话，不用空洞的描述 | 量化指标，趋势图表 |
| **Progressive Disclosure** | 按需展示复杂度 | 折叠面板，解锁机制 |

### 颜色系统

```css
/* 主色调 */
--primary: 222.2 47.4% 11.2%;        /* 深蓝黑 */
--primary-foreground: 210 40% 98%;   /* 浅色文字 */

/* 背景层次 */
--background: 0 0% 100%;             /* 纯白 */
--card: 0 0% 100%;                   /* 卡片白 */
--muted: 210 40% 96.1%;              /* 灰色背景 */

/* 功能色 */
--destructive: 0 84.2% 60.2%;        /* 红色警告 */
--accent: 210 40% 96.1%;             /* 强调色 */
```

### 组件库

- 基于 **shadcn/ui** 定制
- 支持 **Dark Mode** (通过 next-themes)
- 响应式设计 (Mobile-first)

### 侧边栏设计

```
┌────────────────────────────────────────┐
│  ✨ CareerPilot          [折叠按钮]    │
├────────────────────────────────────────┤
│                                        │
│  📊 Dashboard                          │
│  💼 Job Board                          │
│  📅 Timeline                           │
│  📈 Analytics                          │
│  📦 Archive                            │
│  🧠 Interview Prep                     │
│                                        │
├────────────────────────────────────────┤
│  user@email.com                        │
│  [Sign Out]                            │
└────────────────────────────────────────┘
```

**特性**：
- 可折叠（状态持久化到 localStorage）
- 折叠时显示 Tooltip
- Active 状态高亮

---

## 1️⃣1️⃣ 安全与权限

### Row-Level Security (RLS)

所有表都启用 RLS，确保用户只能访问自己的数据：

```sql
-- jobs 表 RLS 策略
CREATE POLICY "Users can view their own jobs" 
  ON public.jobs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jobs" 
  ON public.jobs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs" 
  ON public.jobs FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs" 
  ON public.jobs FOR DELETE 
  USING (auth.uid() = user_id);
```

### 认证流程

- **Email/Password** 认证 (Supabase Auth)
- **Email 验证** 必须完成后才能登录
- **Session 管理** 通过 Supabase 自动处理

### 敏感数据处理

| 数据类型 | 存储位置 | 保护措施 |
|----------|----------|----------|
| 用户密码 | Supabase Auth | 加密存储，不可读取 |
| API Keys | Supabase Secrets | 仅 Edge Functions 可访问 |
| 面试笔记 | jobs.stages (JSONB) | RLS 保护 |
| 简历文档 | Supabase Storage | Private bucket + RLS |

---

## 1️⃣2️⃣ 未来规划

### 短期 Roadmap (v1.x)

| 版本 | 功能 | 优先级 |
|------|------|--------|
| v1.1 | 多语言 Coach Message (中/英) | 高 |
| v1.2 | 面试日历集成 (Google Calendar) | 高 |
| v1.3 | 移动端适配优化 | 中 |
| v1.4 | 导出功能 (PDF 报告) | 中 |

### 中期 Roadmap (v2.x)

| 版本 | 功能 | 描述 |
|------|------|------|
| v2.0 | 团队协作 | 多人共享面试库，团队 insights |
| v2.1 | 行业对标 | 与同行业候选人匿名能力对比 |
| v2.2 | 预测模型 | 基于历史趋势预测未来能力水平 |
| v2.3 | 学习推荐 | 根据 gaps 推荐课程/资源 |

### 长期愿景 (v3.x)

| 功能 | 描述 |
|------|------|
| **Career Graph** | 可视化职业发展路径图 |
| **Mentor Matching** | 根据 gaps 匹配导师 |
| **Company Intel** | 众包公司面试情报 |
| **Offer Negotiation AI** | AI 辅助薪资谈判 |

---

## 📎 附录

### A. 问题分类体系

| 分类 | Key | 描述 | 典型问题 |
|------|-----|------|----------|
| 行为面试 | `behavioral` | STAR 方法，过去经历 | "Tell me about a time when..." |
| 技术问题 | `technical` | 专业知识深度 | "How would you design..." |
| 情景问题 | `situational` | 假设场景应对 | "What would you do if..." |
| 案例分析 | `case` | 商业/产品案例 | "How would you improve..." |
| 动机问题 | `motivation` | 职业动机、公司匹配 | "Why this company?" |
| 其他 | `other` | 无法归类的问题 | - |

### B. 反思情绪等级

| 等级 | Key | Emoji | 描述 |
|------|-----|-------|------|
| 非常好 | `great` | 🎉 | 表现超出预期 |
| 还不错 | `good` | 😊 | 基本发挥正常 |
| 一般般 | `neutral` | 😐 | 无功无过 |
| 不太好 | `poor` | 😔 | 有明显失误 |
| 很糟糕 | `bad` | 😢 | 表现很差 |

### C. 相关文档

| 文档 | 路径 | 描述 |
|------|------|------|
| AI 面试智能系统 PRD | `docs/PRD-AI-Interview-Intelligence.md` | Layer 1 & 2 详细设计 |
| Career Growth Agent PRD | `docs/PRD-Career-Growth-Intelligence-Agent.md` | Layer 3 详细设计 |

---

**Document End**

> *"Every interview is an investment in your career portfolio."*  
> — CareerPilot
