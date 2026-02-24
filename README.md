# 🔭 TrendClaw

[English](./README.md) | [中文](./README_CN.md)

**A deep OpenClaw integration that runs a full data & content pipeline: Scrape GitHub Trending → Enrich with deep metadata → AI-analyze trends & history → Generate developer content (tweets, blogs, newsletters) → Auto-publish.**

This is an **OpenClaw Plugin** and **standalone CLI tool** that showcases how to build a production-grade AI agent deeply integrated with the OpenClaw ecosystem. It's not just a CLI tool with a config file; it's a **native OpenClaw citizen**.

![Scout CLI Demo](https://i.imgur.com/your-demo-image.gif) <!-- TODO: Add a real demo GIF -->

## ✨ The OpenClaw Difference: Deep Integration

This project isn't just *compatible* with OpenClaw; it's *built for* OpenClaw. It leverages 6 core ecosystem features to become a true AI-native automation engine.

| Feature | How We Use It | Value Proposition |
| :--- | :--- | :--- |
| **1. Lobster Workflow** | The entire pipeline is defined in `trendclaw.lobster`, a deterministic, multi-step workflow with approval gates. | **Reliable & Resumable**: Guarantees execution order, survives failures, and allows human-in-the-loop for publishing. |
| **2. Cron Jobs** | A one-command setup script (`scripts/setup-cron.sh`) registers a daily job with OpenClaw's native scheduler. | **Automated & Effortless**: Set it and forget it. Get daily trending reports delivered to your chat app. |
| **3. MCP Server** | Runs as a native MCP server (`dist/mcp-server.js`), exposing `trendclaw_scout` as a tool to any agent. | **Interoperable & Composable**: Any MCP-compatible agent (OpenClaw, Claude Desktop) can use this as a building block. |
| **4. Heartbeat** | Provides a `HEARTBEAT.md` template to integrate trending checks into the agent's regular awareness cycle. | **Context-Aware & Proactive**: The agent can decide *when* to run a scout based on conversation or idleness. |
| **5. Announce Channel** | Cron jobs use `--announce` and `--channel` to push generated content directly to WhatsApp, Telegram, Discord, etc. | **Direct Delivery**: No need to check a file; the report comes to you. |
| **6. Skill & Plugin** | Packaged as a discoverable Skill on ClawHub and an installable npm package. | **Easy Distribution**: `openclaw plugins install trendclaw` is all it takes. |

## 🚀 Quick Start (Standalone CLI)

For quick tests, you can run it as a standard Node.js CLI tool.

1.  **Set API Key (if using OpenAI)**:
    ```bash
    export OPENAI_API_KEY="sk-..."
    ```

2.  **Run Scout**:
    ```bash
    # Run with default OpenAI backend
    npx trendclaw --formats digest,tweet_thread

    # Run with local Ollama model (e.g., Llama 3)
    npx trendclaw --backend ollama --model llama3
    ```

3.  **Check Output**: Results are saved in `./scout_output/`.

## 📖 Real Demo Output (Feb 24, 2026)

This is the real, unedited output from running `npx trendclaw --top 10 --formats digest,tweet_thread,newsletter`.

<details>
<summary><strong>📄 Digest</strong> &mdash; A scannable Markdown summary.</summary>

---

# GitHub Trending Digest: 2026-02-24

Today's GitHub trends are dominated by the explosion of AI agent skills and context engineering, driving rapid evolution in intelligent assistants and multimodal AI tools. Financial data analysis and code intelligence graphs remain highly active, while underlying infrastructure visualization tools also gain traction, reflecting a diverse developer focus on deep exploration powered by AI.

| Rank | Repository | Category | Stars Today | Trend | Key Insight |
| :--- | :--- | :--- | :--- | :--- | :--- |
| #1 | x1xhlol/system-prompts-and-models-of-ai-tools | AI/ML | +2,454 | 🚀 | Massive collection of open-source system prompts and models, accelerating AI tool integration and customization. |
| #2 | huggingface/skills | AI/ML | +1,451 | 📈 | A unified format for agent skills, driving interoperability for AI tasks across platforms. |
| #3 | OpenBB-finance/OpenBB | Data | +470 | ➡️ | AI-powered financial data analysis and quantitative trading, enhancing decision-making capabilities. |
| #4 | muratcankoylan/Agent-Skills-for-Context-Engineering | AI/ML | +178 | 📈 | Focuses on context engineering to optimize performance in multi-agent systems. |
| #5 | f/prompts.chat | AI/ML | +295 | ➡️ | The largest open-source prompt library, improving the effectiveness of large language model applications. |
| #6 | CompVis/stable-diffusion | AI/ML | +36 | ➡️ | A leading text-to-image diffusion model, driving innovation in generative visual AI. |
| #7 | abhigyanpatwari/GitNexus | DevTools | +467 | 🚀 | Browser-based code knowledge graph with an intelligent agent, boosting code exploration efficiency. |
| #8 | Stremio/stremio-web | Other | +272 | ➡️ | A multi-source video content aggregation platform with a stable user base. |
| #9 | stan-smith/FossFLOW | Infra | +430 | 📈 | An aesthetic isometric infrastructure diagramming tool, improving architecture communication. |
| #10 | VectifyAI/PageIndex | AI/ML | +624 | 📈 | A vector-database-free, inference-based RAG solution, innovating document retrieval and reasoning. |

---

### Top 3 Deep Dive

**1. x1xhlol/system-prompts-and-models-of-ai-tools**
This project aggregates dozens of open-source AI system prompts and models, meeting developer needs for rapid integration and customization of various AI tools. The sharing of system prompts has become a key resource driving the iteration of AI applications, helping to accelerate the landing of diverse application scenarios for large language models.

**2. huggingface/skills**
A standardized AI agent skill from Hugging Face that promotes seamless collaboration between different platforms and models. The unified format not only reduces the difficulty of cross-system integration but also provides strong support for automated development and multimodal AI tasks, promoting the collaborative development of the AI ecosystem.

**3. abhigyanpatwari/GitNexus**
GitNexus generates a code knowledge graph with a client-side, zero-server architecture, featuring a built-in graph RAG intelligent agent that greatly enhances code understanding and browsing efficiency. This innovative knowledge graph tool, combined with an intelligent agent, signals that AI-assisted programming is entering a new, more intelligent and user-friendly phase.

---

### Today's Themes

- **AI Agents & Context Engineering**: Represented by projects from x1xhlol and muratcankoylan, system prompts and context management have become core technologies for building complex AI agents.
- **Open-Source Prompt Engineering & Skill Libraries**: prompts.chat and huggingface/skills are leading the wave of standardizing prompt templates and skills, helping to improve model performance and cross-platform collaboration.
- **Code Intelligence & Knowledge Graphs**: GitNexus demonstrates the future direction of combining browser-side knowledge graphs with intelligent agents, significantly improving code exploration efficiency.
- **Financial Data & Quantitative Analysis**: OpenBB, combined with AI technology, is driving the development of the open-source quantitative tools ecosystem.
- **Infrastructure Visualization & Multimedia Platforms**: Tools like FossFLOW enhance architectural expression, while Stremio maintains user activity in multimedia content aggregation.

---

Stay tuned for more must-read developer trends tomorrow!

</details>

<details>
<summary><strong>🐦 Tweet Thread</strong> &mdash; A viral-style X/Twitter thread.</summary>

---

1/ Daily GitHub Trending report is here! 🚀 Today we're seeing an explosion in AI agent skills & context engineering projects, with financial quant & code intelligence graphs also making waves. Let's break down the top 10 hottest open-source projects today! #GitHubTrending #OpenSource

2/ 🚀 x1xhlol/system-prompts-and-models-of-ai-tools collects dozens of open-source AI system prompts & models, helping you quickly integrate various intelligent assistants. System prompts are the secret weapon for AI app iteration! 🔧 https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools #AIAgents

3/ 📈 huggingface/skills introduces a standardized agent skill definition, promoting cross-platform collaboration for AI tasks. Want your AI assistant to understand you better? This project is a must-see! 🤖 https://github.com/huggingface/skills #PromptEngineering

4/ ➡️ OpenBB-finance/OpenBB is a powerhouse for financial data analysis & quantitative trading, leveraging AI to significantly boost insights. The perfect collision of fintech & open-source AI, a must for data enthusiasts! 📊 https://github.com/OpenBB-finance/OpenBB #QuantTrading

5/ 📈 muratcankoylan/Agent-Skills-for-Context-Engineering focuses on context engineering, helping devs build the "brain" for intelligent agents to improve multi-agent system performance. Essential for complex AI system building! 🧠 https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering #ContextEngineering

6/ ➡️ f/prompts.chat is the largest open-source AI prompt library, with community-shared high-quality prompts to help you get the most out of large language models. Instant results! 🔥 https://github.com/f/prompts.chat #PromptEngineering

7/ 🚀 abhigyanpatwari/GitNexus builds a code knowledge graph in the browser, combined with an intelligent agent, to dramatically improve code exploration efficiency. The future of code intelligence is here! 🧩 https://github.com/abhigyanpatwari/GitNexus #CodeIntelligence

8/ 📈 stan-smith/FossFLOW provides a beautiful isometric infrastructure diagramming tool, helping DevOps & architects communicate more visually. Visual technical documentation is becoming increasingly important! 🌉 https://github.com/stan-smith/FossFLOW #InfrastructureAsCode

9/ 📈 VectifyAI/PageIndex offers an innovative vector-free Retrieval-Augmented Generation (RAG) solution, opening up new ideas for context management & reasoning. Black magic for AI document retrieval! 📑 https://github.com/VectifyAI/PageIndex #AIResearch

10/ Summary: Today's trends show an explosion in AI agents, context & prompt engineering, with financial data & code intelligence remaining active. To keep up with the latest in the AI ecosystem, don't forget to follow me for daily GitHub scans! ✨ #OpenSource #DailyTrends

</details>

## 🔧 Development

```bash
# Clone the repo
git clone https://github.com/your-username/trendclaw.git
cd trendclaw

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run the CLI directly
node dist/cli.js --help
```

## License

MIT
