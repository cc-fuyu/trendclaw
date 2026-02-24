#!/usr/bin/env node
// ─── GitHub Trending Scout — Standalone CLI ───
//
// Run the full pipeline without OpenClaw:
//   npx trending-scout --formats digest,tweet_thread
//   npx trending-scout --language python --period weekly

import { runScout } from "./orchestrator.js";
import * as fs from "node:fs";
import * as path from "node:path";

const HELP = `
╔═══════════════════════════════════════════════════════╗
║      🔭 GitHub Trending Scout — CLI                  ║
║      Scrape → Analyze → Generate Developer Content   ║
╚═══════════════════════════════════════════════════════╝

Usage:
  trending-scout [options]

Options:
  --language <lang>       Filter repos by language (e.g. "python", "typescript")
  --period <p>            daily | weekly | monthly (default: daily)
  --top <n>               Number of repos (default: 10)
  --formats <f1,f2>       digest,tweet_thread,blog_post,newsletter (default: digest)
  --output-lang <lang>    Output language (default: English)
  --model <model>         LLM model (default: gpt-4.1-mini)
  --out <dir>             Output directory (default: ./scout_output)
  --help                  Show this help

Examples:
  trending-scout
  trending-scout --language typescript --formats digest,tweet_thread
  trending-scout --period weekly --top 15 --output-lang Chinese
  trending-scout --formats blog_post,newsletter --out ./content

Environment:
  OPENAI_API_KEY          Required.
`;

interface CliArgs {
  language: string;
  period: "daily" | "weekly" | "monthly";
  topN: number;
  formats: string[];
  outputLang: string;
  model: string;
  outDir: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    language: "",
    period: "daily",
    topN: 10,
    formats: ["digest"],
    outputLang: "English",
    model: "gpt-4.1-mini",
    outDir: "./scout_output",
  };

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--language": args.language = argv[++i]; break;
      case "--period": args.period = argv[++i] as CliArgs["period"]; break;
      case "--top": args.topN = parseInt(argv[++i], 10); break;
      case "--formats": args.formats = argv[++i].split(","); break;
      case "--output-lang": args.outputLang = argv[++i]; break;
      case "--model": args.model = argv[++i]; break;
      case "--out": args.outDir = argv[++i]; break;
      case "--help": case "-h": console.log(HELP); process.exit(0);
    }
  }
  return args;
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(HELP);
    process.exit(0);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY is required. Set it in your environment.");
    process.exit(1);
  }

  const args = parseArgs(argv);

  const result = await runScout(
    {
      language: args.language,
      period: args.period,
      topN: args.topN,
      formats: args.formats,
      outputLanguage: args.outputLang,
    },
    {
      analysisModel: args.model,
      language: args.outputLang,
      topN: args.topN,
      trendingPeriod: args.period,
      contentFormats: args.formats as any,
    },
  );

  // Save outputs
  const outDir = path.resolve(args.outDir);
  fs.mkdirSync(outDir, { recursive: true });

  const date = new Date().toISOString().split("T")[0];

  // Save raw scrape data
  const scrapeFile = path.join(outDir, `${date}-trending-raw.json`);
  fs.writeFileSync(scrapeFile, JSON.stringify(result.scrape, null, 2));

  // Save analysis
  const analysisFile = path.join(outDir, `${date}-analysis.json`);
  fs.writeFileSync(analysisFile, JSON.stringify(result.analysis, null, 2));

  // Save each content piece
  for (const piece of result.content) {
    const ext = piece.format === "tweet_thread" ? "txt" : "md";
    const file = path.join(outDir, `${date}-${piece.format}.${ext}`);
    fs.writeFileSync(file, piece.content);
    console.log(`  📄 Saved: ${file}`);
  }

  // Save full result
  const fullFile = path.join(outDir, `${date}-full-result.json`);
  fs.writeFileSync(fullFile, JSON.stringify(result, null, 2));

  console.log(`\n${"═".repeat(50)}`);
  console.log(`  ✅ All outputs saved to: ${outDir}`);
  console.log(`  📊 ${result.scrape.repos.length} repos analyzed`);
  console.log(`  📝 ${result.content.length} content pieces generated`);
  console.log(`  ⏱️  ${(result.metadata.durationMs / 1000).toFixed(1)}s total`);
  console.log(`${"═".repeat(50)}\n`);
}

main().catch((err) => {
  console.error(`\n❌ Fatal error: ${err.message || err}`);
  process.exit(1);
});
