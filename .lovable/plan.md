

# 使用 Remotion 创建 OfferMind 宣传短片

## 现实情况说明

Remotion 是一个基于 React 的视频生成框架，但它有一个核心限制：**需要本地 CLI 来渲染导出 MP4 视频**。Lovable 环境无法运行 `npx remotion render` 命令。

因此方案分两部分：

1. **在 Lovable 中完成**：安装 Remotion + Remotion Player，创建所有视频场景的 React 组件，并通过 `<Player>` 组件在浏览器中实时预览
2. **用户本地完成**：将代码 clone 到本地，运行 `npx remotion render` 导出 MP4

## 视频脚本设计（约 30 秒）

| 时间 | 场景 | 内容 |
|------|------|------|
| 0-5s | 开场 | OfferMind Logo 淡入 + Slogan 动画 "每一场面试，都是你的职业资产" |
| 5-12s | 痛点 | 文字动画展示求职痛点："面试完就忘了？""不知道哪里答得不好？""每次都犯同样的错？" |
| 12-20s | 产品展示 | 3 个核心功能卡片依次飞入：AI 面试分析、能力雷达图、职业信号时间线 |
| 20-27s | 数据证明 | 动态数字计数器 "10+ 面试维度分析" "3 层 AI Agent" |
| 27-30s | CTA | "立即体验 OfferMind" + 网址 |

## 技术实现

### 新增依赖
- `remotion` - 核心库
- `@remotion/player` - 浏览器内预览播放器
- `@remotion/cli` (devDependency) - 本地渲染用

### 新增文件结构
```
src/remotion/
  Root.tsx              -- Remotion Composition 注册
  Video.tsx             -- 主视频组件（串联所有场景）
  scenes/
    IntroScene.tsx      -- Logo + Slogan 动画
    PainPointScene.tsx  -- 痛点文字动画
    FeaturesScene.tsx   -- 3 个功能卡片飞入
    StatsScene.tsx      -- 数字计数动画
    CTAScene.tsx        -- 结尾 CTA
  styles.ts             -- 视频专用样式常量
src/pages/PromoVideo.tsx -- 预览页面（嵌入 Remotion Player）
```

### 路由
- 新增 `/promo-video` 路由，展示 Remotion Player 预览

### 导出步骤（用户本地操作）
1. Clone 项目到本地
2. `npm install`
3. `npx remotion render src/remotion/Root.tsx OfferMindPromo out/promo.mp4`

## 局限性
- Lovable 环境中只能**预览**，不能导出 MP4
- 视频中的"产品截图"将使用 CSS 模拟的 UI mockup，而非真实截图
- 如需真实截图，需手动替换图片资源

