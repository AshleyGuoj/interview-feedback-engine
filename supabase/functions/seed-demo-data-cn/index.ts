import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── 字节跳动 AI 产品经理 题库 ──

const byteHRQuestions = [
  { id: "q-b-hr1", question: "你为什么想加入字节跳动做 AI 产品经理？", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "从用户视角出发，字节的推荐算法改变了内容消费方式。我希望在 AI 原生产品上发力，字节的技术基因和快速迭代文化非常契合我的职业发展方向。" },
  { id: "q-b-hr2", question: "说一个你推动跨部门协作的经历。", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "之前推动过一个涉及算法、运营、设计三个团队的项目。通过建立周会对齐机制和共享看板，将交付周期从 6 周缩短到 3 周。关键是让每个人看到全局而非只关注自己的模块。" },
  { id: "q-b-hr3", question: "你对 AI 产品的理解是什么？和传统互联网产品有什么区别？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "AI 产品的核心区别在于：1）不确定性更高，模型输出不完全可控；2）需要设计容错机制和用户预期管理；3）数据飞轮是护城河。传统产品是确定性逻辑，AI 产品是概率性逻辑。" },
  { id: "q-b-hr4", question: "你觉得自己最大的优势和劣势分别是什么？", category: "behavioral", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "优势是结构化思维强，能快速将模糊问题拆解为可执行方案。劣势是有时过于追求完美，需要学会在 80 分方案时就快速推进。" },
  { id: "q-b-hr5", question: "如果字节和另一家大厂同时给你 offer，你怎么选？", category: "motivation", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "核心看三点：团队和直属 leader 的 match 度、产品方向是否在 AI 前沿、个人成长空间。薪酬是必要条件但不是充分条件。坦诚说字节的 AI 布局对我吸引力很大。" },
  { id: "q-b-hr6", question: "你如何看待 996 和高强度工作文化？", category: "behavioral", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "我认为高效产出比工作时长更重要。在关键项目节点我愿意全力投入，但持续的低效加班是组织问题而非个人选择。我更看重结果导向的文化。" },
  { id: "q-b-hr7", question: "描述一次你用数据驱动决策的经历。", category: "experience", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "通过埋点分析发现注册转化在第三步流失率达 40%。深挖发现是手机号验证环节的等待时间过长。推动技术团队将验证码发送从 5 秒优化到 1 秒，转化率提升 22%。" },
  { id: "q-b-hr8", question: "你平时怎么保持对行业趋势的敏感度？", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "三个渠道：1）每天刷即刻和 Twitter 上的 AI 圈讨论；2）每周读 2-3 篇 AI 产品的深度分析；3）自己动手玩新产品，写使用笔记。最近在深度体验 Cursor 和 Claude 的工作流。" },
  { id: "q-b-hr9", question: "你在团队中通常扮演什么角色？", category: "behavioral", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "通常是'翻译官'角色——在技术团队和业务团队之间搭建沟通桥梁。能理解工程师的技术约束，也能将业务需求转化为清晰的产品方案。" },
  { id: "q-b-hr10", question: "你对字节跳动的哪个产品最感兴趣？为什么？", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "豆包。因为它是字节在 AI 对话产品上的核心布局，既有海量用户基础又有模型能力。我特别感兴趣的是如何把大模型能力融入具体场景，而不是做一个通用聊天工具。" },
];

const byteTechQuestions = [
  { id: "q-b-t1", question: "如何评估一个大模型的产品化能力？你会关注哪些指标？", category: "technical", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "分三层：1）基础能力——准确率、延迟、成本；2）产品体验——首 token 延迟、输出一致性、安全性；3）用户价值——任务完成率、用户满意度、留存率。不同场景权重不同。" },
  { id: "q-b-t2", question: "设计一个 AI 内容审核系统的产品方案。", category: "technical", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "三级架构：第一层机器自动审核（覆盖 95%），第二层人机协作审核（边界case），第三层人工复审+申诉。关键是设计好置信度阈值和升级规则，同时建立审核标准的持续迭代机制。" },
  { id: "q-b-t3", question: "你如何向非技术团队解释推荐算法的工作原理？", category: "technical", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "我会用'图书管理员'的比喻：算法就像一个超级图书管理员，它记住了你看过什么、停留多久、跳过什么，然后从百万本书里猜你下一本想看的。越用越准，因为它在不断学习你的口味。" },
  { id: "q-b-t4", question: "如果模型幻觉（hallucination）影响了用户体验，你怎么解决？", category: "technical", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "短期：增加引用溯源功能、添加置信度提示、设计用户反馈通道。中期：RAG 增强、事实验证链路。长期：和模型团队一起优化训练数据和对齐方式。产品层面最重要的是管理用户预期。" },
  { id: "q-b-t5", question: "如何设计 A/B 实验来验证 AI 功能的效果？", category: "technical", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "AI 功能的 ABTest 特殊性在于：1）需要更长的实验周期（用户需要学习）；2）要关注二阶指标（不只是 CTR，还有任务完成质量）；3）要设计好降级方案，避免 bad case 扩散。" },
  { id: "q-b-t6", question: "你对 Prompt Engineering 和 Fine-tuning 的边界怎么理解？", category: "technical", difficulty: 4, wasAsked: true, answeredWell: false, myAnswer: "回答了大方向：Prompt 适合快速迭代和验证，Fine-tuning 适合稳定高频场景。但在被追问具体 fine-tuning 的成本和时间估算时，缺乏实战经验，回答不够具体。" },
  { id: "q-b-t7", question: "如何设计一个 AI 客服系统的产品架构？", category: "technical", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "意图识别 → 知识库检索 → 回复生成 → 质量检测 → 人工兜底。关键设计点：无缝转人工的触发条件、上下文记忆管理、满意度实时追踪。" },
  { id: "q-b-t8", question: "你如何理解'数据飞轮'在 AI 产品中的作用？", category: "technical", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "用户使用 → 产生数据 → 优化模型 → 提升体验 → 吸引更多用户。飞轮的关键是设计好数据回收机制和标注效率。举了抖音推荐系统的例子——用户的每次滑动都是一次隐式标注。" },
  { id: "q-b-t9", question: "AI 产品的安全边界怎么设计？", category: "technical", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "分三道防线：1）输入层——敏感词过滤和意图检测；2）模型层——安全对齐和输出约束；3）产品层——审核机制和降级方案。还需要建立红蓝对抗机制，定期压测。" },
  { id: "q-b-t10", question: "如果让你设计一个 AI 写作助手的核心功能，你会怎么规划？", category: "technical", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "核心是'增强而非替代'。MVP 三个功能：1）智能续写（基于上下文）；2）风格调整（正式/口语切换）；3）内容优化建议（逻辑、表达、结构）。后续迭代加入模板库和写作数据分析。" },
];

const byteProductQuestions = [
  { id: "q-b-p1", question: "如何提升豆包 App 的日活跃用户数？", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "拆解 DAU = 新增 × 激活率 + 存量 × 留存率。新增侧：强化社交裂变（分享对话截图）和场景化入口（浏览器插件、输入法集成）。留存侧：建立使用习惯（每日推荐话题、连续使用激励）。" },
  { id: "q-b-p2", question: "设计一个 AI 会议纪要产品的核心功能。", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "核心链路：录音 → 转写 → 结构化提取（决议、待办、问题） → 自动分发。差异化：1）多人发言人识别；2）跨会议的议题追踪；3）和飞书文档的深度集成。" },
  { id: "q-b-p3", question: "你如何判断一个 AI 功能是'锦上添花'还是'雪中送炭'？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "看三个信号：1）用户在没有 AI 前是否有替代方案（有 → 锦上添花）；2）使用频次（日用 vs 偶尔 → 高频是雪中送炭）；3）付费意愿（是否愿意为此单独付费）。" },
  { id: "q-b-p4", question: "抖音的推荐算法如果出现信息茧房问题，你怎么从产品层面解决？", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "产品策略：1）增加探索频道（用户主动破茧）；2）推荐中增加多样性权重（兴趣相关但品类不同）；3）透明化推荐原因（让用户理解和调整）；4）定期推送'兴趣报告'引导用户反思。" },
  { id: "q-b-p5", question: "如何衡量一个 AI 对话产品的用户满意度？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "定量：任务完成率、对话轮数（越少越好）、用户主动评分、次日回访率。定性：定期用户访谈、Bad case 分析、竞品对比测试。要避免只看 NPS 这种粗粒度指标。" },
  { id: "q-b-p6", question: "设计一个面向中小企业的 AI 营销工具。", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "核心痛点：中小企业缺人做内容。产品方案：输入商品信息 → AI 生成多平台适配的营销文案+图片 → 一键发布到抖音/小红书/微信。变现模式：按生成次数收费+高级模板订阅。" },
  { id: "q-b-p7", question: "你如何做产品需求优先级排序？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "RICE 框架的改良版：影响用户数 × 使用频次 × 战略对齐度 ÷ 开发成本。但数字只是辅助，最终要结合用户反馈的紧迫程度和竞争格局来判断。每个季度重新校准一次。" },
  { id: "q-b-p8", question: "如果你是豆包的 PM，你的 Q3 规划是什么？", category: "case", difficulty: 5, wasAsked: true, answeredWell: true, myAnswer: "三个方向：1）场景深入——强化办公场景（文档摘要、邮件撰写）；2）能力升级——支持多模态（图片理解和生成）；3）生态建设——开放插件平台，引入第三方能力。核心 OKR：DAU 翻倍 + 7 日留存提升 10%。" },
  { id: "q-b-p9", question: "如何设计 AI 产品的新手引导流程？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "AI 产品的特殊性在于用户不知道'能做什么'。方案：1）预置高频 prompt 模板（一键体验）；2）渐进式能力展示（每次用完推荐相关功能）；3）示例对话库（降低使用门槛）。" },
  { id: "q-b-p10", question: "你最近用过的印象最深的 AI 产品是什么？为什么？", category: "product", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "Cursor IDE。因为它把 AI 能力嵌入了工程师的核心工作流，而不是让你离开 IDE 去用另一个工具。这种'原生集成'而非'独立入口'的设计理念值得所有 AI PM 学习。" },
];

const byteFinalQuestions = [
  { id: "q-b-f1", question: "你如何看待字节在 AI 领域的布局和竞争优势？", category: "motivation", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "字节的优势在三点：1）海量数据和场景（抖音+飞书+教育）；2）工程文化强，能快速将模型落地；3）全球化视野（同时布局国内外）。挑战是模型基础能力相比 OpenAI 仍有差距。" },
  { id: "q-b-f2", question: "如果你负责的 AI 产品 DAU 连续两周下滑，你怎么处理？", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "48 小时内：拆解数据（新增 vs 留存？哪个渠道？哪个功能？）。一周内：找到 Top 3 原因，设计针对性实验。两周内：上线至少一个快速修复。同步向上管理——透明沟通原因和行动计划。" },
  { id: "q-b-f3", question: "你怎么看 AI 产品的商业化？免费 vs 付费怎么平衡？", category: "product", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "核心原则：基础能力免费（建规模），高级能力付费（建收入）。分界线看两点：1）用户是否形成依赖；2）该功能的边际成本。例如基础对话免费，长文档分析和 API 调用收费。" },
  { id: "q-b-f4", question: "你对 AI PM 这个岗位的理解是什么？和传统 PM 有什么不同？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "AI PM 需要多一层'模型思维'：理解模型能力边界、懂得设计评估标准、能和算法团队深度对话。但不是要求你会训练模型——核心还是用户洞察和产品设计能力。" },
  { id: "q-b-f5", question: "描述一个你从 0 到 1 推动产品上线的完整过程。", category: "experience", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "在上一家公司做了一个智能客服的 MVP：需求调研（2周）→ PRD 撰写（1周）→ 设计评审（3天）→ 开发（4周）→ 灰度测试（2周）→ 全量上线。上线后客服工单减少 35%。" },
  { id: "q-b-f6", question: "如何管理和算法工程师的合作关系？", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "三个关键：1）尊重专业——不指挥他们怎么调参，而是明确效果目标；2）提供高质量的 case 分析——不只说'不好'，而是给出具体的 bad case 和期望；3）共同定义评估指标。" },
  { id: "q-b-f7", question: "如果团队对你的产品方案意见分歧很大，你怎么推进？", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "先倾听——理解每个反对意见的核心诉求。然后判断分歧类型：数据可验证的 → 做实验；价值观差异 → 向上找对齐；信息不对称 → 补齐信息。最后果断决策并确保执行。" },
  { id: "q-b-f8", question: "你觉得什么样的 AI 产品是一个'好产品'？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "三个标准：1）解决了用户的真实痛点（不是炫技）；2）AI 的引入确实比传统方案效率高 2 倍以上；3）用户能理解和信任它（不是黑盒）。一个好的 AI 产品应该让用户忘记 AI 的存在。" },
  { id: "q-b-f9", question: "最后，你有什么想问我的？", category: "motivation", difficulty: 1, wasAsked: true, answeredWell: true, myAnswer: "问了三个问题：1）团队目前最大的技术挑战是什么？2）这个岗位未来半年最重要的目标是什么？3）团队的决策文化是怎样的？面试官回答很详细，感觉团队氛围不错。" },
  { id: "q-b-f10", question: "请你做一个简短的自我介绍，重点突出你做 AI PM 的核心竞争力。", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "4 年产品经验，其中 2 年专注 AI 方向。核心竞争力：1）能和算法团队深度对话（学过机器学习基础）；2）善于将模糊的 AI 能力翻译为清晰的产品方案；3）数据驱动决策，上一个 AI 产品做到了 50 万月活。" },
];

// ── 阿里巴巴 商业化产品经理 题库 ──

const aliHRQuestions = [
  { id: "q-a-hr1", question: "你为什么选择阿里巴巴？对商业化方向怎么理解？", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "阿里的电商生态提供了最丰富的商业化场景。商业化 PM 的核心是在用户价值和商业价值之间找到最优解——好的商业化产品应该让用户觉得'有用'而非'被打扰'。" },
  { id: "q-a-hr2", question: "你过去做过哪些跟商业化相关的项目？", category: "experience", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "做过两个：1）信息流广告的竞价排名优化，CTR 提升 18%；2）会员订阅体系从月付到年付的转化优化，ARPU 提升 25%。两个项目都需要平衡用户体验和收入目标。" },
  { id: "q-a-hr3", question: "你怎么看待'增长'和'商业化'的关系？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "增长是做大蛋糕，商业化是切蛋糕。最好的商业化是增长的一部分——比如推荐算法既提升了用户体验（增长），又提高了广告精准度（商业化）。最怕的是'杀鸡取卵'式的商业化。" },
  { id: "q-a-hr4", question: "描述一次你在压力下做出关键决策的经历。", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "618 大促前发现广告投放系统有 bug 导致部分商家预算消耗异常。在 2 小时内决定回滚系统并补偿受影响商家。虽然短期收入下降，但维护了商家信任，后续续费率反而上升。" },
  { id: "q-a-hr5", question: "你如何处理和上级意见不一致的情况？", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "先确保自己的判断有数据支撑。然后用'我理解你的考虑是 X，我的数据显示 Y，我建议我们用 Z 方案来验证'的方式沟通。如果最终上级仍然坚持，我会执行并追踪结果。" },
  { id: "q-a-hr6", question: "你对阿里巴巴的企业文化了解多少？", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "了解六脉神剑的核心价值观，特别认同'客户第一'和'拥抱变化'。在快速变化的商业化环境中，拥抱变化意味着快速试错和迭代，这和我的工作方式很匹配。" },
  { id: "q-a-hr7", question: "你的职业规划是什么？3-5 年后想做什么？", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "短期（1-2 年）：深入理解电商商业化的完整链路，成为细分领域的专家。中期（3-5 年）：能独立负责一条商业化产品线，带团队。长期：成为既懂商业又懂技术的复合型产品负责人。" },
  { id: "q-a-hr8", question: "说一个你失败的项目经历和你从中学到了什么。", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "做了一个商家自助投放工具，上线后使用率只有预期的 30%。复盘发现问题在于没有做够商家调研——中小商家需要的不是'灵活配置'而是'一键投放'。教训：不要把专家能力强加给小白用户。" },
  { id: "q-a-hr9", question: "你觉得一个优秀的商业化 PM 需要具备什么能力？", category: "product", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "三个核心能力：1）商业敏感度——能从用户行为中发现变现机会；2）数据分析能力——能建立完整的商业化指标体系；3）平衡感——在用户体验和收入增长之间找到可持续的均衡点。" },
  { id: "q-a-hr10", question: "你目前的薪资预期是多少？", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "基于我的经验和市场水平，期望 base 在 40-50K/月，加上年终奖和股票激励。当然这个范围是可以讨论的，我更看重的是岗位发展空间和团队氛围。" },
];

const aliProductQuestions = [
  { id: "q-a-p1", question: "如何提升淘宝直播的商家转化率？", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "拆解漏斗：曝光→点击→观看→互动→下单→支付。关键优化点：1）AI 智能封面提升点击率；2）直播间内商品卡片优化（价格+库存紧迫感）；3）优惠券自动弹出时机优化。预计整体转化提升 15-20%。" },
  { id: "q-a-p2", question: "设计一个针对中小商家的智能投放工具。", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "核心理念：'傻瓜式'操作。方案：商家上传商品 → AI 分析商品特征和目标人群 → 自动生成投放计划（预算分配、出价策略、创意推荐） → 一键投放 → 实时效果报告。降低中小商家的投放门槛。" },
  { id: "q-a-p3", question: "淘宝首页的推荐信息流如何平衡广告和自然内容的比例？", category: "product", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "原则：用户体验优先。方案：1）设定广告密度上限（每 5 个自然内容不超过 1 个广告）；2）广告质量门槛（CTR 低于阈值的广告不展示）；3）用户反馈机制（屏蔽/不感兴趣）影响后续推荐。" },
  { id: "q-a-p4", question: "如何设计一个商家会员体系来提升复购率？", category: "case", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "三层体系：普通→银牌→金牌。升级逻辑基于消费频次而非金额（鼓励复购）。权益设计：专属折扣、新品优先购、免运费、1对1客服。关键是让商家感受到会员带来的增量 GMV。" },
  { id: "q-a-p5", question: "竞品拼多多的百亿补贴对淘宝的商业化有什么启示？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "启示：1）价格力仍是电商核心竞争力；2）补贴不是亏损而是获客投资（用户 LTV > CAC）；3）淘宝应该用差异化策略——不是比拼补贴力度，而是提升服务品质和信任感。" },
  { id: "q-a-p6", question: "如何衡量一个广告产品的健康度？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "四个维度：1）效率——eCPM 和填充率；2）效果——广告主 ROI 和续投率；3）体验——用户负反馈率和 Ad Load 影响的留存变化；4）生态——中小广告主占比和广告主多样性。" },
  { id: "q-a-p7", question: "设计一个基于 AI 的商品定价建议工具。", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "输入：商品信息+竞品价格+市场数据+商家成本。输出：建议定价区间+弹性分析+促销策略建议。核心算法：基于同类商品的价格-销量弹性曲线，找到利润最大化的价格点。" },
  { id: "q-a-p8", question: "如果让你负责双 11 的商业化产品规划，你的核心策略是什么？", category: "case", difficulty: 5, wasAsked: true, answeredWell: true, myAnswer: "三个阶段：预热期（提升商家投放预算，预售机制拉动确定性订单）→ 爆发期（实时竞价+流量分发优化）→ 返场期（尾货清仓+会员专属）。核心 KPI：GMV 增速 > 广告收入增速，确保生态健康。" },
  { id: "q-a-p9", question: "你如何看待内容化（短视频/直播）对电商商业化的影响？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "内容化改变了'人找货'到'货找人'的逻辑。对商业化的影响：1）广告形态从图文变为视频（制作成本上升但效果更好）；2）KOL/直播间成为新的流量入口；3）需要新的效果衡量体系（GMV vs 品牌曝光）。" },
  { id: "q-a-p10", question: "如何说服一个传统品牌商家增加线上广告投放预算？", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "用数据说话：1）展示同行业标杆商家的 ROI 数据；2）提供 30 天免费试投计划降低决策门槛；3）一对一的投放方案定制（不是卖广告，是帮他们做生意）。关键是建立信任，从小预算做起。" },
];

const aliCrossQuestions = [
  { id: "q-a-c1", question: "你如何评估一个商业化项目的优先级？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "三个维度打分：1）收入影响（增量 GMV × 变现率）；2）用户影响（正面 vs 负面体验变化）；3）战略对齐度（是否符合公司年度重点）。最终用加权评分排序，但保留 20% 的资源给探索性项目。" },
  { id: "q-a-c2", question: "和你合作过的工程师对你的评价通常是什么？", category: "behavioral", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "通常的反馈是'需求讲得清楚，不会频繁变更，有理有据'。他们最喜欢的一点是我会在需求文档里写清楚'为什么做'和'不做什么'，减少了很多沟通成本。" },
  { id: "q-a-c3", question: "如何处理商家和平台利益冲突的情况？", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "用长期视角看：平台的利益和商家的利益本质上是一致的——商家赚到钱才会持续在平台经营。短期冲突时（如平台补贴导致商家利润下降），需要透明沟通并提供替代方案。" },
  { id: "q-a-c4", question: "你在数据分析方面的能力如何？能用 SQL 吗？", category: "technical", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "熟练使用 SQL 做日常分析（JOIN、窗口函数、子查询都没问题）。也会用 Python 做更复杂的数据处理和可视化。日常用数据看板监控核心指标，有异常时能自己排查。" },
  { id: "q-a-c5", question: "描述一个你和设计师产生分歧的情况和解决方式。", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "设计师想做一个视觉效果很酷但可能影响转化的广告样式。我没有直接否定，而是建议做 ABTest——结果数据显示新样式的转化率确实下降了 8%。但我们从中提取了部分设计元素用在其他场景，双方都有收获。" },
  { id: "q-a-c6", question: "你如何理解'用户增长'和'商业增长'的区别？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "用户增长关注的是用户规模和活跃度（DAU、留存），商业增长关注的是变现效率（ARPU、收入）。理想状态是两者同向增长。但现实中经常需要取舍——比如增加广告密度能短期提升收入但可能伤害用户留存。" },
  { id: "q-a-c7", question: "如果你的产品方案被否决了，你会怎么做？", category: "behavioral", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "先理解否决的原因——是数据不够充分、方向不对、还是时机不对。如果我仍然相信这个方案，会用更扎实的数据重新包装。如果确实是我判断有误，会诚实承认并快速调整方向。" },
  { id: "q-a-c8", question: "你如何看待大模型对电商商业化的影响？", category: "product", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "三个方向：1）智能导购（AI 理解用户需求并推荐商品）；2）智能创意（AI 自动生成广告素材）；3）智能投放（AI 优化出价和人群定向）。长期来看，AI 会让商业化从'流量买卖'升级为'价值匹配'。" },
  { id: "q-a-c9", question: "你最得意的一个项目数据是什么？", category: "experience", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "重新设计了广告的 eCPM 排序算法，将广告质量分（预估 CTR × CVR）的权重从 40% 提升到 60%。结果：广告主平均 ROI 提升 20%，用户负反馈率下降 15%，平台收入反而增长了 8%（因为续投率大幅提升）。" },
  { id: "q-a-c10", question: "你期望在阿里学到什么？", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "三个方面：1）大规模商业化系统的设计和运营经验；2）复杂生态（商家、用户、平台）的平衡艺术；3）数据驱动决策的最佳实践。阿里的电商体量级是独一无二的学习场景。" },
];

const aliHMQuestions = [
  { id: "q-a-hm1", question: "如果让你接手一条新的商业化产品线，前 30 天你会做什么？", category: "experience", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "第 1 周：深度了解产品现状（数据、用户、竞品）。第 2 周：和关键 stakeholder 1v1 沟通（老板、工程师、运营）。第 3-4 周：制定 90 天行动计划并和团队对齐。核心是'先听后做'。" },
  { id: "q-a-hm2", question: "你怎么看待阿里和字节在商业化领域的竞争？", category: "product", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "阿里的优势在电商闭环（搜索→推荐→交易→售后），字节的优势在内容驱动的增量场景。两者本质上在争夺商家的广告预算。阿里要做的是提升确定性（ROI 可预期），而非单纯追赶内容化。" },
  { id: "q-a-hm3", question: "你如何管理上下游团队的期望？", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "透明沟通、定期同步、管理承诺。我的经验是：宁愿在初期给一个保守的预期然后超额交付，也不要过度承诺导致信任受损。每周发送项目进展邮件，让所有人保持信息同步。" },
  { id: "q-a-hm4", question: "说一个你帮团队解决瓶颈的案例。", category: "experience", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "团队在做广告效果归因时遇到了多渠道重叠的问题（多触点归因）。我推动引入了基于马尔可夫链的归因模型，替代了简单的末次点击归因。结果让商家更准确地看到每个广告渠道的真实贡献。" },
  { id: "q-a-hm5", question: "你觉得这个岗位对你最大的挑战是什么？", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "两个挑战：1）阿里的组织复杂度比我之前的公司高很多，跨BU协作需要更强的沟通能力；2）电商商业化的数据维度比我之前做的更广，需要快速建立行业认知。但我把这些当成成长机会而非障碍。" },
  { id: "q-a-hm6", question: "如果你的 OKR 和另一个团队的 OKR 冲突了，怎么处理？", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "先理解冲突的本质——是目标冲突还是路径冲突。如果是路径冲突，通常能找到双赢方案。如果是目标冲突，需要向上找共同的上级对齐优先级。关键是对事不对人，用数据说话。" },
  { id: "q-a-hm7", question: "你认为最好的产品经理应该具备什么特质？", category: "product", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "三个特质：1）好奇心——对用户、市场、技术保持持续的探索欲；2）判断力——在信息不完整时能做出合理决策；3）执行力——不只是想清楚，还要推得动。好 PM = 想得清 × 推得动 × 学得快。" },
  { id: "q-a-hm8", question: "和你的面试表现一起考虑，你觉得 offer 谈判中你的筹码是什么？", category: "motivation", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "三个筹码：1）有字节的竞争 offer，时间窗口有限；2）我在广告商业化领域有可直接复用的经验和数据案例；3）面试全程表现稳定，多轮面试官给了积极反馈。我期望一个有竞争力的 package。" },
  { id: "q-a-hm9", question: "你对团队管理有兴趣吗？还是更想走专家路线？", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "短期偏向专家路线——先在一个领域做到足够深。中期愿意尝试带小团队（3-5 人），积累管理经验。我认为好的管理者首先应该是专业过硬的个人贡献者。" },
  { id: "q-a-hm10", question: "你期望的入职时间是什么时候？", category: "motivation", difficulty: 1, wasAsked: true, answeredWell: true, myAnswer: "如果一切顺利，我可以在收到正式 offer 后 2-3 周内入职。目前需要处理当前公司的交接工作。" },
];

// ── 美团 策略产品经理 题库 ──

const meituanHRQuestions = [
  { id: "q-m-hr1", question: "你为什么想来美团做策略产品经理？", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "美团的本地生活场景是策略产品最好的练兵场——供给侧复杂（百万商家）、需求侧多样（用户偏好千人千面）、时效性强（30 分钟配送）。策略 PM 能在这里产生最大的杠杆效应。" },
  { id: "q-m-hr2", question: "你对'策略产品'的理解是什么？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "策略产品是用算法和数据驱动的产品——核心是把业务规则翻译成可量化、可优化的策略。比如外卖的配送调度、搜索排序、定价策略等。策略 PM 需要同时理解业务逻辑和算法原理。" },
  { id: "q-m-hr3", question: "你之前有过策略相关的产品经验吗？", category: "experience", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "做过两个策略项目：1）搜索推荐的排序策略优化（多目标排序）；2）用户分层运营策略（基于 RFM 模型）。核心学到的是：好的策略一定要有明确的优化目标和可衡量的评估指标。" },
  { id: "q-m-hr4", question: "你如何看待美团和抖音在外卖市场的竞争？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "抖音外卖的优势在流量和内容种草，但美团的护城河在配送网络和商家运营体系。短期看抖音会蚕食一部分增量市场，但核心的即时配送场景美团的壁垒很高。关键是美团如何在内容化方面补课。" },
  { id: "q-m-hr5", question: "说一个你解决复杂问题的思路。", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "三步法：1）问题拆解——把大问题拆成可独立解决的子问题；2）假设验证——对每个子问题提出假设并用数据验证；3）优先排序——按影响力大小排序，集中资源解决 Top 3。举了一个优化搜索转化率的完整案例。" },
  { id: "q-m-hr6", question: "你的抗压能力怎么样？能接受高强度的工作节奏吗？", category: "behavioral", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "我觉得高强度和无效加班是两回事。在紧要的项目节点，我愿意全身心投入。但我也会主动管理精力——保持运动习惯，确保高效工作而非长时间低效。" },
  { id: "q-m-hr7", question: "你希望在美团获得什么样的成长？", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "两个维度：1）策略产品的专业能力——美团的业务复杂度和数据量级是独一无二的训练场；2）商业思维——理解本地生活这个万亿级市场的运作逻辑。" },
  { id: "q-m-hr8", question: "你对薪资有什么期望？", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "基于目前市场水平和我的经验，期望 base 在 35-45K/月。当然我更关注的是岗位的发展空间和能接触到的业务场景。" },
  { id: "q-m-hr9", question: "你目前有其他公司的面试在进行吗？", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "有的，目前在字节跳动和阿里巴巴也有面试在推进中。美团的策略方向是我非常感兴趣的，如果能拿到 offer 我会认真考虑。" },
  { id: "q-m-hr10", question: "你有什么想问我的？", category: "motivation", difficulty: 1, wasAsked: true, answeredWell: true, myAnswer: "问了三个问题：1）这个团队目前做的策略方向具体是什么？2）新人的培养机制是怎样的？3）团队最近面临的最大挑战是什么？HR 的回答让我对团队有了更清晰的认知。" },
];

const meituanProductQuestions = [
  { id: "q-m-p1", question: "如何优化美团外卖的搜索排序策略？", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "多目标排序框架：用户满意度（预估 CTR × CVR × 满意度评分） × 商家健康度（配送时长、好评率） × 平台效率（客单价、配送成本）。需要设计好各目标的权重调优机制和 ABTest 方案。" },
  { id: "q-m-p2", question: "设计一个外卖配送时间预估的产品方案。", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "拆解为三段：出餐时间（基于菜品复杂度和商家历史数据） + 骑手到店时间（基于实时位置和交通状况） + 配送时间（基于距离、天气、交通、楼层）。关键是误差率控制——用户对'晚 5 分钟'比'早 5 分钟'更敏感。" },
  { id: "q-m-p3", question: "如何设计一个动态定价策略？比如外卖的配送费。", category: "case", difficulty: 5, wasAsked: true, answeredWell: true, myAnswer: "需要考虑的因素：距离、天气、时段（高峰 vs 闲时）、运力供需比、订单量预测。设计原则：1）透明可解释（用户能理解为什么这个价格）；2）设定上限（不能无限涨价）；3）会员可享受减免。" },
  { id: "q-m-p4", question: "你如何评估一个策略上线后的效果？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "三层评估：1）直接指标——策略优化目标的达成情况；2）用户指标——满意度、留存有无负面影响；3）生态指标——商家端、骑手端有无副作用。至少观察 2 周以上，排除节假日等干扰因素。" },
  { id: "q-m-p5", question: "如何优化美团的'猜你喜欢'推荐模块？", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "提升推荐质量的关键：1）引入时间序列特征（上班时 vs 周末偏好不同）；2）结合实时上下文（天气、位置、时段）；3）探索与利用的平衡（20% 的位置给新品和长尾商家）。评估指标：CTR、订单转化率、品类多样性。" },
  { id: "q-m-p6", question: "如果商家反馈排名算法不公平，你怎么处理？", category: "case", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "先验证：调取该商家的数据看是否确实有异常。如果是个案，排查是否是数据问题或边界 case。如果是普遍反馈，说明算法有盲点——需要增加商家公平性相关的指标（如新商家流量保护、中小商家曝光下限）。" },
  { id: "q-m-p7", question: "你怎么理解'策略'和'算法'的区别？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "策略是'做什么'和'为什么做'，算法是'怎么做'。比如策略决定了'高峰期优先给新用户展示好商家'，算法负责实现'如何定义好商家'和'如何排序'。策略 PM 提供业务逻辑，算法工程师提供技术实现。" },
  { id: "q-m-p8", question: "设计一个优惠券发放策略。", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "目标明确：是拉新？促活？还是唤醒沉默用户？不同目标对应不同策略。拉新：首单大额券；促活：满减券（提升客单价）；唤醒：限时专属券。核心是 ROI 计算——优惠券带来的增量 GMV 要大于优惠成本。" },
  { id: "q-m-p9", question: "你如何处理策略上线后的 bad case？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "三步：1）快速识别——建立实时监控看板，设置异常报警阈值；2）快速止损——准备好回滚方案和降级策略；3）根因分析——不只是修复 bug，而是理解为什么测试阶段没有发现这个问题，改进测试覆盖。" },
  { id: "q-m-p10", question: "你觉得美团外卖未来的核心竞争力会是什么？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "三个方面：1）供给质量——帮助商家提升品质和效率；2）配送体验——用技术优化履约确定性；3）数据智能——用数据理解用户需求和商家能力的匹配。长期看，谁能让用户'闭着眼点外卖都不踩雷'谁就赢了。" },
];

const meituanStrategyQuestions = [
  { id: "q-m-s1", question: "如何设计一个骑手调度的优化策略？", category: "case", difficulty: 5, wasAsked: true, answeredWell: true, myAnswer: "核心是供需匹配的实时优化。方案：1）需求预测（基于历史数据预测未来 30 分钟的订单量分布）；2）供给调度（引导骑手向热点区域移动）；3）订单分配（考虑骑手位置、手上订单数、商家出餐进度）。目标函数：最小化平均配送时间 × 最大化骑手效率。" },
  { id: "q-m-s2", question: "你怎么看待本地生活行业的 AI 化趋势？", category: "product", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "三个方向：1）供给侧——AI 帮商家做菜单优化、库存管理、运营决策；2）需求侧——AI 理解用户意图（'想吃辣的但不要太贵'→精准推荐）；3）平台侧——调度、定价、风控全面智能化。AI 的核心价值是提升匹配效率。" },
  { id: "q-m-s3", question: "美团外卖和抖音外卖的竞争，你怎么看？", category: "product", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "抖音外卖是'兴趣驱动'（看到好吃的→下单），美团外卖是'需求驱动'（饿了→搜索→下单）。两者服务的是不同的用户决策场景。美团的核心防线是'即时配送'的确定性体验——这需要多年积累的骑手网络和调度系统。" },
  { id: "q-m-s4", question: "如何设计一个商家评分系统？", category: "case", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "维度设计：出餐速度（30%）、菜品质量（30%，基于用户评价）、包装完整性（15%）、售后响应（15%）、投诉率（10%）。需要考虑：新商家的冷启动（给予初始评分和流量保护）、评分的时间衰减（近期表现权重更高）。" },
  { id: "q-m-s5", question: "如果你发现一个策略看起来数据很好但实际用户体验变差了，怎么判断？", category: "product", difficulty: 4, wasAsked: true, answeredWell: true, myAnswer: "典型的'古德哈特定律'——指标被优化了但本质没改善。需要：1）增加用户体验的'护栏指标'（如满意度评分、投诉率）；2）定期做用户访谈验证数据和真实感受的一致性；3）关注长期指标（留存）而非只看短期指标（点击）。" },
  { id: "q-m-s6", question: "设计一个针对雨雪天气的特殊运营策略。", category: "case", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "供给侧：提高骑手端每单收入（恶劣天气补贴）、扩大配送范围限制。需求侧：调整用户预期（显示'天气原因配送可能延迟'）、适当提高配送费。平台侧：启动备用运力、减少大单量商家的推荐权重（避免出餐瓶颈）。" },
  { id: "q-m-s7", question: "你如何看待'即时零售'对美团的机会？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "即时零售（闪购、买药、跑腿）是美团配送网络的自然延伸。机会在于：复用现有的骑手和调度系统，拓展品类（从餐饮到万物）。挑战是每个品类的供应链特性不同，需要针对性的商家赋能。" },
  { id: "q-m-s8", question: "你在做策略产品时，如何和算法工程师高效协作？", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "三个原则：1）用数据和 case 沟通（不说'效果不好'，说'这类 case 的准确率只有 60%'）；2）明确定义评估标准（离线指标和在线指标的对应关系）；3）一起看 bad case，共同分析原因。" },
  { id: "q-m-s9", question: "你如何理解'策略产品的技术壁垒'？", category: "product", difficulty: 4, wasAsked: true, answeredWell: false, myAnswer: "回答了策略的技术壁垒在于数据积累和模型迭代，但在被追问'如何量化技术壁垒'时，缺乏具体的方法论。面试官给出了一个很好的视角：看竞对复制这个策略需要的时间和成本。" },
  { id: "q-m-s10", question: "最后一轮，VP 面试。你准备好了吗？有什么想提前了解的？", category: "motivation", difficulty: 1, wasAsked: true, answeredWell: true, myAnswer: "问了 VP 面试的考察重点和形式。得知 VP 更关注战略思维和大局观，不会深入技术细节。感觉有一定压力，但整体准备充分。" },
];

const meituanVPQuestions = [
  { id: "q-m-v1", question: "你觉得未来 5 年本地生活行业会怎么发展？", category: "product", difficulty: 5, wasAsked: true, answeredWell: false, myAnswer: "回答了几个趋势（即时零售、AI 化、线上线下融合），但被追问具体的市场规模预测时，数据准备不足。VP 很注重有数据支撑的判断，我的回答偏感性了。" },
  { id: "q-m-v2", question: "如果你是美团 CEO，你现在最应该投入资源做什么？", category: "case", difficulty: 5, wasAsked: true, answeredWell: false, myAnswer: "说了要加码 AI 和海外扩张，但没能给出清晰的优先级和资源分配逻辑。VP 指出'什么都要做等于什么都没做'，需要更有取舍感的战略思维。这是我最大的失误。" },
  { id: "q-m-v3", question: "你怎么看美团的组织架构对产品创新的影响？", category: "product", difficulty: 4, wasAsked: true, answeredWell: false, myAnswer: "对美团的组织架构了解不够深入，回答比较表面。应该提前做更多功课，了解美团的事业群划分和内部协作模式。" },
  { id: "q-m-v4", question: "作为一个策略 PM，你觉得最重要的能力是什么？排个序。", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "1）业务理解力（知道在优化什么）；2）数据分析力（能量化问题和效果）；3）算法理解力（知道技术边界）；4）沟通协作力（能让跨团队高效执行）。VP 对这个排序表示认同。" },
  { id: "q-m-v5", question: "你觉得美团做得最好的一个策略产品是什么？为什么？", category: "product", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "美团的配送调度系统。因为它实现了百万级骑手的实时最优分配，平均每单调度时间不到 1 毫秒，同时兼顾了效率（配送时长）和公平（骑手收入均衡）。这是技术和业务深度融合的典范。" },
  { id: "q-m-v6", question: "你对自己的career发展有清晰的规划吗？", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "明确表达了策略产品方向的热情，以及在美团深耕本地生活策略的意愿。VP 对我的方向性表示认可，但也坦诚说面试整体表现还需要提升。" },
  { id: "q-m-v7", question: "说一个你觉得自己做的'足够好'的产品决策。", category: "experience", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "分享了在搜索排序项目中，顶住了运营团队要求'手动置顶商家'的压力，坚持用算法驱动排序。最终数据证明算法排序比人工排序的转化率高 30%。VP 对'坚持原则'这一点给了正面评价。" },
  { id: "q-m-v8", question: "你能接受在这个岗位上做 2 年以上吗？", category: "motivation", difficulty: 2, wasAsked: true, answeredWell: true, myAnswer: "表达了愿意深耕的意愿，同时也坦诚说期望在 2 年内能有明确的成长路径（从策略 PM 到高级策略 PM）。VP 认为这个期望合理。" },
  { id: "q-m-v9", question: "你觉得这次面试过程中，自己哪里做得不够好？", category: "behavioral", difficulty: 3, wasAsked: true, answeredWell: true, myAnswer: "诚实复盘：1）对美团组织架构研究不够；2）战略层面的数据准备不充分；3）在高压问题下容易展示思路而非给出结论。VP 对这个自我觉察给了肯定。" },
  { id: "q-m-v10", question: "最后，你有什么想对我说的？", category: "motivation", difficulty: 1, wasAsked: true, answeredWell: true, myAnswer: "感谢了 VP 的时间和深入的交流。表达了对美团策略方向的热情。同时也诚实地说，虽然这次面试有些回答不够理想，但每一轮面试都让我对自己有了更清楚的认知。" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { count, error: countError } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true });

    if (countError) throw countError;

    if ((count ?? 0) > 0) {
      return new Response(
        JSON.stringify({ seeded: false, reason: "already_has_data" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    const now = new Date();
    const d = (daysAgo: number) =>
      new Date(now.getTime() - daysAgo * 86400000).toISOString();
    const future = (daysAhead: number) =>
      new Date(now.getTime() + daysAhead * 86400000).toISOString();

    // ========== 岗位 1：字节跳动 - AI 产品经理（面试中） ==========
    const byteStages = [
      { id: "demo-b1", name: "已投递", status: "completed", result: "passed", date: d(28) },
      {
        id: "demo-b2", name: "HR 筛选", status: "completed", result: "passed",
        scheduledTime: d(21), interviewer: "张莉，HR 招聘经理", feedbackScore: 4,
        questions: byteHRQuestions,
        reflection: {
          overallFeeling: "good",
          whatWentWell: ["和 HR 建立了不错的 rapport", "对 AI 产品方向的理解得到认可"],
          whatCouldImprove: ["可以更多了解团队日常工作节奏"],
          keyTakeaways: ["字节很看重结构化思维和数据驱动", "AI 方向是公司重点投入的领域"],
        },
      },
      {
        id: "demo-b3", name: "技术理解面", status: "completed", result: "passed",
        scheduledTime: d(14), interviewer: "陈伟，AI 算法高级工程师", feedbackScore: 4,
        questions: byteTechQuestions,
        reflection: {
          overallFeeling: "good",
          whatWentWell: ["对 AI 产品化流程的理解很扎实", "和算法工程师的沟通很顺畅"],
          whatCouldImprove: ["Fine-tuning 的实操经验有待加强", "可以准备更多具体的技术方案案例"],
          keyTakeaways: ["字节的技术面试很务实，不考八股文", "面试官提到团队正在做多模态方向"],
        },
      },
      {
        id: "demo-b4", name: "产品设计面", status: "completed", result: "passed",
        scheduledTime: d(7), interviewer: "王晓芳，产品总监", feedbackScore: 5,
        questions: byteProductQuestions,
        reflection: {
          overallFeeling: "great",
          whatWentWell: ["对豆包产品的分析很到位", "Q3 规划的回答让面试官印象深刻", "产品设计思路清晰，有数据支撑"],
          whatCouldImprove: ["TAM 估算可以更精确"],
          keyTakeaways: ["产品设计面是核心关卡", "王总监很 nice，提前分享了团队规划——这是积极信号"],
        },
      },
      {
        id: "demo-b5", name: "业务终面", status: "scheduled",
        scheduledTime: future(3), interviewer: "李明，业务负责人",
      },
      { id: "demo-b6", name: "Offer 沟通", status: "pending" },
    ];

    const byteJob = {
      user_id: userId, company_name: "字节跳动", role_title: "AI 产品经理",
      location: "CN", status: "interviewing", source: "referral", interest_level: 5,
      career_fit_notes: "梦想岗位——豆包 AI 产品方向。有前同事内推，TC 预估 60-80 万/年。团队 20 人（10 工程师 + 4 算法 + 3 设计 + 3 PM），正在扩招。",
      created_at: d(28), updated_at: d(1),
      stages: {
        list: byteStages,
        _metadata: {
          pipelines: [{ id: "demo-pipe-b1", type: "primary", status: "active", targetRole: "AI 产品经理", stages: byteStages, createdAt: d(28) }],
          subStatus: "interview_scheduled",
          riskTags: ["competing_offer"],
        },
      },
    };

    // ========== 岗位 2：阿里巴巴 - 商业化产品经理（已收到 Offer） ==========
    const aliStages = [
      { id: "demo-a1", name: "已投递", status: "completed", result: "passed", date: d(35) },
      {
        id: "demo-a2", name: "HR 面", status: "completed", result: "passed",
        scheduledTime: d(30), interviewer: "林小燕，HRBP", feedbackScore: 4,
        questions: aliHRQuestions,
        reflection: {
          overallFeeling: "good",
          whatWentWell: ["对商业化方向的理解得到认可"],
          whatCouldImprove: ["可以多准备阿里文化相关的内容"],
          keyTakeaways: ["阿里很看重价值观匹配", "团队在做智能营销方向"],
        },
      },
      {
        id: "demo-a3", name: "产品 Sense 面", status: "completed", result: "passed",
        scheduledTime: d(22), interviewer: "赵强，高级产品经理", feedbackScore: 4,
        questions: aliProductQuestions,
        reflection: {
          overallFeeling: "good",
          whatWentWell: ["商业化案例分析能力强", "对竞品的理解很深"],
          whatCouldImprove: ["可以更深入地讨论阿里系产品的差异化"],
          keyTakeaways: ["阿里的产品 Sense 面试非常实战", "赵强很 senior，提了不少好建议"],
        },
      },
      {
        id: "demo-a4", name: "交叉面", status: "completed", result: "passed",
        scheduledTime: d(15), interviewer: "孙磊，技术专家（P8）", feedbackScore: 4,
        questions: aliCrossQuestions,
        reflection: {
          overallFeeling: "good",
          whatWentWell: ["跨团队协作经验得到认可", "数据分析能力过关"],
          whatCouldImprove: ["SQL 的高级用法可以更熟练"],
          keyTakeaways: ["交叉面主要考察合作能力和技术理解力", "面试官来自搜索团队，视角很不同"],
        },
      },
      {
        id: "demo-a5", name: "HM 终面 + Offer", status: "completed", result: "passed",
        scheduledTime: d(5), interviewer: "刘芳，产品部总监", feedbackScore: 5,
        questions: aliHMQuestions,
        reflection: {
          overallFeeling: "great",
          whatWentWell: ["和总监的交流非常深入", "Offer 已口头沟通，package 有竞争力"],
          whatCouldImprove: [],
          keyTakeaways: ["Base 45K/月，年终 4-6 个月，股票 40 万/4 年", "需要在 2 周内回复", "可以用字节的 offer 作为谈判筹码争取更好的 package"],
        },
      },
    ];

    const aliJob = {
      user_id: userId, company_name: "阿里巴巴", role_title: "商业化产品经理",
      location: "CN", status: "offer", source: "linkedin", interest_level: 4,
      career_fit_notes: "已收到 Offer！团队做智能营销方向，很有发展空间。顾虑：阿里内部竞争激烈，晋升节奏不确定。Offer deadline 两周内。",
      created_at: d(35), updated_at: d(1),
      stages: {
        list: aliStages,
        _metadata: {
          pipelines: [{ id: "demo-pipe-a1", type: "primary", status: "completed", targetRole: "商业化产品经理", stages: aliStages, createdAt: d(35) }],
          subStatus: "offer_received",
        },
      },
    };

    // ========== 岗位 3：美团 - 策略产品经理（终面被拒） ==========
    const meituanStages = [
      { id: "demo-m1", name: "已投递", status: "completed", result: "passed", date: d(42) },
      {
        id: "demo-m2", name: "HR 面", status: "completed", result: "passed",
        scheduledTime: d(38), interviewer: "周雨，招聘主管", feedbackScore: 4,
        questions: meituanHRQuestions,
        reflection: {
          overallFeeling: "good",
          whatWentWell: ["对策略产品方向的理解到位"],
          whatCouldImprove: ["对美团的业务了解可以更深入"],
          keyTakeaways: ["美团的策略方向很有吸引力", "HR 提到团队正在扩招"],
        },
      },
      {
        id: "demo-m3", name: "产品设计面", status: "completed", result: "passed",
        scheduledTime: d(30), interviewer: "黄海，策略产品经理", feedbackScore: 4,
        questions: meituanProductQuestions,
        reflection: {
          overallFeeling: "good",
          whatWentWell: ["搜索排序和动态定价的方案设计很扎实", "有实际的策略项目经验"],
          whatCouldImprove: ["美团特有的业务场景需要更多积累"],
          keyTakeaways: ["美团的产品面试偏实战", "需要对本地生活行业有更深入的理解"],
        },
      },
      {
        id: "demo-m4", name: "策略分析面", status: "completed", result: "passed",
        scheduledTime: d(22), interviewer: "吴磊，高级策略产品经理", feedbackScore: 3,
        questions: meituanStrategyQuestions,
        reflection: {
          overallFeeling: "neutral",
          whatWentWell: ["骑手调度策略的设计得到认可", "对 AI 趋势的判断有深度"],
          whatCouldImprove: ["对技术壁垒的量化方法需要学习", "部分答案的框架性不够强"],
          keyTakeaways: ["策略分析面的深度要求比预期高", "需要更多积累'量化思维'"],
        },
      },
      {
        id: "demo-m5", name: "VP 终面", status: "completed", result: "rejected",
        scheduledTime: d(15), interviewer: "郑总，外卖事业部 VP", feedbackScore: 2,
        questions: meituanVPQuestions,
        reflection: {
          overallFeeling: "poor",
          whatWentWell: ["对美团调度系统的分析得到 VP 认可", "自我觉察和诚实复盘获得好评"],
          whatCouldImprove: ["战略思维不够成熟——回答缺乏取舍感", "对美团组织架构研究不足", "高压下容易展示思路而非给出结论"],
          keyTakeaways: ["VP 面试要的是'判断力'而非'分析能力'", "战略层面需要有数据支撑的观点，不能泛泛而谈", "虽然挂了，但这次面试是成长最大的一次——明确了自己在战略思维方面的短板"],
        },
      },
    ];

    const meituanJob = {
      user_id: userId, company_name: "美团", role_title: "策略产品经理",
      location: "CN", status: "closed", source: "website", interest_level: 4,
      career_fit_notes: "VP 终面被拒。核心原因：战略思维和大局观不够成熟。但收获极大——3 轮面试的 feedback 帮我明确了自己的成长方向。保留面试笔记作为学习资料。",
      created_at: d(42), updated_at: d(13),
      stages: {
        list: meituanStages,
        _metadata: {
          pipelines: [{ id: "demo-pipe-m1", type: "primary", status: "closed", targetRole: "策略产品经理", stages: meituanStages, createdAt: d(42), closedAt: d(13), closedReason: "rejected_after_interview" }],
          closedReason: "rejected_after_interview",
        },
      },
    };

    // Insert jobs
    const { data: insertedJobs, error: jobsError } = await supabase
      .from("jobs")
      .insert([byteJob, aliJob, meituanJob])
      .select("id, company_name");

    if (jobsError) throw jobsError;

    const jobMap: Record<string, string> = {};
    for (const j of insertedJobs || []) {
      jobMap[j.company_name] = j.id;
    }

    const activities = [
      { user_id: userId, job_id: jobMap["美团"], type: "application", message: "投递了美团 — 策略产品经理", created_at: d(42) },
      { user_id: userId, job_id: jobMap["阿里巴巴"], type: "application", message: "投递了阿里巴巴 — 商业化产品经理", created_at: d(35) },
      { user_id: userId, job_id: jobMap["字节跳动"], type: "application", message: "投递了字节跳动 — AI 产品经理", created_at: d(28) },
      { user_id: userId, job_id: jobMap["美团"], type: "stage_update", message: "美团 VP 终面未通过", created_at: d(15) },
      { user_id: userId, job_id: jobMap["字节跳动"], type: "stage_update", message: "字节跳动产品设计面通过 — 进入业务终面", created_at: d(7) },
      { user_id: userId, job_id: jobMap["阿里巴巴"], type: "offer", message: "🎉 收到阿里巴巴 Offer — 商业化产品经理", created_at: d(5) },
      { user_id: userId, job_id: jobMap["字节跳动"], type: "stage_update", message: "字节跳动业务终面已排期", created_at: d(1) },
    ];

    const { error: actError } = await supabase
      .from("recent_activities")
      .insert(activities);

    if (actError) throw actError;

    return new Response(JSON.stringify({ seeded: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("seed-demo-data-cn error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
