# 🔭 GitHub Trending Scout

**Scrape GitHub Trending → AI-analyze repos → generate developer content (tweets, blog posts, newsletters) → auto-publish.**

This is an **OpenClaw Plugin** that runs a full pipeline to help developers, content creators, and community managers stay on top of GitHub trends and automatically generate insightful content.

It can also run as a **standalone CLI tool**, no OpenClaw required.

![Scout CLI Demo](https://i.imgur.com/your-demo-image.gif) <!-- TODO: Add a real demo gif -->

## ✨ Features

- **📈 Scrape GitHub Trending**: Fetches daily, weekly, or monthly trending repositories for any programming language.
- **🧠 AI-Powered Analysis**: Uses an LLM (like GPT-4.1-mini) to:
    - Categorize each repository (e.g., AI/ML, DevTools, Web).
    - Explain *why* it's trending in a single sentence.
    - Identify the target audience.
    - Extract the key takeaway for developers.
    - Identify cross-cutting themes and a "hot take" on the landscape.
- **✍️ Multi-Format Content Generation**: Automatically generates ready-to-publish content in various formats:
    - **Digest**: A scannable Markdown summary with tables and deep dives.
    - **Tweet Thread**: A viral-style X/Twitter thread with emoji and hashtags.
    - **Blog Post**: An 800-word article grouping repos by theme.
    - **Newsletter**: A developer newsletter edition with a spotlight, rising stars, and quick links.
- **🔌 OpenClaw Plugin**: Exposes a `github_trending_scout` tool that can be called by AI agents or run on a schedule (`cron`).
- **💻 Standalone CLI**: Run the entire pipeline from your terminal with `npx trending-scout`.

## 🚀 Quick Start (Standalone CLI)

No installation needed. Just make sure you have Node.js v18+ and an OpenAI API key.

```bash
# Make sure your OpenAI API key is set
export OPENAI_API_KEY="sk-..."

# Run the scout and generate a digest and tweet thread
npx trending-scout --formats digest,tweet_thread

# See all options
npx trending-scout --help
```

Outputs will be saved to `./scout_output/`.

## 🔌 OpenClaw Plugin Usage

1.  **Install the Plugin**: (Once published to npm)
    ```bash
    openclaw plugins install openclaw-github-trending-scout
    ```

2.  **Enable the Tool**: In your `openclaw.json` or agent-specific config, add `github_trending_scout` to the tool allowlist:
    ```json
    {
      "tools": {
        "allow": ["github_trending_scout"]
      }
    }
    ```

3.  **Invoke from Chat**: Call the tool from your agent's chat interface.
    ```
    /github_trending_scout language=typescript formats=blog_post,tweet_thread
    ```

4.  **Automate with Cron**: Run the scout every morning at 9 AM.
    ```json
    {
      "cron": {
        "jobs": [
          {
            "name": "Daily GitHub Trending Report",
            "cron": "0 0 9 * * *",
            "prompt": "/github_trending_scout formats=digest,tweet_thread"
          }
        ]
      }
    }
    ```

## 🛠️ How It Works

The pipeline is orchestrated in three main phases:

1.  **Scraper Agent**: A lightweight, dependency-free HTML parser scrapes `github.com/trending`. It's robust against minor markup changes.
2.  **Analyzer Agent**: This agent builds a compact context from the scraped data and fetched READMEs, then uses an LLM to extract structured insights (categories, themes, etc.).
3.  **Content Generator Agent**: For each requested format, this agent uses a specialized prompt to transform the structured analysis into polished, publishable content.

This multi-agent approach ensures each step is modular, testable, and optimized for its specific task, resulting in higher quality output than a single monolithic prompt.

## 🔧 Development

```bash
# Clone the repo
git clone https://github.com/your-username/github-trending-scout.git
cd github-trending-scout

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Run the CLI directly
node dist/cli.js --help
```

## License

MIT
