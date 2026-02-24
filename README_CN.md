# 🔭 GitHub Trending Scout (中文版)

[English](./README.md) | [中文](./README_CN.md)

**抓取 GitHub Trending → 丰富化深度元数据 → AI 分析趋势与历史 → 生成开发者内容（推文、博客、周报）→ 自动发布。**

这是一个 **OpenClaw 插件**和**独立的 CLI 工具**，运行一个完整的数据和内容生产线。它帮助开发者、内容创作者和社区经理保持对 GitHub 趋势的关注，并自动生成富有洞察力、可直接发布的内容。

![Scout CLI Demo](https://i.imgur.com/your-demo-image.gif) <!-- TODO: 添加一个真实的演示动图 -->

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

## 📖 真实 Demo 输出 (2026年2月24日)

这是通过运行 `npx trending-scout --top 10 --formats digest,tweet_thread,newsletter --output-lang Chinese` 生成的真实、未经编辑的输出。

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

<details>
<summary><strong>📰 周报 (Newsletter)</strong> &mdash; 一份为您的订阅者准备的深度解读版周报。</summary>

---

# 开发者快报 2026-02-24

## 聚焦AI代理与上下文工程，代码智能与金融量化持续发力

---

### TL;DR

- 🚀 AI代理技能库与系统提示集成项目爆发，x1xhlol/system-prompts-and-models-of-ai-tools引领潮流
- 📈 Hugging Face标准化技能、上下文工程和无向量RAG等技术推动AI生态从单模型走向复杂系统
- 🧩 金融量化（OpenBB）、代码知识图谱（GitNexus）和基础设施可视化（FossFLOW）多领域持续活跃

---

### Spotlight：x1xhlol/system-prompts-and-models-of-ai-tools

本周GitHub榜首毫无悬念被这个集成了大量开源AI系统提示和模型的项目占据。它不仅汇聚了Claude Code、Cursor、Replit等前沿AI代理工具的系统提示，还囊括了多样化的内部工具和模型，极大地满足了开发者在智能助手和多模态AI工具上的集成与定制需求。

这体现了AI应用快速迭代的关键：**系统提示与模型共享成为驱动创新的核心资源**。项目活跃度极高，社区贡献频繁，已成为AI开发者、研究人员和工具集成者必备的宝库。

项目链接：[https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools)

---

### Rising Stars

- **huggingface/skills**: Hugging Face推出的标准化AI技能定义，推动多平台AI代理任务的互操作性与复用，符合AI生态整合大趋势。
  [项目地址](https://github.com/huggingface/skills)

- **abhigyanpatwari/GitNexus**: 浏览器端零服务器代码智能引擎，结合知识图谱与图形RAG代理，革新代码探索体验，展现AI与开发工具深度融合未来。
  [项目地址](https://github.com/abhigyanpatwari/GitNexus)

- **OpenBB-finance/OpenBB**: 集成AI的开源金融数据与量化分析平台，助力金融分析师和量化交易者提升决策能力。
  [项目地址](https://github.com/OpenBB-finance/OpenBB)

- **VectifyAI/PageIndex**: 创新无向量推理型RAG方案，助力文档索引和上下文管理，是知识管理和AI推理领域的新锐力量。
  [项目地址](https://github.com/VectifyAI/PageIndex)

---

### Hot Take

本期趋势突显AI生态的次时代变革：从单一模型应用迅速转向**以代理技能和上下文工程为核心的复杂系统构建**。x1xhlol/system-prompts-and-models-of-ai-tools与huggingface/skills展现了AI代理技能库标准化和复用的广阔前景，凸显开发者对智能助手高效协作和多技能集成的诉求。

同时，GitNexus的客户端代码知识图谱和PageIndex的无向量RAG方案，表明AI正深度融入开发工具链和知识管理，推动智能辅助编程和高效上下文管理进入新阶段。金融领域的OpenBB结合AI技术，展示了数据驱动决策与量化交易的强劲动力。

整体来看，开发者正快速拥抱以**上下文为核心、技能为载体、知识图谱为助推的智能系统**，这一趋势将重塑从工具构建到产品交付的整个技术栈。

---

### Quick Links

- muratcankoylan/Agent-Skills-for-Context-Engineering — 多代理上下文工程技能集
- f/prompts.chat — 最大开源ChatGPT提示库，支持自托管
- CompVis/stable-diffusion — 经典文本生成图像扩散模型
- Stremio/stremio-web — 多源视频内容整合媒体中心
- stan-smith/FossFLOW — 美观的等距基础设施图绘制工具

---

感谢关注本期开发者快报，持续跟进GitHub趋势，发现下一个技术风口！🚀

下期见~ 👋

</details>

## ✨ 核心功能

- **📈 多源数据管道**：抓取趋势数据，通过 GitHub API 丰富深度元数据，并与历史快照进行对比。
- **🧠 AI 驱动的分析**：使用可配置的 LLM 后端（OpenAI、Ollama、OpenClaw）识别分类、速度信号和关键主题。
- **✍️ 多格式内容生成**：自动生成摘要、推文串、博客文章和周报。
- **🔌 灵活与可扩展**：可作为独立的 CLI 工具或 OpenClaw 插件使用。

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
