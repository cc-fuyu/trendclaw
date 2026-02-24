# 🔭 GitHub Trending Scout (中文版)

[English](./README.md) | [中文](./README_CN.md)

**抓取 GitHub Trending → 丰富化深度元数据 → AI 分析趋势与历史 → 生成开发者内容（推文、博客、周报）→ 自动发布。**

这是一个 **OpenClaw 插件**和**独立的 CLI 工具**，运行一个完整的数据和内容生产线。它帮助开发者、内容创作者和社区经理保持对 GitHub 趋势的关注，并自动生成富有洞察力、可直接发布的内容。

![Scout CLI Demo](https://i.imgur.com/your-demo-image.gif) <!-- TODO: 添加一个真实的演示动图 -->

## ✨ 核心功能

- **📈 多源数据管道**：
    - **趋势抓取器**：使用无依赖的 HTML 解析器，抓取 GitHub Trending 的日、周、月度热门仓库（支持任意编程语言）。
    - **深度元数据丰富**：从 GitHub API 获取丰富数据（如 issues、主题、提交活跃度、创建日期），为分析增加深度。
    - **历史差异对比**：将今日趋势与昨日快照进行比较，识别新上榜、落榜、排名上升和下降的仓库。

- **🧠 AI 驱动的分析**：使用可配置的 LLM 后端进行分析：
    - **分类**：为每个仓库分类（如 AI/ML、DevTools、Web）。
    - **解释**：用一句话解释它*为什么*会成为热门。
    - **识别目标受众**和**核心看点**。
    - **计算速度信号**（🚀, 📈, ➡️, 📉）：基于 star 增长和提交活跃度。
    - **识别跨领域主题**和对技术格局的**“热辣点评”**。

- **✍️ 多格式内容生成**：自动生成多种格式的内容：
    - **摘要（Digest）**：易于浏览的 Markdown 摘要，包含表格和深度解读。
    - **推文串（Tweet Thread）**：病毒式传播风格的 X/Twitter 推文串，带 emoji 和标签。
    - **博客文章（Blog Post）**：一篇 800 字的文章，按主题对仓库进行分组。
    - **周报（Newsletter）**：一份开发者周报，包含焦点项目和新星推荐。

- **🔌 灵活与可扩展**：
    - **多 LLM 后端**：开箱即用支持 **OpenAI**、**Ollama**（用于本地模型）和 **OpenClaw Gateway**。
    - **OpenClaw 插件**：为 AI Agent 提供一个 `github_trending_scout` 工具。
    - **独立 CLI**：通过 `npx trending-scout` 从终端运行整个管道。

## 🚀 快速开始 (独立 CLI)

无需安装。仅需 Node.js v18+ 环境。

1.  **设置 API 密钥 (使用 OpenAI 后端时)**：
    ```bash
    export OPENAI_API_KEY="sk-..."
    ```

2.  **运行 Scout**：
    ```bash
    # 使用默认的 OpenAI 后端运行
    npx trending-scout --formats digest,tweet_thread --output-lang Chinese

    # 使用本地的 Ollama 模型运行 (例如 Llama 3)
    npx trending-scout --backend ollama --model llama3
    ```

3.  **查看输出**：结果保存在 `./scout_output/` 目录中。

    ```bash
    # 查看所有选项
    npx trending-scout --help
    ```

## 📖 输出示例

这是 Scout 在 2026 年 2 月 24 日生成的真实摘要：

<details>
<summary>点击查看完整摘要</summary>

```markdown
# GitHub趋势速览 2026-02-24

今日GitHub趋势显示，AI代理技能与上下文工程项目持续爆发，推动智能助手与多模态AI工具快速演进。金融数据分析与代码智能图谱项目保持活跃，底层基础设施可视化工具同样受到关注，体现开发者多元技术栈在AI赋能下的深度探索。

| 排名 | 仓库                                  | 类别       | 今日新增⭐ | 趋势       | 关键洞察                                   |
|------|-------------------------------------|------------|-----------|------------|-------------------------------------------|
| #1   | x1xhlol/system-prompts-and-models-of-ai-tools | AI/ML      | +2,454    | 🚀         | 大量开源系统提示和模型，促进AI工具集成与定制       |
| #2   | huggingface/skills                   | AI/ML      | +1,451    | 📈         | 统一代理技能格式，推动跨平台AI任务互操作           |
| #3   | OpenBB-finance/OpenBB               | 数据       | +470      | ➡️       | AI赋能金融数据分析和量化交易，提升决策能力         |
| #4   | muratcankoylan/Agent-Skills-for-Context-Engineering | AI/ML      | +178      | 📈         | 聚焦上下文工程，优化多代理系统性能                   |
| #5   | f/prompts.chat                     | AI/ML      | +295      | ➡️       | 最大开源提示库，提升大语言模型应用效果             |
| #6   | CompVis/stable-diffusion           | AI/ML      | +36       | ➡️       | 领先文本到图像扩散模型，推动生成视觉AI创新          |
| #7   | abhigyanpatwari/GitNexus           | 开发工具   | +467      | 🚀         | 浏览器端构建代码知识图谱，结合智能代理提升代码探索效率 |
| #8   | Stremio/stremio-web                | 其他       | +272      | ➡️       | 多源视频内容整合平台，用户基础稳定                   |
| #9   | stan-smith/FossFLOW                | 基础设施   | +430      | 📈         | 美观等距基础设施图绘制工具，助力架构表达与沟通       |
| #10  | VectifyAI/PageIndex                | AI/ML      | +624      | 📈         | 无向量数据库推理型RAG方案，创新文档检索与推理       |

---

## Top 3深度解析

**1. x1xhlol/system-prompts-and-models-of-ai-tools**  
该项目汇聚了数十个开源AI系统提示和模型，满足开发者快速集成和个性化定制不同AI工具的需求。系统提示共享成为推动AI应用迭代的关键资源，助力加速大语言模型的多样化应用场景落地。

**2. huggingface/skills**  
Hugging Face发布的标准化AI代理技能，促进不同平台和模型间的无缝协作。统一格式不仅降低了跨系统集成难度，也为自动化开发和多模态AI任务提供了强大支持，推动AI生态系统的协同发展。

**3. abhigyanpatwari/GitNexus**  
GitNexus以客户端零服务器架构生成代码知识图谱，内置图形RAG智能代理，极大提升代码理解和浏览效率。此创新结合智能代理的知识图谱工具，预示着AI辅助编程正在迈入更智能、交互更友好的新阶段。

---

## 今日主题

- **AI代理与上下文工程**：以x1xhlol和muratcankoylan项目为代表，系统提示和上下文管理成为构建复杂AI代理的核心技术。
- **开源提示工程与技能库**：prompts.chat和huggingface/skills引领提示模板和技能标准化浪潮，助力模型效果提升与跨平台协作。
- **代码智能与知识图谱**：GitNexus展示浏览器端知识图谱与智能代理结合的未来方向，代码探索效率显著提升。
- **金融数据与量化分析**：OpenBB结合AI技术，推动开源量化工具生态发展。
- **基础设施可视化与多媒体平台**：FossFLOW等工具加强架构表达，Stremio保持多媒体内容整合的用户活跃度。

---

保持关注，明日带来更多开发者必读趋势！
```

</details>

## 🔌 OpenClaw 插件用法

1.  **安装插件**: (发布到 npm 后)
    ```bash
    openclaw plugins install openclaw-github-trending-scout
    ```

2.  **配置后端**: 在你的 `openclaw.json` 中，配置要使用的 LLM。
    ```json
    {
      "plugins": {
        "trending-scout": {
          "llm": {
            "backend": "openclaw", // 使用原生的 OpenClaw Gateway
            "model": "default"
          },
          "enableDeepMeta": true,
          "enableDiff": true
        }
      }
    }
    ```

3.  **从聊天中调用**: 从你的 Agent 聊天界面调用工具。
    ```
    /github_trending_scout language=typescript formats=blog_post,tweet_thread
    ```

## 🛠️ 工作原理

该管道通过四个主要阶段进行编排：

1.  **抓取器 Agent**：一个轻量级、无依赖的 HTML 解析器，用于抓取 `github.com/trending`。
2.  **丰富器 Agent**：从 GitHub API 获取深度元数据，并与前一天的快照计算差异。
3.  **分析器 Agent**：从所有数据源构建丰富的上下文，并使用 LLM 提取结构化洞察。
4.  **内容生成器 Agent**：针对每种请求的格式，使用专门的提示将结构化分析转化为精美的、可发布的内容。

## 🔧 开发

```bash
# 克隆仓库
git clone https://github.com/your-username/github-trending-scout.git
cd github-trending-scout

# 安装依赖
npm install

# 构建 TypeScript 代码
npm run build

# 直接运行 CLI
node dist/cli.js --help
```

## 许可证

MIT
