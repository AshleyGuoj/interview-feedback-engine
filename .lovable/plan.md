

## 调整侧边栏导航顺序

当前顺序：Dashboard → Jobs → Timeline → Time Tracker → Analytics → Archive

目标顺序：Dashboard → Jobs → Time Tracker → Analytics → Archive → Timeline

### 改动

**`src/components/layout/Sidebar.tsx`** — 调整 `navItems` 数组顺序：

```typescript
const navItems = [
  { to: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/jobs', icon: Briefcase, labelKey: 'nav.jobs' },
  { to: '/time-tracker', icon: Clock, labelKey: 'nav.timeTracker' },
  { to: '/analytics', icon: BarChart3, labelKey: 'nav.analytics' },
  { to: '/archive', icon: Archive, labelKey: 'nav.archive' },
  { to: '/timeline', icon: Calendar, labelKey: 'nav.timeline' },
];
```

只改这一个数组，无其他文件变动。

