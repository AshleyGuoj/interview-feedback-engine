

# 生成 Agent 2 (Role Debrief) n8n 风格工作流图

## 方案

创建一个临时的后端函数，使用 Gemini 图像生成模型根据用户提供的详细 prompt 生成 n8n 风格的工作流图，然后在前端展示。

## 实现步骤

### 1. 创建 Edge Function `generate-workflow-image`

- 接收工作流描述 prompt 作为输入
- 调用 `google/gemini-2.5-flash-image` 模型（支持图像生成）
- 将用户提供的完整 prompt（7 个节点、连线关系、输出结构标注、视觉要求）发送给模型
- 返回生成的 base64 图像数据

### 2. 创建前端页面或组件调用该函数

- 添加一个简单的触发按钮和图像展示区域
- 调用 edge function 获取生成的图片
- 展示结果并支持下载

## 技术细节

- 模型：`google/gemini-2.5-flash-image`（支持图像生成，需设置 `modalities: ["image", "text"]`）
- 如需更高质量可切换为 `google/gemini-3-pro-image-preview`
- Prompt 内容直接使用用户提供的中文描述，包含所有 7 个节点定义、连线关系、输出结构标注和视觉要求
- 生成的图片以 base64 格式返回，前端直接渲染为 `<img>` 标签

