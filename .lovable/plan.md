
# 侧边栏导航按钮优化

## 目标

1. 增大每个导航按钮的高度和内边距，让 5 个按钮看起来更饱满、不显得稀疏
2. 选中（active）状态时增强视觉反馈：字体稍大 + 使用 primary 色调

## 改动

**文件：`src/components/layout/Sidebar.tsx`**

### 1. 增大按钮尺寸
- `py-2` 改为 `py-3`（垂直内边距从 8px 增至 12px）
- `space-y-0.5` 改为 `space-y-1`（按钮间距略增）
- 图标从 `w-[18px] h-[18px]` 增大到 `w-5 h-5`（20px）

### 2. Active 状态增强
- 字体大小从统一的 `text-[13px]` 改为：active 时 `text-[14px] font-semibold`，非 active 保持 `text-[13px] font-medium`
- Active 背景改用 `bg-primary/10`，文字颜色改用 `text-primary`，提供更明显的品牌色反馈
- Active 图标同步使用 `text-primary`
- 添加 `transition-all` 使切换时有平滑过渡

### 视觉效果对比

```text
改前（active）:
  [灰底] [灰色图标] Dashboard (13px, medium)

改后（active）:
  [品牌淡紫底] [品牌紫图标] Dashboard (14px, semibold)
```

不涉及其他文件变更。
