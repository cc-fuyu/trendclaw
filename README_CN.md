# 🔭 TrendClaw (中文版)

[English](./README.md) | [中文](./README_CN.md)

**一个深度集成了 OpenClaw 的数据与内容生产线：抓取 GitHub Trending → 丰富化深度元数据 → AI 分析趋势与历史 → 生成开发者内容（推文、博客、周报）→ 自动发布。**

这是一个 **OpenClaw 插件**和**独立的 CLI 工具**，它展示了如何构建一个与 OpenClaw 生态系统深度集成的生产级 AI 代理。它不仅仅是一个带配置文件的 CLI 工具，更是一个**原生的 OpenClaw 公民**。

![Scout CLI Demo](https://i.imgur.com/your-demo-image.gif) <!-- TODO: 添加一个真实的演示动图 -->

## ✨ OpenClaw 的差异化：深度集成

这个项目不仅仅是与 OpenClaw *兼容*，更是*为* OpenClaw *而生*。它利用了 6 个核心生态系统特性，成为了一个真正的 AI 原生自动化引擎。

| 特性 | 我们如何使用 | 价值主张 |
| :--- | :--- | :--- |
| **1. Lobster 工作流** | 整个 pipeline 在 `trendclaw.lobster` 中定义，这是一个带有人工审批门的确定性、多步骤工作流。 | **可靠与可恢复**：保证执行顺序，能在失败后恢复，并允许人工介入发布环节。 |
| **2. Cron 作业** | 一键式设置脚本 (`scripts/setup-cron.sh`) 在 OpenClaw 的原生调度器中注册一个每日作业。 | **自动化与轻松**：一次设置，永久有效。每天将趋势报告推送到你的聊天应用。 |
| **3. MCP 服务器** | 作为一个原生 MCP 服务器运行 (`dist/mcp-server.js`)，将 `trendclaw_scout` 工具暴露给任何代理。 | **互操作与可组合**：任何兼容 MCP 的代理（OpenClaw、Claude Desktop 等）都可以将其作为构建块。 |
| **4. Heartbeat 心跳** | 提供一个 `HEARTBEAT.md` 模板，将趋势检查集成到代理的常规感知周期中。 | **情境感知与主动**：代理可以根据对话或空闲状态决定*何时*运行 scout。 |
| **5. Announce 频道** | Cron 作业使用 `--announce` 和 `--channel` 将生成的内容直接推送到 WhatsApp、Telegram、Discord 等。 | **直接交付**：无需检查文件，报告直接送到你手中。 |
| **6. Skill 与插件** | 打包为在 ClawHub 上可发现的 Skill 和可安装的 npm 包。 | **轻松分发**：只需 `openclaw plugins install trendclaw` 即可。 |

## 🚀 快速开始 (独立 CLI)

为了快速测试，你可以将其作为标准的 Node.js CLI 工具运行。

1.  **设置 API 密钥 (如果使用 OpenAI)**：
    ```bash
    export OPENAI_API_KEY="sk-..."
    ```

2.  **运行 Scout**：
    ```bash
    # 使用默认的 OpenAI 后端运行
    npx trendclaw --formats digest,tweet_thread --output-lang Chinese

    # 使用本地的 Ollama 模型运行 (例如 Llama 3)
    npx trendclaw --backend ollama --model llama3
    ```

3.  **查看输出**：结果保存在 `./scout_output/` 目录中。

## 📖 真实 Demo 输出 (2026年2月24日)

这是通过运行 `npx trendclaw --top 10 --formats digest,tweet_thread,newsletter --output-lang Chinese` 生成的真实、未经编辑的输出。

<details>
<summary><strong>📄 摘要 (Digest)</strong> &mdash; 一份易于浏览的 Markdown 摘要。</summary>

---

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

### Top 3深度解析

**1. x1xhlol/system-prompts-and-models-of-ai-tools**  
该项目汇聚了数十个开源AI系统提示和模型，满足开发者快速集成和个性化定制不同AI工具的需求。系统提示共享成为推动AI应用迭代的关键资源，助力加速大语言模型的多样化应用场景落地。

**2. huggingface/skills**  
Hugging Face发布的标准化AI代理技能，促进不同平台和模型间的无缝协作。统一格式不仅降低了跨系统集成难度，也为自动化开发和多模态AI任务提供了强大支持，推动AI生态系统的协同发展。

**3. abhigyanpatwari/GitNexus**  
GitNexus以客户端零服务器架构生成代码知识图谱，内置图形RAG智能代理，极大提升代码理解和浏览效率。此创新结合智能代理的知识图谱工具，预示着AI辅助编程正在迈入更智能、交互更友好的新阶段。

---

### 今日主题

- **AI代理与上下文工程**：以x1xhlol和muratcankoylan项目为代表，系统提示和上下文管理成为构建复杂AI代理的核心技术。
- **开源提示工程与技能库**：prompts.chat和huggingface/skills引领提示模板和技能标准化浪潮，助力模型效果提升与跨平台协作。
- **代码智能与知识图谱**：GitNexus展示浏览器端知识图谱与智能代理结合的未来方向，代码探索效率显著提升。
- **金融数据与量化分析**：OpenBB结合AI技术，推动开源量化工具生态发展。
- **基础设施可视化与多媒体平台**：FossFLOW等工具加强架构表达，Stremio保持多媒体内容整合的用户活跃度。

---

保持关注，明日带来更多开发者必读趋势！

</details>

<details>
<summary><strong>🐦 推文串 (Tweet Thread)</strong> &mdash; 一条病毒式传播风格的 X/Twitter 推文串。</summary>

---

1/ 每日GitHub趋势速报来啦！🚀 今天我们看到AI代理技能和上下文工程项目火爆，金融量化和代码智能图谱也在发力。一起盘点今天最热的10个开源项目，捕捉技术新风向！#GitHubTrending #开源

2/ 🚀 x1xhlol/system-prompts-and-models-of-ai-tools集合了数十种开源AI系统提示和模型，助你快速集成各种智能助手。系统提示成了AI应用迭代的秘密武器！🔧 https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools #AI代理

3/ 📈 huggingface/skills带来标准化代理技能定义，推动AI任务跨平台协作。想让你的AI助手更懂你？这项目必看！🤖 https://github.com/huggingface/skills #提示工程

4/ ➡️ OpenBB-finance/OpenBB是金融数据分析和量化交易利器，结合AI大幅提升洞察力。金融科技和开源AI的完美碰撞，数据控不可错过！📊 https://github.com/OpenBB-finance/OpenBB #量化交易

5/ 📈 muratcankoylan/Agent-Skills-for-Context-Engineering专注上下文工程，帮开发者打造智能代理的“大脑”，提升多代理系统表现，AI复杂系统构建必备！🧠 https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering #上下文工程

6/ ➡️ f/prompts.chat是最大开源AI提示库，社区共享高质量Prompt，助你用好大语言模型，效果立竿见影！🔥 https://github.com/f/prompts.chat #提示工程

7/ 🚀 abhigyanpatwari/GitNexus用浏览器端构建代码知识图谱，结合智能代理，极大提升代码探索效率。未来代码智能化，这项目值得关注！🧩 https://github.com/abhigyanpatwari/GitNexus #代码智能

8/ 📈 stan-smith/FossFLOW提供美观的等距基础设施图绘制工具，帮DevOps和架构师更直观沟通，视觉化技术文档越来越重要啦！🌉 https://github.com/stan-smith/FossFLOW #基础设施可视化

9/ 📈 VectifyAI/PageIndex创新无向量检索增强生成（RAG）方案，开拓上下文管理和推理新思路，AI文档检索黑科技！📑 https://github.com/VectifyAI/PageIndex #AI研发

10/ 总结：今天趋势显示AI代理、上下文与提示工程爆发，金融数据和代码智能持续活跃。想跟紧AI生态最新动态，别忘了关注我，每天带你扫遍GitHub新星！✨ #开源 #每日趋势

</details>

## 🔧 开发

```bash
# 克隆仓库
git clone https://github.com/your-username/trendclaw.git
cd trendclaw

# 安装依赖
npm install

# 构建 TypeScript
npm run build

# 直接运行 CLI
node dist/cli.js --help
```

## 许可证

MIT
