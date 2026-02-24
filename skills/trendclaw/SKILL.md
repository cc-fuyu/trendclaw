# TrendClaw

Scrape GitHub Trending, enrich with deep metadata, AI-analyze trends with history comparison, and generate multi-format developer content (digest, tweet thread, blog post, newsletter).

## Activation

When the user asks about GitHub trending, open-source trends, what's hot on GitHub, or wants developer content about trending repos, activate this skill.

Trigger phrases: "what's trending on GitHub", "GitHub trending", "trending repos", "developer digest", "tech newsletter", "what's new in open source"

## Integration Modes

This skill supports multiple OpenClaw integration modes:

### Mode 1: MCP Server (Recommended)
The scout runs as an MCP server. Configure in your openclaw config:
```json
{
  "mcpServers": {
    "trendclaw": {
      "command": "node",
      "args": ["./node_modules/trendclaw/dist/mcp-server.js"]
    }
  }
}
```

### Mode 2: Plugin Tool
If installed as a plugin, use the `trendclaw_scout` tool directly:
```
/trendclaw_scout language=typescript formats=digest,tweet_thread
```

### Mode 3: Lobster Workflow
For deterministic multi-step execution with approval gates:
```
/lobster workflows/trendclaw.lobster period=daily formats=digest,newsletter
```

### Mode 4: Cron Automation
Set up daily automated reports:
```bash
openclaw cron add --name "TrendClaw" --cron "0 9 * * *" --session isolated --announce \
  --message "Run trendclaw_scout with formats digest,tweet_thread"
```

### Mode 5: Heartbeat Integration
Add to your HEARTBEAT.md:
```
- Check if today's GitHub trending digest has been generated
  - If not and it's past 9AM: Run trendclaw_scout and announce the digest
```

## Tool Parameters

- `language` (optional): Filter by programming language (e.g., "python", "typescript")
- `period` (optional): "daily" | "weekly" | "monthly" (default: "daily")
- `topN` (optional): Number of repos to analyze, 3-25 (default: 10)
- `formats` (optional): Array of content formats to generate
  - "digest": Scannable Markdown summary with tables and deep dives
  - "tweet_thread": Viral-style X/Twitter thread with emoji and hashtags
  - "blog_post": 800-word article grouping repos by theme
  - "newsletter": Developer newsletter with spotlight and rising stars
- `outputLanguage` (optional): Output language (default: "English")

## Output

The tool returns a structured report containing:
1. **Trending Data**: Raw scraped data with deep GitHub API metadata
2. **Historical Diff**: Comparison with yesterday (new entries, dropped, risers, fallers)
3. **AI Analysis**: Categories, velocity signals, themes, hot take
4. **Generated Content**: Ready-to-publish content in requested formats

## LLM Backend

Supports multiple backends via configuration:
- `openai`: OpenAI API (default)
- `ollama`: Local models via Ollama (zero cost, zero data leakage)
- `openclaw`: OpenClaw's native model gateway

## Examples

```
"What's trending on GitHub today?"
→ Runs with defaults: daily, top 10, digest format

"Generate a Chinese tweet thread about this week's Python trends"
→ language=python, period=weekly, formats=tweet_thread, outputLanguage=Chinese

"Set up a daily trending newsletter for my team"
→ Suggests cron setup with newsletter format
```
