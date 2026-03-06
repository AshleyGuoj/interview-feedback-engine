

## 安全加固计划

根据安全扫描结果，你的平台有几个需要修复的安全问题。好消息是：**密码本身已经是加密存储的**（Lovable Cloud 使用 bcrypt 哈希，数据库中不存储明文密码）。主要需要修复的是以下几个方面：

### 当前安全问题（按优先级排列）

| 问题 | 严重程度 | 说明 |
|------|----------|------|
| 8个 Edge Function 缺少身份验证 | 🔴 高 | 任何人可以直接调用 AI 分析接口，消耗你的 AI 额度 |
| 邀请码表公开可读 | 🔴 高 | 任何人可以通过 API 查看所有邀请码 |
| Edge Function 缺少输入验证 | 🟡 中 | 无长度限制，可能被滥用 |
| 泄露密码保护未启用 | 🟡 中 | 用户可以使用已知泄露的密码注册 |
| Demo 密码硬编码 | 🟢 低 | 源码中可见 demo 账号密码 |

### 修复计划

#### 1. Edge Function 添加身份验证（最重要）
为以下函数添加 JWT 验证：`analyze-interview`, `analyze-transcript`, `analyze-career-growth`, `analyze-career-signals`, `generate-role-debrief`, `parse-document`

每个函数开头加入：
- 检查 Authorization header
- 用 `supabase.auth.getUser()` 验证用户身份
- 未认证返回 401

保留公开的：`verify-invite-code`, `validate-invite-code`, `create-demo-user`（这些本身需要匿名访问）

#### 2. 修复邀请码表 RLS
将 `invitation_codes` 的 SELECT 策略从 `true`（任何人可读）改为仅 admin 可读。`validate-invite-code` 函数已使用 service role key，不受 RLS 影响。

#### 3. Edge Function 输入验证
用 Zod 为每个函数添加输入 schema 验证：字符串长度限制、必填字段检查、类型验证。

#### 4. 启用泄露密码保护
通过 auth 配置启用，防止用户使用已知泄露密码。

#### 5. Demo 密码移至环境变量
将 `create-demo-user` 中的硬编码密码移到 secrets。

### 不需要担心的
- **密码加密**：已自动使用 bcrypt 哈希存储
- **数据传输**：所有 API 通信已使用 HTTPS
- **SQL 注入**：使用 Supabase SDK 的参数化查询，不存在 SQL 注入风险
- **RLS 保护**：`jobs` 和 `recent_activities` 表已有完善的行级安全策略，用户只能访问自己的数据

### 涉及修改的文件

| 文件 | 修改内容 |
|------|----------|
| `supabase/functions/analyze-interview/index.ts` | 添加 auth + 输入验证 |
| `supabase/functions/analyze-transcript/index.ts` | 添加 auth + 输入验证 |
| `supabase/functions/analyze-career-growth/index.ts` | 添加 auth + 输入验证 |
| `supabase/functions/analyze-career-signals/index.ts` | 添加 auth + 输入验证 |
| `supabase/functions/generate-role-debrief/index.ts` | 添加 auth + 输入验证 |
| `supabase/functions/parse-document/index.ts` | 添加 auth + 输入验证 |
| `supabase/functions/create-demo-user/index.ts` | 密码移至环境变量 |
| 数据库迁移 | 修复 invitation_codes SELECT 策略 |

