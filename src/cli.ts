#!/usr/bin/env node
// ─── GitHub Trending Scout — Standalone CLI ───
//
// Run the full pipeline without OpenClaw:
//   npx trending-scout --formats digest,tweet_thread
//   npx trending-scout --backend ollama --model llama3
//   npx trending-scout --language python --period weekly

import { runScout } from "./orchestrator.js";
import type { LLMBackend } from "./types.js";
import * as fs from "node:fs";
import * as path from "node:path";

const HELP = `
╔════════════════════════════════════════════════════════════╗
║      🔭 GitHub Trending Scout — CLI                       ║
║      Scrape → Enrich → Analyze → Generate Content          ║
╚════════════════════════════════════════════════════════════╝

Usage:
  trending-scout [options]

LLM Backend Options:
  --backend <b>           openai | ollama | openclaw (default: openai)
  --model <model>         LLM model name (default: gpt-4.1-mini)
  --base-url <url>        Custom API base URL (for Ollama/OpenClaw)

Data Options:
  --language <lang>       Filter repos by language (e.g. "python", "typescript")
  --period <p>            daily | weekly | monthly (default: daily)
  --top <n>               Number of repos (default: 10)
  --no-deep-meta          Skip GitHub API deep metadata fetch
  --no-diff               Skip history comparison

Output Options:
  --formats <f1,f2>       digest,tweet_thread,blog_post,newsletter (default: digest)
  --output-lang <lang>    Output language (default: English)
  --out <dir>             Output directory (default: ./scout_output)
  --help                  Show this help

Examples:
  trending-scout
  trending-scout --backend ollama --model llama3
  trending-scout --language typescript --formats digest,tweet_thread
  trending-scout --period weekly --top 15 --output-lang Chinese
  trending-scout --formats blog_post,newsletter --out ./content

Environment:
  OPENAI_API_KEY          Required for openai backend.
  OLLAMA_HOST             Optional. Ollama server URL (default: http://localhost:11434).
`;

interface CliArgs {
  language: string;
  period: "daily" | "weekly" | "monthly";
  topN: number;
  formats: string[];
  outputLang: string;
  backend: LLMBackend;
  model: string;
  baseUrl: string;
  outDir: string;
  enableDeepMeta: boolean;
  enableDiff: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    language: "",
    period: "daily",
    topN: 10,
    formats: ["digest"],
    outputLang: "English",
    backend: "openai",
    model: "gpt-4.1-mini",
    baseUrl: "",
    outDir: "./scout_output",
    enableDeepMeta: true,
    enableDiff: true,
  };

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--language": args.language = argv[++i]; break;
      case "--period": args.period = argv[++i] as CliArgs["period"]; break;
      case "--top": args.topN = parseInt(argv[++i], 10); break;
      case "--formats": args.formats = argv[++i].split(","); break;
      case "--output-lang": args.outputLang = argv[++i]; break;
      case "--backend": args.backend = argv[++i] as LLMBackend; break;
      case "--model": args.model = argv[++i]; break;
      case "--base-url": args.baseUrl = argv[++i]; break;
      case "--out": args.outDir = argv[++i]; break;
      case "--no-deep-meta": args.enableDeepMeta = false; break;
      case "--no-diff": args.enableDiff = false; break;
      case "--help": case "-h": console.log(HELP); process.exit(0);
    }
  }

  // Auto-detect model defaults per backend
  if (args.backend === "ollama" && args.model === "gpt-4.1-mini") {
    args.model = "llama3";
  }
  if (args.backend === "openclaw" && args.model === "gpt-4.1-mini") {
    args.model = "default";
  }

  return args;
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(HELP);
    process.exit(0);
  }

  const args = parseArgs(argv);

  // Validate API key for OpenAI backend
  if (args.backend === "openai" && !process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY is required for openai backend.");
    console.error("  Set it: export OPENAI_API_KEY='sk-...'");
    console.error("  Or use: --backend ollama --model llama3");
    process.exit(1);
  }

  const result = await runScout(
    {
      language: args.language,
      period: args.period,
      topN: args.topN,
      formats: args.formats,
      outputLanguage: args.outputLang,
    },
    {
      llm: {
        backend: args.backend,
        model: args.model,
        baseUrl: args.baseUrl || undefined,
      },
      language: args.outputLang,
      topN: args.topN,
      trendingPeriod: args.period,
      contentFormats: args.formats as any,
      enableDeepMeta: args.enableDeepMeta,
      enableDiff: args.enableDiff,
      historyDir: path.join(args.outDir, ".history"),
    },
  );

  // Save outputs
  const outDir = path.resolve(args.outDir);
  fs.mkdirSync(outDir, { recursive: true });
  const date = new Date().toISOString().split("T")[0];

  // Raw data
  fs.writeFileSync(path.join(outDir, `${date}-trending-raw.json`), JSON.stringify(result.scrape, null, 2));
  fs.writeFileSync(path.join(outDir, `${date}-analysis.json`), JSON.stringify(result.analysis, null, 2));

  // Content pieces
  for (const piece of result.content) {
    const ext = piece.format === "tweet_thread" ? "txt" : "md";
    const file = path.join(outDir, `${date}-${piece.format}.${ext}`);
    fs.writeFileSync(file, piece.content);
    console.log(`  📄 ${file}`);
  }

  // Full result
  fs.writeFileSync(path.join(outDir, `${date}-full-result.json`), JSON.stringify(result, null, 2));

  console.log(`\n${"═".repeat(56)}`);
  console.log(`  ✅ All outputs saved to: ${outDir}`);
  console.log(`  📊 ${result.scrape.repos.length} repos | 🧠 ${result.metadata.llmBackend}:${result.metadata.model}`);
  console.log(`  📝 ${result.content.length} content pieces | ⏱️  ${(result.metadata.durationMs / 1000).toFixed(1)}s`);
  console.log(`${"═".repeat(56)}\n`);
}

main().catch((err) => {
  console.error(`\n❌ Fatal error: ${err.message || err}`);
  process.exit(1);
});
