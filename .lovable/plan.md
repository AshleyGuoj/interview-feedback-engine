

# 新增中文 Demo 工作区（保留英文 Demo）

## 概述
在保留现有英文 Demo 账号 (`demo@offermind.app`) 的基础上，新增一个中文 Demo 账号，预填充 3 个中国本土 PM 岗位的完整面试数据。

## 中文 Demo 账号信息
- **邮箱**: `demo-cn@offermind.app`
- **密码**: `demo123456cn`

## 3 个中文岗位设计

| 岗位 | 公司 | 状态 | 面试轮数 | 场景 |
|------|------|------|----------|------|
| AI 产品经理 | 字节跳动 | interviewing（面试中） | 4 轮已完成 + 1 轮已排期 | 进展顺利，有竞争 offer |
| 商业化产品经理 | 阿里巴巴 | offer（已拿 offer） | 4 轮完成 + Offer 谈判 | 已收到 offer，正在谈薪 |
| 策略产品经理 | 美团 | closed（已关闭） | 3 轮完成 + 终面被拒 | 终面挂了，但收获很大 |

每轮面试包含 10 道中文面试题、回答摘要、反思笔记、面试官信息。

## 技术实现

### 1. 修改 `create-demo-user/index.ts`
- 在现有逻辑基础上，同时检查并创建中文 Demo 用户 (`demo-cn@offermind.app`)
- 两个账号独立，互不影响

### 2. 新建 `seed-demo-data-cn/index.ts`
- 复制 `seed-demo-data` 的结构，替换为中文内容
- 3 个岗位的完整中文问题库（每轮 10 题）：
  - 字节跳动：HR 筛选、技术理解、产品设计、业务终面
  - 阿里巴巴：HR 面、产品 Sense、交叉面、HM 终面 + Offer
  - 美团：HR 面、产品设计、策略分析、VP 终面（被拒）
- 中文 activities 动态消息

### 3. 在 `supabase/config.toml` 中注册新函数
```
[functions.seed-demo-data-cn]
verify_jwt = false
```

### 4. 修改 Auth 页面 (`src/pages/Auth.tsx`)
- 现有的 "Explore Demo" 按钮保留，改为 "Explore Demo (EN)"
- 新增 "探索中文 Demo" 按钮，调用中文 Demo 的登录流程
- 两个按钮并排或上下排列

### 5. 修改 `JobsContext.tsx`
- 在 `seedDemoData` 中判断当前用户邮箱：
  - 如果是 `demo-cn@offermind.app` → 调用 `seed-demo-data-cn`
  - 如果是 `demo@offermind.app` → 调用 `seed-demo-data`（现有逻辑）
- 使用不同的 localStorage key (`offermind_demo_cn_seeded`) 防止冲突

### 不需要修改的部分
- 数据结构/类型定义不变
- 前端渲染组件不变（已支持中文显示）
- 英文 Demo 的所有逻辑完全不受影响

