

## Time Tracker 精简改动

### 用户需求
1. **去掉"简历筛选"分类** — 不再显示 `resume_screen` 事件
2. **增加 Offer 相关分类** — 显示 `offer_call`、`offer_received`、`hr_final` 阶段
3. **每个 Job 只显示最新阶段** — 如果一个 Job 已经进展到笔试/面试，不再显示它的"投递"事件；只有还停留在 applied / resume_screen 阶段的 Job 才归入"投递"

### 改动文件
仅修改 `src/pages/TimeTracker.tsx` + i18n 翻译文件

### 逻辑变更

**`extractEvents` 函数重写核心逻辑：**

1. **确定每个 Job 的"最高阶段"**：遍历所有 stages，用现有的 `CATEGORY_PRIORITY` 取最高 priority 的 category
2. **按最高阶段决定是否生成 applied 事件**：
   - 最高阶段 ≤ `resume_screen` → 生成 applied 事件
   - 最高阶段 > `resume_screen` → 跳过 applied 事件，只生成最高阶段的事件
3. **过滤掉 `resume_screen` 类型事件** — 完全不生成
4. **新增 `offer_call`、`offer_received`、`hr_final` 映射** — `getEventTypeFromStage` 增加这三个类别，映射到新 EventType

**`EventType` 扩展：**
```
type EventType = 'applied' | 'interview' | 'assessment' | 'written_test' | 'offer' ;
```
将 `hr_final`、`offer_call`、`offer_received` 统一归为 `'offer'` 类型（用同一个分组显示）

**`CATEGORY_ORDER` 更新为：**
```
['applied', 'assessment', 'written_test', 'interview', 'offer']
```

**图标 & 颜色：**
- `offer`: Gift 图标, `text-emerald-500`
- 删除 `resume_screen` 相关配置

### i18n 新增
- `timeTracker.type_offer` / `timeTracker.section_offer`：英文 "Offer"，中文 "Offer 相关"

