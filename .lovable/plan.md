

# Dashboard Career Health 指标图标升级

## 目标

为 Career Health 栏的 4 个指标（Active Applications、Interviewing、Offers Received、Response Rate）各添加一个精致的 Lucide 图标，让用户一眼就能识别每个指标的含义。

## 设计方案

每个指标数字上方放置一个小型图标，使用 `text-primary/40` 的低饱和度风格，不喧宾夺主但提供视觉锚点：

| 指标 | 图标 | 理由 |
|------|------|------|
| Active Applications | `Briefcase` | 代表工作申请/职位 |
| Interviewing | `MessageSquare` | 代表对话/面试交流 |
| Offers Received | `Gift` | 代表收到的 offer |
| Response Rate | `TrendingUp` | 代表比率/趋势 |

图标尺寸 `w-4 h-4`，颜色 `text-primary/40`，放在数字上方，与现有排版层级融合。

## 改动

**文件：`src/pages/Dashboard.tsx`**

1. 导入 4 个 Lucide 图标：`Briefcase`, `MessageSquare`, `Gift`, `TrendingUp`
2. 修改 `MetricCell` 组件，新增可选 `icon` prop（接收 `React.ReactNode`）
3. 在 `CareerHealthBar` 中为每个 `MetricCell` 传入对应图标

```text
改前：
  数字
  标签
  提示

改后：
  [图标]
  数字
  标签
  提示
```

不涉及其他文件或样式变更。

