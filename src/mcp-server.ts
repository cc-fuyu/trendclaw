#!/usr/bin/env node
// ─── GitHub Trending Scout — MCP Server ───
//
// Exposes the scout pipeline as an MCP (Model Context Protocol) server.
// Any MCP-compatible client (OpenClaw, Claude Desktop, etc.) can call it.
//
// Usage:
//   node dist/mcp-server.js                    # Start MCP server on stdio
//   node dist/mcp-server.js --port 3847        # Start on HTTP (SSE)
//
// OpenClaw config (openclaw.json):
//   "mcpServers": {
//     "trending-scout": {
//       "command": "node",
//       "args": ["/path/to/dist/mcp-server.js"]
//     }
//   }

import { runScout } from "./orchestrator.js";
import type { LLMBackend, PluginConfig } from "./types.js";
import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";

// ─── MCP Protocol Types ───

interface MCPRequest {
  jsonrpc: "2.0";
  id: number | string;
  method: string;
  params?: Record<string, unknown>;
}

interface MCPResponse {
  jsonrpc: "2.0";
  id: number | string;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

// ─── Tool Definitions ───

const TOOLS = [
  {
    name: "github_trending_scout",
    description:
      "Scrape GitHub Trending repos, enrich with deep metadata from GitHub API, " +
      "AI-analyze trends with history comparison, and generate multi-format developer content. " +
      "Supports digest, tweet_thread, blog_post, newsletter formats. " +
      "Pipeline: Scrape → Enrich → History Diff → Analyze → Generate.",
    inputSchema: {
      type: "object" as const,
      properties: {
        language: {
          type: "string",
          description: 'Filter by programming language (e.g. "typescript", "python"). Empty = all.',
        },
        period: {
          type: "string",
          enum: ["daily", "weekly", "monthly"],
          description: "Trending time range. Default: daily.",
        },
        topN: {
          type: "number",
          description: "Number of repos to analyze (3-25). Default: 10.",
          minimum: 3,
          maximum: 25,
        },
        formats: {
          type: "array",
          items: {
            type: "string",
            enum: ["digest", "tweet_thread", "blog_post", "newsletter"],
          },
          description: 'Content formats to generate. Default: ["digest"].',
        },
        outputLanguage: {
          type: "string",
          description: 'Language for generated content (e.g. "Chinese", "English"). Default: English.',
        },
      },
    },
  },
  {
    name: "github_trending_raw",
    description:
      "Scrape GitHub Trending repos and return raw structured data (no AI analysis). " +
      "Useful for agents that want to do their own analysis.",
    inputSchema: {
      type: "object" as const,
      properties: {
        language: {
          type: "string",
          description: 'Filter by programming language. Empty = all.',
        },
        period: {
          type: "string",
          enum: ["daily", "weekly", "monthly"],
          description: "Trending time range. Default: daily.",
        },
        topN: {
          type: "number",
          description: "Number of repos (3-25). Default: 10.",
        },
      },
    },
  },
];

// ─── Tool Execution ───

async function executeTool(name: string, args: Record<string, unknown>): Promise<MCPResponse["result"]> {
  if (name === "github_trending_scout") {
    const result = await runScout(
      {
        language: (args.language as string) || "",
        period: (args.period as "daily" | "weekly" | "monthly") || "daily",
        topN: (args.topN as number) || 10,
        formats: (args.formats as string[]) || ["digest"],
        outputLanguage: (args.outputLanguage as string) || "English",
      },
      {
        llm: {
          backend: (process.env.SCOUT_LLM_BACKEND as LLMBackend) || "openai",
          model: process.env.SCOUT_LLM_MODEL || "gpt-4.1-mini",
          baseUrl: process.env.SCOUT_LLM_BASE_URL || undefined,
        },
        language: (args.outputLanguage as string) || "English",
        topN: (args.topN as number) || 10,
        trendingPeriod: (args.period as "daily" | "weekly" | "monthly") || "daily",
        contentFormats: ((args.formats as PluginConfig["contentFormats"]) || ["digest"]),
        enableDeepMeta: true,
        enableDiff: true,
        historyDir: path.join(process.env.HOME || "~", ".scout_history"),
      },
    );

    // Build text output
    const lines: string[] = [];
    lines.push(`# GitHub Trending Scout Report`);
    lines.push(`**Period:** ${result.scrape.period} | **Repos:** ${result.scrape.repos.length} | **Duration:** ${(result.metadata.durationMs / 1000).toFixed(1)}s`);
    lines.push("");
    lines.push(`## Summary`);
    lines.push(result.analysis.summary);
    lines.push("");
    lines.push(`## Themes: ${result.analysis.themes.join(" · ")}`);
    lines.push("");

    if (result.analysis.diff) {
      const d = result.analysis.diff;
      lines.push(`## What Changed`);
      if (d.newEntries.length > 0) lines.push(`- **New:** ${d.newEntries.join(", ")}`);
      if (d.dropped.length > 0) lines.push(`- **Dropped:** ${d.dropped.join(", ")}`);
      lines.push("");
    }

    for (const piece of result.content) {
      lines.push(`---`);
      lines.push(`## ${piece.format.replace("_", " ").toUpperCase()}`);
      lines.push(piece.content);
      lines.push("");
    }

    return {
      content: [{ type: "text", text: lines.join("\n") }],
    };
  }

  if (name === "github_trending_raw") {
    // Import scraper directly for raw mode
    const { scrapeTrending } = await import("./agents/scraper.js");
    const repos = await scrapeTrending(
      (args.period as "daily" | "weekly" | "monthly") || "daily",
      (args.language as string) || "",
      (args.topN as number) || 10,
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(repos, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}

// ─── MCP Server (stdio transport) ───

async function handleRequest(req: MCPRequest): Promise<MCPResponse> {
  try {
    switch (req.method) {
      case "initialize":
        return {
          jsonrpc: "2.0",
          id: req.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: {
              name: "github-trending-scout",
              version: "0.3.0",
            },
          },
        };

      case "tools/list":
        return {
          jsonrpc: "2.0",
          id: req.id,
          result: { tools: TOOLS },
        };

      case "tools/call": {
        const { name, arguments: args } = req.params as {
          name: string;
          arguments: Record<string, unknown>;
        };
        const result = await executeTool(name, args || {});
        return { jsonrpc: "2.0", id: req.id, result };
      }

      case "notifications/initialized":
        // Client notification, no response needed
        return { jsonrpc: "2.0", id: req.id, result: {} };

      default:
        return {
          jsonrpc: "2.0",
          id: req.id,
          error: { code: -32601, message: `Method not found: ${req.method}` },
        };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      jsonrpc: "2.0",
      id: req.id,
      error: { code: -32000, message: msg },
    };
  }
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin });

  process.stderr.write("[trending-scout-mcp] Server started on stdio\n");

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const req: MCPRequest = JSON.parse(line);
      const res = await handleRequest(req);
      // Only send response for requests (not notifications)
      if (req.id !== undefined) {
        process.stdout.write(JSON.stringify(res) + "\n");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(`[trending-scout-mcp] Parse error: ${msg}\n`);
    }
  }
}

main().catch((err) => {
  process.stderr.write(`[trending-scout-mcp] Fatal: ${err.message || err}\n`);
  process.exit(1);
});
