
# 功能升级：文字级别精准马赛克选择

## 当前实现的局限

现在的隐私模式是**整块遮挡**——点击一张题目卡片，整道题目文字都模糊；点击"表现良好"，整个列表都消失。用户的需求是：只遮挡一道题里的某几个字，或者一段复盘里的某个公司项目名词。

## 核心技术方案：文字划选 + 高亮标注

实现思路分两步：

**Step 1：用户"划选"文字**
在隐私模式开启时，用户可以像平时选文字一样，在海报预览区域用鼠标拖拽选中某段文字。此时浏览器的 `Selection API`（`window.getSelection()`）会记录选中范围。

**Step 2：把选中范围转为"遮挡片段"**
当用户松开鼠标，系统读取 `Selection` 对象，记录：
- 选中文字所在的内容块 ID（如 `question-0`、`reflection-summary`）
- 选中文字在该块中的起始/结束字符偏移量（`anchorOffset` / `focusOffset`）

然后把对应的文字片段渲染为：**前段正常文字 + 中间遮挡块（blur灰条）+ 后段正常文字**，整段文字在 DOM 中被拆分为三个 `<span>`，中间那段加上 blur 样式。

## 数据结构

```typescript
interface TextRedaction {
  blockId: string;     // 'question-0', 'reflection-summary' 等
  start: number;       // 字符起始偏移
  end: number;         // 字符结束偏移
  text: string;        // 被遮挡的原文（用于调试和撤销）
}

// 状态：多条遮挡记录，可逐条撤销
const [textRedactions, setTextRedactions] = useState<TextRedaction[]>([]);
```

## 渲染方式：文字分段 + 行内 blur

每个可遮挡的文本区块（题目文字、复盘段落、列表条目）都用一个辅助组件 `RedactableText` 来渲染：

```
"金融客户具体的工作流中有哪些需要AI赋能"
        ↓ 用户划选"金融客户"
"████ 具体的工作流中有哪些需要AI赋能"
  ↑ 灰色blur span，宽度与文字等宽
```

具体 DOM 结构：
```tsx
<span>
  <span>具体的工作流中有哪些需要</span>         {/* 前段 */}
  <span style={{ filter:'blur(5px)', backgroundColor:'#d1d5db' }}>金融客户</span>  {/* 遮挡 */}
  <span>AI赋能</span>                              {/* 后段 */}
</span>
```

## 交互流程

```text
开启隐私模式
      ↓
海报预览区显示「用鼠标划选文字可打马赛克」提示
      ↓
用户在题目或复盘文字上拖拽选中部分词句
      ↓
松开鼠标 → 弹出一个小型浮动菜单（Tooltip）
  [ 🛡️ 打上马赛克 ]  [ 取消 ]
      ↓
点击「打上马赛克」→ 选中的文字变为灰色模糊条
再次点击遮挡条 → 可以撤销
      ↓
下载图片时，分段渲染的 blur 被 html-to-image 完整捕获
```

## 小浮动菜单（Selection Toolbar）

当用户松开鼠标后（`mouseup` 事件），计算选区位置，在选区正上方或正下方显示一个小按钮：

```
  ┌──────────────┐
  │ 🛡️ 打上马赛克 │  ← 绝对定位，跟随选区位置
  └──────────────┘
```

实现方式：在海报预览外层的 `div` 上监听 `mouseup`，读取 `window.getSelection()` 的 `getRangeAt(0).getBoundingClientRect()` 获取选区坐标，把按钮定位到该位置。

## 与现有功能的兼容

| 功能 | 处理方式 |
|---|---|
| 原有整块遮挡 | 保留，仍然可以点击整块 |
| 文字级精准遮挡（新增） | 在隐私模式下，划选文字出现小菜单 |
| 下载长图 | 直接用 `html-to-image` 捕获含 blur span 的 DOM，效果正确 |
| 下载小红书版 | 同上，Canvas 切割不影响 span 渲染 |
| 关闭弹窗重置 | `textRedactions` 随弹窗关闭被清空 |

## 需要修改的文件

| 文件 | 改动内容 |
|---|---|
| `src/components/analytics/InterviewPosterModal.tsx` | 新增 `TextRedaction` 类型；新增 `textRedactions` 状态；新增 `RedactableText` 组件（负责按遮挡范围拆分文字为三段 span）；新增 `SelectionToolbar` 浮动按钮；在海报预览容器上监听 `onMouseUp` 处理文字选区；更新各文字内容块使用 `RedactableText` 替代纯文字 |

## 技术细节

### Selection API 读取字符偏移

当用户在一个文字节点上划选时，`window.getSelection()` 返回选区，其中：
- `anchorNode.parentElement`：选区起点所在的 DOM 元素
- `anchorOffset`：起点字符位置
- `focusOffset`：终点字符位置

通过给每个 `RedactableText` 容器设置 `data-block-id` 属性，可以准确判断用户划选的是哪个内容块。

### 多段遮挡叠加

同一个文字块支持多次划选，每次新增一个 `TextRedaction`，渲染时对所有遮挡范围做排序和合并（防止重叠），然后分段渲染。

### 撤销单条遮挡

点击某个遮挡块（灰色模糊条）可以单独取消该条遮挡，而不影响同一块内其他遮挡片段。

## 隐私模式 UI 更新

将现有的提示文字从：
> "点击海报中的题目或复盘区块即可打上马赛克"

更新为：
> "划选文字可精准打马赛克；或点击整块遮挡整段内容"

同时在计数里区分：
> "已精准遮挡 2 处 · 整块遮挡 1 块"

## 改动范围

- 纯前端，无需后端
- 不影响下载/复制/小红书分割逻辑
- 向下兼容：整块遮挡功能保留不变
