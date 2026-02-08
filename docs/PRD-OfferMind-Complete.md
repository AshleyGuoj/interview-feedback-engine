# 🚀 OfferMind — 完整产品需求文档 (Complete PRD)

> **Document Version**: 2.0  
> **Last Updated**: 2026-02-08  
> **Author**: Product & AI Architecture Team  
> **Status**: Production  
> **Language Support**: English / 中文

---

## 📋 目录 (Table of Contents)

1. [产品概述 (Product Overview)](#1️⃣-产品概述-product-overview)
2. [目标用户 (Target Users)](#2️⃣-目标用户-target-users)
3. [核心价值主张 (Value Proposition)](#3️⃣-核心价值主张-value-proposition)
4. [系统架构 (System Architecture)](#4️⃣-系统架构-system-architecture)
5. [功能模块详解 (Feature Modules)](#5️⃣-功能模块详解-feature-modules)
6. [AI Agent 体系 (AI Agent System)](#6️⃣-ai-agent-体系-ai-agent-system)
7. [数据模型 (Data Models)](#7️⃣-数据模型-data-models)
8. [用户工作流 (User Workflows)](#8️⃣-用户工作流-user-workflows)
9. [国际化系统 (Internationalization)](#9️⃣-国际化系统-internationalization)
10. [技术栈 (Tech Stack)](#🔟-技术栈-tech-stack)
11. [设计系统 (Design System)](#1️⃣1️⃣-设计系统-design-system)
12. [安全与权限 (Security)](#1️⃣2️⃣-安全与权限-security)
13. [配置清单 (Configuration)](#1️⃣3️⃣-配置清单-configuration)
14. [未来规划 (Roadmap)](#1️⃣4️⃣-未来规划-roadmap)

---

## 1️⃣ 产品概述 (Product Overview)

### 产品名称
**OfferMind** — AI-First Job Search Command Center  
**中文名**: 面试智脑

### 一句话描述 (Elevator Pitch)

> **OfferMind** 是一个 **AI 驱动的求职指挥中心**，将凌乱的面试笔记转化为战略性职业智慧。它结合了全栈追踪能力（Kanban 看板 + 多管道分支处理 HC 冻结/内转）与三层 AI Agent 体系，生成能力热力图、预测录用可能性、追踪长期成长趋势——让每一次面试都成为可复用的职业资产。

### 产品愿景

```
┌─────────────────────────────────────────────────────────────────┐
│                       OfferMind Vision                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FROM: 传统求职工具 / Traditional Job Tools                       │
│  ├─ 简单的 Kanban 看板                                          │
│  ├─ 静态的申请状态追踪                                           │
│  └─ 被动等待结果                                                 │
│                                                                 │
│  TO: 职业智慧引擎 / Career Intelligence Engine                   │
│  ├─ 面试知识资产化 (Knowledge Assetization)                      │
│  ├─ AI 驱动的能力洞察 (AI-Powered Insights)                      │
│  ├─ 跨岗位长期成长追踪 (Cross-Role Growth Tracking)              │
│  └─ 可复用的 STAR 故事库 (Reusable Story Library)               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 核心理念：面试知识沉淀 (Interview Knowledge Assetization)

**传统求职的问题**：
- 每次面试都是一次性事件
- 面试结束后只留下模糊记忆
- 无法系统化积累经验
- 同样的错误反复犯

**OfferMind 的解决方案**：
- 问题被结构化提取和分类
- 表现被量化评估 (1-5 分)
- 洞察可跨时间对比
- 故事可跨公司复用
- AI 识别成长趋势

---

## 2️⃣ 目标用户 (Target Users)

### 主要用户画像

| 用户类型 | 描述 | 核心需求 | 典型使用场景 |
|----------|------|----------|--------------|
| **积极求职者** | 正在进行多家公司面试的候选人 | 高效管理多个申请流程，不遗漏任何机会 | 同时追踪 10+ 个申请，需要清晰的下一步行动 |
| **海外留学生** | 中美双向求职，需跨语言面试复盘 | 中英双语支持，处理 messy transcripts | 使用英文面试，但习惯用中文做笔记 |
| **职业转型者** | 从一个领域转向另一个领域 | 系统化提炼可迁移能力信号 | 从工程师转 PM，需要证明产品思维 |
| **高潜人才** | 目标是顶级科技公司的候选人 | 精准识别短板，针对性提升 | 冲刺 FAANG/顶级独角兽，每轮面试都需要最大化表现 |
| **长期用户** | 使用 OfferMind 超过 3 个月 | 回顾成长轨迹，规划职业发展 | 定期回顾自己的能力演化趋势 |

### 用户痛点矩阵

| 痛点 | 严重程度 | 现状 | OfferMind 解决方案 |
|------|----------|------|---------------------|
| 🔴 **面试无法复盘** | 高 | 面试结束后只有模糊记忆，无法结构化分析 | AI 自动从 transcript 提取问题、评估质量 |
| 🔴 **不知道失败原因** | 高 | 被拒后无法定位具体短板 | 能力热力图 + 风险信号识别 |
| 🔴 **无法提炼能力信号** | 高 | 面试中表现分散，难以形成系统认知 | 多轮汇总生成 Role Debrief |
| 🟡 **岗位匹配不精准** | 中 | 不清楚公司最看重什么 | Hiring Likelihood + Company Insights |
| 🟡 **重复造轮子** | 中 | 同样的 STAR 故事每次重新组织 | 可复用的 Story Library |
| 🟡 **看不到成长** | 中 | 一次次面试后不知道是否进步 | 跨岗位长期能力追踪 |
| 🟢 **多线程混乱** | 低 | 多个申请同时进行容易遗漏 | Kanban + 下一步行动提醒 |

---

## 3️⃣ 核心价值主张 (Value Proposition)

### Value Proposition Canvas

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
│  OfferMind 解决方案                                              │
│  ├─ 💼 全栈求职追踪 (Kanban + Multi-Pipeline)                    │
│  ├─ 🧠 AI 面试分析 (Transcript → Insights)                       │
│  ├─ 📊 能力热力图 (10 维度量化评估)                               │
│  ├─ 📈 成长追踪 (跨岗位长期趋势)                                  │
│  ├─ 🎯 面试准备 (问题预测 + 模拟面试)                             │
│  └─ 📚 知识沉淀 (可复用 Story Library)                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 竞品对比

| 功能 | OfferMind | Huntr | Teal | Notion 模板 |
|------|-----------|-------|------|-------------|
| Kanban 看板 | ✅ | ✅ | ✅ | ✅ |
| 多管道分支 (HC 冻结处理) | ✅ | ❌ | ❌ | ❌ |
| AI Transcript 分析 | ✅ | ❌ | ❌ | ❌ |
| 能力热力图 | ✅ | ❌ | ❌ | ❌ |
| 跨岗位成长追踪 | ✅ | ❌ | ❌ | ❌ |
| AI 面试准备 | ✅ | ❌ | ✅ (limited) | ❌ |
| 中英双语支持 | ✅ | ❌ | ❌ | ❌ |

---

## 4️⃣ 系统架构 (System Architecture)

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          OfferMind System Architecture                       │
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
│  │                      Lovable Cloud (Supabase)                        │   │
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

| 路由 | 页面 | 功能 | 权限 | 文件路径 |
|------|------|------|------|----------|
| `/` | Dashboard | 求职指挥中心主页 | 需登录 | `src/pages/Dashboard.tsx` |
| `/auth` | Auth | 登录/注册 | 公开 | `src/pages/Auth.tsx` |
| `/jobs` | Job Board | Kanban 看板 | 需登录 | `src/pages/JobBoard.tsx` |
| `/jobs/:id` | Job Detail | 单个岗位详情 + 面试时间线 | 需登录 | `src/pages/JobDetail.tsx` |
| `/timeline` | Timeline | 全局面试时间线 | 需登录 | `src/pages/Timeline.tsx` |
| `/analytics` | Analytics | AI 面试分析中心 | 需登录 | `src/pages/Analytics.tsx` |
| `/archive` | Archive | 职业成长 & 历史记录 | 需登录 | `src/pages/Archive.tsx` |
| `/interview-prep` | Interview Prep | 面试准备 Agent | 需登录 | `src/pages/InterviewPrep.tsx` |
| `/analyze` | Analyze Interview | 快速 Transcript 分析 | 需登录 | `src/pages/AnalyzeInterview.tsx` |

---

## 5️⃣ 功能模块详解 (Feature Modules)

### 5.1 Dashboard — 求职指挥中心

**功能定位**：决策驱动的"职业指挥中心"，一眼掌握求职全局。

**核心组件**：

| 组件 | 功能 | 数据来源 | 技术实现 |
|------|------|----------|----------|
| **Stats Grid** | 4 个关键指标 | 从 jobs 表派生计算 | `useMemo` 优化 |
| **Upcoming Interviews** | 即将到来的面试列表 | 从 stages.scheduledTime 派生 | `date-fns` 时间处理 |
| **Recent Activity** | 最近 5 条活动 | recent_activities 表 | `useActivities` hook |
| **Quick Action CTA** | "Analyze Interview" 入口 | 导航 | `useNavigate` |

**Stats 指标定义**：
```typescript
const activeApplications = jobs.filter(j => j.status !== 'closed').length;
const interviewing = jobs.filter(j => j.status === 'interviewing').length;
const offers = jobs.filter(j => j.status === 'offer').length;
const responseRate = Math.round(((interviewing + offers + closed) / jobs.length) * 100);
```

**即将面试派生逻辑**：
```typescript
const upcomingInterviews = jobs
  .flatMap(job => job.stages.filter(s => 
    ['pending', 'scheduled', 'rescheduled'].includes(s.status) &&
    (s.scheduledTime || s.deadline)
  ))
  .sort((a, b) => a.sortDate.localeCompare(b.sortDate))
  .slice(0, 4);
```

---

### 5.2 Job Board — Kanban 看板

**功能定位**：可视化管理所有求职申请的流程状态。

**核心功能**：

| 功能 | 描述 | 交互方式 | 技术实现 |
|------|------|----------|----------|
| **Kanban 列** | 4 个状态列 | 拖拽移动 | `@dnd-kit` |
| **Job Card** | 公司、职位、兴趣等级、下一步行动 | 点击进入详情 | 自定义组件 |
| **快速添加** | "Add Job" 对话框 | 顶部按钮 | Dialog + Form |
| **批量导入** | 从 LocalStorage 导入 | Import 对话框 | JSON 解析 |
| **Pipeline 状态** | 显示当前阶段进度 | InsightStrip | Pipeline Resolver |
| **搜索** | 公司名/职位搜索 | 输入框 | 实时过滤 |

**状态定义**：

| 状态 | 定义 | 自动触发条件 | 颜色 |
|------|------|--------------|------|
| `applied` | 已投递，等待回复 | 新建 Job 默认状态 | 灰色 |
| `interviewing` | 有面试活动进行中 | 任何非 Applied 阶段有活动 | 蓝色 |
| `offer` | 已收到 Offer | Offer 阶段 completed | 绿色 |
| `closed` | 已结束 | 手动设置或所有管道终止 | 暗色 |

**Kanban 拖拽逻辑**：
```typescript
// 使用 @dnd-kit 实现
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={jobIds}>
    {columns.map(column => (
      <KanbanColumn key={column.status} status={column.status}>
        {column.jobs.map(job => (
          <DraggableJobCard key={job.id} job={job} />
        ))}
      </KanbanColumn>
    ))}
  </SortableContext>
</DndContext>
```

---

### 5.3 Job Detail — 岗位详情页

**功能定位**：单个岗位的完整信息视图 + 面试时间线管理。

**核心区域**：

| 区域 | 内容 | 交互 | 组件 |
|------|------|------|------|
| **Header** | 公司名、职位、状态 Badge、兴趣星级 | 编辑基本信息 | `JobDetailHeader` |
| **Pipeline Timeline** | 可视化面试流程（多管道支持） | 添加/编辑阶段 | `UnifiedInterviewTimeline` |
| **Stage Detail Editor** | 单个阶段的详细信息编辑 | 展开编辑 | `StageDetailEditor` |
| **Collapsible History** | 历史管道（如 HC 冻结后的转岗） | 折叠查看 | `CollapsiblePipelineHistory` |

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

**Stage Detail Editor 功能**：

| Tab | 内容 | 数据结构 |
|-----|------|----------|
| **Questions** | 面试问题记录 | `InterviewQuestion[]` |
| **Reflection** | 面试反思 | `InterviewReflection` |
| **Preparation** | 准备笔记 | `preparation: { notes, stories, questions }` |

**Question Recorder 字段**：
```typescript
interface InterviewQuestion {
  id: string;
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'case' | 'motivation' | 'other';
  myAnswer?: string;
  idealAnswer?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  wasAsked: boolean;
  answeredWell?: boolean;
  tags?: string[];
}
```

**Reflection Editor 字段**：
```typescript
interface InterviewReflection {
  overallFeeling: 'great' | 'good' | 'neutral' | 'poor' | 'bad';
  whatWentWell: string[];
  whatCouldImprove: string[];
  surprisingQuestions?: string[];
  keyTakeaways: string[];
  followUpActions?: string[];
  interviewerVibe?: string;
  companyInsights?: string;
}
```

---

### 5.4 Timeline — 全局面试时间线

**功能定位**：跨岗位的全局面试日历视图。

**核心功能**：

| 功能 | 描述 | 技术实现 |
|------|------|----------|
| **时间线视图** | 按时间顺序展示所有面试事件 | 自定义时间线组件 |
| **快速筛选** | 按公司、状态筛选 | 本地过滤 |
| **Deep Link** | 点击事件跳转到 Analytics | `useNavigate` |
| **全局搜索** | 搜索历史问题、公司、关键词 | 模糊匹配 |

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

**Tab 行为规则**：
- 选择新 round 时，自动切换到 "Interview Analysis" tab
- Role Debrief tab 在 < 2 rounds 时显示锁定 + tooltip 说明
- 活跃 tab 显示紫色下划线高亮

**特性**：
- **Resizable Panels**：可拖拽调整左右面板宽度
- **Context Bar**：显示当前选中的职位/阶段
- **Empty State**：AI-native 的引导语言
- **Fuzzy Search**：即时模糊搜索角色

---

### 5.6 Archive — 职业回顾中心

**功能定位**：从"死档存储"转变为"职业回顾中心"——回顾成长轨迹，而非仅仅查看关闭的申请。

**两个核心 Tab**：

| Tab | 功能 | 内容 | 解锁条件 |
|-----|------|------|----------|
| **Career Growth** | 跨岗位长期能力追踪 | 趋势图表 + AI 教练建议 | ≥2 个已分析轮次 |
| **Closed Applications** | 历史申请列表 | 可筛选的关闭岗位表格 | 始终可用 |

**Career Growth 解锁逻辑**：
```typescript
const totalAnalyzedRounds = jobs.reduce((count, job) => {
  return count + job.stages.filter(
    stage => stage.status === 'completed' && 
             (stage.questions?.length > 0 || stage.reflection)
  ).length;
}, 0);

const isGrowthUnlocked = totalAnalyzedRounds >= 2;
```

**Career Growth 图表**：

| 图表类型 | 内容 | 组件 |
|----------|------|------|
| **Line Chart** | 各能力随时间演化 | `CompetencyLineChart` |
| **Radar Chart** | 过去 vs 现在对比 | `CompetencyRadarChart` |
| **Bar Chart** | 优势 vs 短板 | `StrengthsGapsChart` |

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
| 维度 | Analyze Interview | Analytics |
|------|-------------------|-----------|
| 入口 | 独立页面 | Job 关联 |
| 数据持久化 | 临时 | 永久 |
| 多轮汇总 | ❌ | ✅ |
| 成长追踪 | ❌ | ✅ |

---

## 6️⃣ AI Agent 体系 (AI Agent System)

### 三层 Agent 架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    OfferMind AI Agent Architecture               │
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
| Career Signals | gemini-2.5-flash | 0.5 | 4000 | Timeline 信号提取 |

### Edge Functions 清单

| Function | 路径 | 功能 | 输入 | 输出 |
|----------|------|------|------|------|
| `analyze-transcript` | `/functions/v1/analyze-transcript` | Layer 1: 单轮 Transcript 分析 | transcript, language | questions[], reflection |
| `generate-role-debrief` | `/functions/v1/generate-role-debrief` | Layer 2: 单岗位多轮汇总 | roundsData[], language | heatmap, likelihood, actions |
| `analyze-career-growth` | `/functions/v1/analyze-career-growth` | Layer 3: 跨岗位成长追踪 | allRoundsData[], language | trends, priorities, coach |
| `interview-prep-agent` | `/functions/v1/interview-prep-agent` | 面试准备 + 模拟面试 | resume, jd, notes, language | analysis, questions |
| `analyze-interview` | `/functions/v1/analyze-interview` | 快速分析入口 | transcript, language | questions[], reflection |
| `analyze-career-signals` | `/functions/v1/analyze-career-signals` | Timeline 信号提取 | events[], language | signals[], patterns |
| `parse-document` | `/functions/v1/parse-document` | PDF/Word 文档解析 | file | text content |

### Prompt Engineering 策略

| 技术策略 | 实现方式 | 效果 |
|----------|----------|------|
| **Role Setting** | "You are an expert interview analysis assistant" | 建立专业 persona |
| **Task Decomposition** | 拆分为独立子任务 | 提高输出质量 |
| **Anti-Hallucination** | "based on context clues", evidence 字段必填 | 强制基于证据评估 |
| **Tone Control** | "Be constructive and growth-oriented, never harsh" | 用户友好的输出风格 |
| **Bilingual Support** | language 参数传递，输出锁定语言 | 零混语 UI |
| **Strict Schema** | JSON structure 嵌入 prompt | 100% 格式可控 |
| **Low Temperature** | 0.3-0.5 | 降低随机性 |

---

## 7️⃣ 数据模型 (Data Models)

### 数据库表结构

```sql
-- 主表: jobs
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- 基本信息
  company_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'CN',
  status TEXT NOT NULL DEFAULT 'applied',
  job_link TEXT,
  source TEXT NOT NULL DEFAULT 'other',
  interest_level INTEGER NOT NULL DEFAULT 3,
  career_fit_notes TEXT,
  current_stage TEXT,
  next_action TEXT,
  
  -- JSONB 存储复杂数据
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
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### TypeScript 类型层次

```typescript
// 顶层: Job
interface Job {
  id: string;
  companyName: string;
  roleTitle: string;
  location: 'CN' | 'US' | 'Remote' | 'Other';
  status: JobStatus;
  jobLink?: string;
  source: JobSource;
  interestLevel: 1 | 2 | 3 | 4 | 5;
  careerFitNotes?: string;
  currentStage?: string;
  nextAction?: string;
  stages: InterviewStage[];
  pipelines: Pipeline[];
  subStatus?: InterviewingSubStatus | OfferSubStatus;
  closedReason?: ClosedReason;
  riskTags?: RiskTag[];
  lastContactDate?: string;
  createdAt: string;
  updatedAt: string;
}

// 中层: Pipeline (支持 HC 冻结 -> 转岗)
interface Pipeline {
  id: string;
  type: PipelineType;
  status: PipelineStatus;
  targetRole: string;
  stages: InterviewStage[];
  originPipelineId?: string;
  transferReason?: TransferReason;
  createdAt: string;
  closedAt?: string;
  closedReason?: ClosedReason;
}

// 底层: InterviewStage (两维状态模型)
interface InterviewStage {
  id: string;
  name: string;
  order?: number;
  status: StageStatus;
  result?: StageResult;
  scheduledTime?: string;
  scheduledTimezone?: string;
  deadline?: string;
  deadlineTimezone?: string;
  date?: string;
  interviewer?: string;
  feedbackScore?: number;
  questions?: InterviewQuestion[];
  reflection?: InterviewReflection;
  storiesUsed?: string[];
  preparation?: {
    notes: string;
    stories: string[];
    questions: string[];
  };
}
```

### 两维状态模型 (Two-Dimensional State Model)

**为什么分离 Status 和 Result**：

| 场景 | Stage Status | Stage Result | 解释 |
|------|--------------|--------------|------|
| 刚安排面试 | `scheduled` | `null` | 行为: 已安排，但还没结果 |
| 面试完成，等反馈 | `feedback_pending` | `null` | 行为: 完成了，但不知道结果 |
| 收到通过通知 | `completed` | `passed` | 行为: 完成，决策: 通过 |
| 面试后被拒 | `completed` | `rejected` | 行为: 完成，决策: 拒绝 |
| HC 冻结 | `completed` | `on_hold` | 行为: 完成，决策: 暂停 |

**Stage Status 枚举**：
```typescript
type StageStatus = 
  | 'pending'           // 待进行
  | 'scheduled'         // 已安排  
  | 'rescheduled'       // 已改期
  | 'completed'         // 已完成
  | 'feedback_pending'  // 等待反馈 ⭐ Key pain point!
  | 'skipped'           // 跳过
  | 'withdrawn';        // 候选人退出
```

**Stage Result 枚举**：
```typescript
type StageResult = 
  | 'passed'            // 通过本轮
  | 'rejected'          // 未通过
  | 'on_hold'           // HC冻结/组织调整
  | 'mixed_feedback'    // 意见不统一
  | null;               // No result yet
```

### JSONB stages 结构

stages 字段使用 JSONB 存储复杂嵌套数据：

```typescript
// 存储结构
{
  list: InterviewStage[],         // Legacy 单管道
  _metadata: {
    pipelines: Pipeline[],        // 多管道
    subStatus: string,            // 子状态
    closedReason: string,         // 关闭原因
    riskTags: string[],           // 风险标签
    lastContactDate: string,      // 最后联系日期
  }
}
```

### 枚举类型完整定义

```typescript
// Job 状态
type JobStatus = 'applied' | 'interviewing' | 'offer' | 'closed';

// Job 来源
type JobSource = 'linkedin' | 'boss' | 'referral' | 'website' | 'other';

// Interviewing 子状态
type InterviewingSubStatus = 
  | 'interview_scheduled'    // 📅 有排期
  | 'feedback_pending'       // ⏳ 等反馈
  | 'approval_pending'       // ⚠️ 等审批
  | 'hr_followup'           // 🧑‍💼 HR跟进中
  | 'preparing';            // 📚 准备中

// Offer 子状态
type OfferSubStatus = 
  | 'offer_discussion'       // 💬 谈薪中
  | 'offer_pending'          // ⏳ 等offer
  | 'offer_received'         // 📩 已收到offer
  | 'negotiating';           // 🤝 谈判中

// 关闭原因
type ClosedReason = 
  | 'rejected_after_interview'  // ❌ 面试后被拒
  | 'rejected_resume'           // 📄 简历被拒
  | 'no_response'               // 💤 无回复/Ghosted
  | 'withdrawn'                 // 🔁 主动放弃
  | 'hc_frozen'                 // 🚫 HC冻结
  | 'position_cancelled'        // ❌ 岗位取消
  | 'offer_declined';           // 🙅 拒绝offer

// 风险标签
type RiskTag = 
  | 'hc_risk'                // ⚠️ HC风险
  | 'long_silence'           // 🕒 长时间无回复 (7+天)
  | 'extra_round'            // 🔁 加面
  | 'competing_offer'        // 💰 有竞争offer
  | 'timeline_delay'         // ⏰ 时间线延迟
  | 'salary_gap'             // 💵 薪资差距
  | 'lowball_offer';         // 📉 低于预期offer

// Pipeline 类型
type PipelineType = 'primary' | 'transfer' | 'internal_move' | 'reapply';

// Pipeline 状态
type PipelineStatus = 'active' | 'paused' | 'completed' | 'closed';
```

---

## 8️⃣ 用户工作流 (User Workflows)

### 8.1 新用户入门流程

```
┌─────────────────────────────────────────────────────────────────┐
│                    New User Onboarding                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Sign Up                                                     │
│     └─ 注册账号 (Email)                                         │
│     └─ 邮箱验证                                                  │
│         │                                                       │
│  2. First Login                                                 │
│     └─ Dashboard 显示 Empty State                               │
│     └─ CTA: "Add your first job"                                │
│         │                                                       │
│  3. Add First Job                                               │
│     └─ 填写公司名、职位、状态                                    │
│     └─ 选择来源 (LinkedIn/Boss/Referral...)                     │
│     └─ 设置兴趣等级 (1-5 ⭐)                                     │
│         │                                                       │
│  4. Explore Features                                            │
│     ├─ 添加面试阶段                                              │
│     ├─ 记录第一轮面试                                            │
│     ├─ 使用 AI 分析 transcript                                  │
│     └─ 解锁 Role Debrief (≥2 rounds)                            │
│         │                                                       │
│  5. Build Knowledge Base                                        │
│     └─ 随着使用积累，解锁 Career Growth                          │
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
│  ├─ 1. 打开 OfferMind                                            │
│  │                                                              │
│  ├─ 2. 找到对应 Job (Job Board 搜索或点击)                        │
│  │                                                              │
│  ├─ 3. 进入 Job Detail → 找到对应 Stage                         │
│  │                                                              │
│  ├─ 4. 展开 Stage → Questions Tab                               │
│  │     ├─ 手动添加问题 (+ Add Question)                          │
│  │     └─ 或：粘贴 Transcript → AI 分析                          │
│  │                                                              │
│  ├─ 5. (如用 AI) 自动生成:                                       │
│  │     ├─ 结构化问题列表                                         │
│  │     ├─ 分类 (Behavioral/Technical/Case...)                   │
│  │     ├─ 难度评估 (1-5)                                         │
│  │     └─ 回答质量评估 (High/Medium/Low)                         │
│  │                                                              │
│  ├─ 6. 切换到 Reflection Tab                                    │
│  │     ├─ 选择整体感觉 (🎉 Great → 😢 Bad)                        │
│  │     ├─ 填写 What Went Well                                   │
│  │     ├─ 填写 What Could Improve                               │
│  │     ├─ 填写 Key Takeaways                                    │
│  │     └─ (可选) Interviewer Vibe / Company Insights            │
│  │                                                              │
│  ├─ 7. 更新 Stage Status                                        │
│  │     └─ scheduled → completed 或 feedback_pending             │
│  │                                                              │
│  └─ 8. (等结果后) 设置 Stage Result                             │
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
│  ├─ 2. 上传简历                                                 │
│  │     ├─ PDF 上传                                              │
│  │     ├─ Word 上传                                             │
│  │     └─ 直接粘贴文本                                          │
│  │                                                              │
│  ├─ 3. 粘贴 JD                                                  │
│  │                                                              │
│  ├─ 4. (可选) 添加过往面试经验                                   │
│  │                                                              │
│  ├─ 5. 点击 "Analyze" → AI 分析                                 │
│  │     ├─ JD 关键能力解读                                        │
│  │     ├─ 候选人优势/潜在弱点                                     │
│  │     └─ Top 10 最可能被问的问题                                │
│  │                                                              │
│  ├─ 6. (可选) 开始模拟面试                                       │
│  │     └─ AI 扮演面试官，实时对话                                │
│  │                                                              │
│  └─ 7. 准备完成，自信面试!                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.4 HC 冻结处理流程

```
┌─────────────────────────────────────────────────────────────────┐
│               HC Freeze Handling Workflow                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ❄️ 收到 HC 冻结通知                                             │
│  │                                                              │
│  ├─ 1. 进入 Job Detail                                          │
│  │                                                              │
│  ├─ 2. 找到当前 Stage → 设置 Result = on_hold                   │
│  │                                                              │
│  ├─ 3. 触发 Terminal Decision Modal                             │
│  │     ├─ 选项 A: "Close Pipeline" → 关闭当前管道               │
│  │     └─ 选项 B: "Transfer to Another Role" → 转岗             │
│  │                                                              │
│  ├─ 4. (如选择转岗)                                             │
│  │     ├─ 输入新职位名称 (如 "PM, Cloud")                        │
│  │     ├─ 选择转岗原因 (hc_freeze/better_fit/reorg)             │
│  │     └─ 系统创建新 Pipeline，继承之前的上下文                  │
│  │                                                              │
│  ├─ 5. 原管道变为 "历史管道"                                    │
│  │     ├─ 折叠显示                                              │
│  │     ├─ 只渲染有实际进展的阶段                                │
│  │     └─ 未来的"幽灵阶段"被隐藏                                │
│  │                                                              │
│  └─ 6. 继续在新管道中推进                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.5 长期成长回顾流程

```
┌─────────────────────────────────────────────────────────────────┐
│               Career Growth Review Workflow                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📈 每月/每季度回顾                                              │
│  │                                                              │
│  ├─ 1. 打开 Archive > Career Growth Tab                         │
│  │                                                              │
│  ├─ 2. (首次) 点击 "Generate Analysis" 按钮                     │
│  │                                                              │
│  ├─ 3. AI 分析所有历史面试数据                                   │
│  │                                                              │
│  ├─ 4. 查看趋势图表                                             │
│  │     ├─ Line Chart: 各能力随时间演化                           │
│  │     ├─ Radar Chart: 过去 vs 现在对比                         │
│  │     └─ Bar Chart: 优势 vs 短板                               │
│  │                                                              │
│  ├─ 5. 阅读 AI Coach 建议                                       │
│  │     ├─ 最大进步 (Biggest Positive Change)                    │
│  │     ├─ 持续短板 (Persistent Gaps)                            │
│  │     ├─ 下一步优先级 (Next Growth Priorities)                 │
│  │     └─ Coach Message (鼓励 + 建议)                           │
│  │                                                              │
│  └─ 6. 制定提升计划                                             │
│        └─ 针对 gaps 安排学习/练习                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9️⃣ 国际化系统 (Internationalization)

### 支持语言

| 语言 | Code | 状态 | 覆盖率 |
|------|------|------|--------|
| **English** | `en` | ✅ 完成 | 100% |
| **中文 (简体)** | `zh` | ✅ 完成 | 100% |

### 语言切换机制

```typescript
// LanguageSwitcher 组件
const languages = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'zh', label: '中', flag: '🇨🇳' },
];

// 使用 react-i18next
const { i18n } = useTranslation();
i18n.changeLanguage(code);
```

### 语言一致性规则 (Zero Tolerance)

| 规则 | 描述 |
|------|------|
| **Language Lock** | 选择语言后，所有 UI 文本必须使用该语言 |
| **Zero Tolerance** | 不允许任何混语 UI 文本 |
| **例外** | 公司名 (Google)、缩写 (AI/PM/SQL)、国家标签 (CN/US) |
| **AI 输出** | 所有 Edge Functions 接收 `language` 参数，输出锁定语言 |

### 翻译文件结构

```
src/lib/i18n/
├── index.ts              # i18n 配置
└── locales/
    ├── en.ts             # 英文翻译
    └── zh.ts             # 中文翻译
```

### 关键命名空间

| 命名空间 | 覆盖范围 |
|----------|----------|
| `common` | 通用按钮、标签、状态 |
| `nav` | 导航菜单 |
| `dashboard` | Dashboard 页面 |
| `jobs` | Job Board + Job Detail |
| `timeline` | Timeline 页面 |
| `analytics` | Analytics 页面 |
| `archive` | Archive 页面 |
| `interviewPrep` | Interview Prep 页面 |
| `auth` | 登录/注册 |
| `questionCategory` | 问题分类 |
| `reflection` | 反思相关 |
| `questionRecorder` | 问题记录器 |

---

## 🔟 技术栈 (Tech Stack)

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
| **@dnd-kit** | ^6.3.1 | 拖拽交互 |
| **Lucide React** | ^0.462.0 | 图标 |
| **date-fns** | ^3.6.0 | 日期处理 |
| **Zod** | ^3.25.76 | 数据验证 |
| **react-i18next** | ^16.5.4 | 国际化 |

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
| `google/gemini-3-flash-preview` | Google (via Lovable) | 主要 AI 分析任务 |
| `google/gemini-2.5-flash` | Google (via Lovable) | 轻量级任务 |

### 依赖完整列表

```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2",
  "@hookform/resolvers": "^3.10.0",
  "@radix-ui/react-*": "各种 Radix 组件",
  "@supabase/supabase-js": "^2.90.1",
  "@tanstack/react-query": "^5.83.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "cmdk": "^1.1.1",
  "date-fns": "^3.6.0",
  "embla-carousel-react": "^8.6.0",
  "i18next": "^25.8.4",
  "lucide-react": "^0.462.0",
  "next-themes": "^0.3.0",
  "react": "^18.3.1",
  "react-day-picker": "^8.10.1",
  "react-dom": "^18.3.1",
  "react-hook-form": "^7.61.1",
  "react-i18next": "^16.5.4",
  "react-resizable-panels": "^2.1.9",
  "react-router-dom": "^6.30.1",
  "recharts": "^2.15.4",
  "sonner": "^1.7.4",
  "tailwind-merge": "^2.6.0",
  "tailwindcss-animate": "^1.0.7",
  "vaul": "^0.9.9",
  "zod": "^3.25.76"
}
```

---

## 1️⃣1️⃣ 设计系统 (Design System)

### 设计原则

| 原则 | 描述 | 实现 |
|------|------|------|
| **AI-Native** | 使用 AI 原生的语言和交互模式 | 引导性 empty states，鼓励性反馈 |
| **Calm & Focused** | 减少视觉噪音，突出关键信息 | 中性色调，大量留白 |
| **Data-Driven** | 用数据说话，不用空洞的描述 | 量化指标，趋势图表 |
| **Progressive Disclosure** | 按需展示复杂度 | 折叠面板，解锁机制 |

### 颜色系统 (HSL)

```css
/* Light Mode */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
}

/* Dark Mode */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... 其他暗色变量 */
}
```

### 功能色

| 用途 | 颜色 | 变量 |
|------|------|------|
| 成功/通过 | 绿色 | `text-emerald-500` |
| 警告/等待 | 琥珀色 | `text-amber-500` |
| 错误/拒绝 | 红色 | `text-red-500` |
| 信息/进行中 | 蓝色 | `text-blue-500` |
| 暂停/冻结 | 青色 | `text-cyan-500` |

### 组件库

- 基于 **shadcn/ui** 定制
- 支持 **Dark Mode** (通过 next-themes)
- 响应式设计 (Mobile-first)
- 所有颜色使用 HSL 语义变量

### 侧边栏设计

```
┌────────────────────────────────────────┐
│  ✨ OfferMind           [折叠按钮]     │
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
│  [🌐 EN/中]                            │
│  user@email.com                        │
│  [Sign Out]                            │
└────────────────────────────────────────┘
```

**特性**：
- 可折叠（状态持久化到 localStorage）
- 折叠时显示 Tooltip
- Active 状态高亮
- 语言切换按钮

---

## 1️⃣2️⃣ 安全与权限 (Security)

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

-- recent_activities 表 RLS 策略
CREATE POLICY "Users can view their own activities" 
  ON public.recent_activities FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" 
  ON public.recent_activities FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities" 
  ON public.recent_activities FOR DELETE 
  USING (auth.uid() = user_id);
```

### 认证流程

- **Email/Password** 认证 (Supabase Auth)
- **Email 验证** 必须完成后才能登录
- **Session 管理** 通过 Supabase 自动处理
- **Protected Routes** 使用 `ProtectedRoute` 组件

```typescript
// ProtectedRoute 组件
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" replace />;
  
  return <>{children}</>;
}
```

### 敏感数据处理

| 数据类型 | 存储位置 | 保护措施 |
|----------|----------|----------|
| 用户密码 | Supabase Auth | 加密存储，不可读取 |
| API Keys | Supabase Secrets | 仅 Edge Functions 可访问 |
| 面试笔记 | jobs.stages (JSONB) | RLS 保护 |
| 简历文档 | Supabase Storage | Private bucket + RLS |

---

## 1️⃣3️⃣ 配置清单 (Configuration)

### 环境变量

| 变量 | 用途 | 来源 |
|------|------|------|
| `VITE_SUPABASE_URL` | Supabase 项目 URL | 自动配置 |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase Anon Key | 自动配置 |
| `VITE_SUPABASE_PROJECT_ID` | Supabase 项目 ID | 自动配置 |

### Supabase 配置

```toml
# supabase/config.toml
[api]
enabled = true
port = 54321

[db]
port = 54322

[studio]
enabled = true
port = 54323
```

### 文件结构

```
src/
├── App.tsx                    # 主应用入口
├── main.tsx                   # Vite 入口
├── index.css                  # 全局样式
├── components/
│   ├── analytics/             # Analytics 相关组件
│   ├── interview-prep/        # Interview Prep 组件
│   ├── interview/             # 面试记录组件
│   ├── jobs/                  # Job Board 组件
│   ├── layout/                # 布局组件
│   ├── pipeline/              # Pipeline 组件
│   ├── timeline/              # Timeline 组件
│   └── ui/                    # shadcn/ui 组件
├── contexts/
│   ├── AuthContext.tsx        # 认证上下文
│   └── JobsContext.tsx        # Jobs CRUD 上下文
├── hooks/
│   ├── useActivities.tsx      # 活动记录 hook
│   ├── useJobs.tsx            # Jobs hook (已迁移到 Context)
│   └── useLanguage.ts         # 语言 hook
├── lib/
│   ├── i18n/                  # 国际化配置
│   ├── pipeline-resolver.ts   # Pipeline 状态解析
│   ├── pipeline-utils.ts      # Pipeline 工具函数
│   ├── timezone.ts            # 时区处理
│   └── utils.ts               # 通用工具
├── pages/
│   ├── Analytics.tsx          # AI 分析中心
│   ├── AnalyzeInterview.tsx   # 快速分析
│   ├── Archive.tsx            # 职业回顾
│   ├── Auth.tsx               # 登录/注册
│   ├── Dashboard.tsx          # 主页
│   ├── Index.tsx              # 重定向
│   ├── InterviewAnalysis.tsx  # (Legacy)
│   ├── InterviewPrep.tsx      # 面试准备
│   ├── JobBoard.tsx           # Kanban 看板
│   ├── JobDetail.tsx          # 岗位详情
│   ├── NotFound.tsx           # 404
│   └── Timeline.tsx           # 全局时间线
├── types/
│   ├── analytics.ts           # 分析类型
│   ├── career-growth.ts       # 成长分析类型
│   ├── career-signals.ts      # 信号类型
│   ├── interview-pipeline.ts  # Pipeline 类型
│   ├── interview-prep.ts      # 面试准备类型
│   ├── interview.ts           # 面试类型
│   ├── job.ts                 # Job 核心类型
│   ├── role-debrief.ts        # Role Debrief 类型
│   └── transcript-analysis.ts # Transcript 分析类型
└── integrations/
    └── supabase/
        ├── client.ts          # Supabase 客户端
        └── types.ts           # 数据库类型 (自动生成)
```

---

## 1️⃣4️⃣ 未来规划 (Roadmap)

### 短期 Roadmap (v1.x)

| 版本 | 功能 | 优先级 | 状态 |
|------|------|--------|------|
| v1.1 | 多语言 Coach Message (中/英) | 高 | ✅ 完成 |
| v1.2 | 完整国际化覆盖 | 高 | ✅ 完成 |
| v1.3 | 面试日历集成 (Google Calendar) | 高 | 📋 计划中 |
| v1.4 | 移动端适配优化 | 中 | 📋 计划中 |
| v1.5 | 导出功能 (PDF 报告) | 中 | 📋 计划中 |

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
| **Voice Recording** | 面试录音 + 自动转写 |
| **Browser Extension** | LinkedIn/Boss 一键导入 |

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

| 等级 | Key | Emoji | 中文 | English |
|------|-----|-------|------|---------|
| 5 | `great` | 🎉 | 非常好 | Great |
| 4 | `good` | 😊 | 还不错 | Good |
| 3 | `neutral` | 😐 | 一般般 | Neutral |
| 2 | `poor` | 😔 | 不太好 | Poor |
| 1 | `bad` | 😢 | 很糟糕 | Bad |

### C. Pipeline Resolver 状态映射

| 状态类型 | 条件 | 显示文本 |
|----------|------|----------|
| `next_interview` | 有 scheduled stage | "Next: {stage.name}" |
| `feedback_pending` | 有 feedback_pending stage | "Awaiting feedback" |
| `offer` | offer stage completed | "Offer received" |
| `rejected` | 有 rejected result | "Ended at {stage.name}" |
| `applied` | 默认状态 | "Applied" |

### D. 快捷键

| 快捷键 | 功能 | 页面 |
|--------|------|------|
| `⌘ + K` | 全局搜索 | 所有页面 |
| `⌘ + N` | 新建 Job | Job Board |
| `Esc` | 关闭对话框 | 所有对话框 |

---

## 📞 联系

- **产品问题**: 通过 OfferMind 内置反馈
- **技术支持**: Lovable Cloud 控制台
- **文档更新**: 本文档会随产品迭代持续更新

---

> **Last Updated**: 2026-02-08  
> **Document Version**: 2.0  
> **Status**: Production Ready
