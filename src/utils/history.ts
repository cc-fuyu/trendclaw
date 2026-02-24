// ─── GitHub Trending Scout — History & Deep Meta ───
//
// 1. Saves daily snapshots to enable trending diff (new entries, dropped, risers)
// 2. Fetches deep metadata from GitHub API (issues, topics, commit activity)

import * as fs from "node:fs";
import * as path from "node:path";
import type { TrendingRepo, TrendingDiff, RepoDeepMeta, ScrapeResult } from "../types.js";

const UA = "TrendingScout/1.0";

// ─── History Snapshots ───

interface HistorySnapshot {
  date: string;
  repos: Array<{ rank: number; name: string; starsToday: number }>;
}

/**
 * Save today's trending data as a snapshot for future comparison.
 */
export function saveSnapshot(scrape: ScrapeResult, historyDir: string): void {
  fs.mkdirSync(historyDir, { recursive: true });

  const date = new Date().toISOString().split("T")[0];
  const snapshot: HistorySnapshot = {
    date,
    repos: scrape.repos.map((r) => ({
      rank: r.rank,
      name: r.name,
      starsToday: r.starsToday,
    })),
  };

  const file = path.join(historyDir, `${date}.json`);
  fs.writeFileSync(file, JSON.stringify(snapshot, null, 2));
  console.log(`[history] Snapshot saved: ${file}`);
}

/**
 * Load the most recent previous snapshot (before today).
 */
function loadPreviousSnapshot(historyDir: string): HistorySnapshot | null {
  if (!fs.existsSync(historyDir)) return null;

  const today = new Date().toISOString().split("T")[0];
  const files = fs.readdirSync(historyDir)
    .filter((f) => f.endsWith(".json") && f < `${today}.json`)
    .sort()
    .reverse();

  if (files.length === 0) return null;

  try {
    const content = fs.readFileSync(path.join(historyDir, files[0]), "utf-8");
    return JSON.parse(content) as HistorySnapshot;
  } catch {
    return null;
  }
}

/**
 * Compare today's trending with the previous snapshot.
 * Returns which repos are new, dropped, rising, or falling.
 */
export function computeDiff(scrape: ScrapeResult, historyDir: string): TrendingDiff | null {
  const prev = loadPreviousSnapshot(historyDir);
  if (!prev) {
    console.log("[history] No previous snapshot found, skipping diff");
    return null;
  }

  console.log(`[history] Comparing with snapshot from ${prev.date}`);

  const todayNames = new Set(scrape.repos.map((r) => r.name));
  const prevNames = new Set(prev.repos.map((r) => r.name));
  const prevRankMap = new Map(prev.repos.map((r) => [r.name, r.rank]));

  const newEntries = scrape.repos
    .filter((r) => !prevNames.has(r.name))
    .map((r) => r.name);

  const dropped = prev.repos
    .filter((r) => !todayNames.has(r.name))
    .map((r) => r.name);

  const risers: Array<{ name: string; rankChange: number }> = [];
  const fallers: Array<{ name: string; rankChange: number }> = [];
  let stableCount = 0;

  for (const repo of scrape.repos) {
    const prevRank = prevRankMap.get(repo.name);
    if (prevRank !== undefined) {
      const change = prevRank - repo.rank; // positive = moved up
      if (change > 0) risers.push({ name: repo.name, rankChange: change });
      else if (change < 0) fallers.push({ name: repo.name, rankChange: change });
      else stableCount++;
    }
  }

  risers.sort((a, b) => b.rankChange - a.rankChange);
  fallers.sort((a, b) => a.rankChange - b.rankChange);

  return { newEntries, dropped, risers, fallers, stableCount };
}

// ─── GitHub API Deep Metadata ───

/**
 * Fetch deep metadata for a single repo from GitHub REST API.
 */
async function fetchRepoMeta(repoName: string): Promise<RepoDeepMeta | null> {
  try {
    // Repo info
    const repoRes = await fetch(`https://api.github.com/repos/${repoName}`, {
      headers: { "User-Agent": UA, Accept: "application/vnd.github.v3+json" },
    });
    if (!repoRes.ok) return null;
    const repo = (await repoRes.json()) as any;

    // README
    let readme = "";
    try {
      const readmeRes = await fetch(`https://api.github.com/repos/${repoName}/readme`, {
        headers: { "User-Agent": UA, Accept: "application/vnd.github.v3.raw" },
      });
      if (readmeRes.ok) readme = (await readmeRes.text()).slice(0, 4000);
    } catch { /* ignore */ }

    // Commit activity (last week)
    let recentCommitActivity = 0;
    try {
      const statsRes = await fetch(`https://api.github.com/repos/${repoName}/stats/participation`, {
        headers: { "User-Agent": UA, Accept: "application/vnd.github.v3+json" },
      });
      if (statsRes.ok) {
        const stats = (await statsRes.json()) as any;
        const allWeeks: number[] = stats.all || [];
        recentCommitActivity = allWeeks[allWeeks.length - 1] || 0;
      }
    } catch { /* ignore */ }

    const createdAt = repo.created_at || "";
    const ageInDays = createdAt
      ? Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000)
      : 0;

    return {
      repoName,
      openIssues: repo.open_issues_count || 0,
      watchers: repo.subscribers_count || 0,
      createdAt,
      pushedAt: repo.pushed_at || "",
      license: repo.license?.spdx_id || "None",
      topics: repo.topics || [],
      defaultBranch: repo.default_branch || "main",
      ageInDays,
      recentCommitActivity,
      readme,
    };
  } catch (err) {
    console.log(`[deep-meta] Failed for ${repoName}: ${err}`);
    return null;
  }
}

/**
 * Batch-fetch deep metadata for multiple repos.
 */
export async function fetchDeepMeta(
  repoNames: string[],
  concurrency: number = 2,
): Promise<Map<string, RepoDeepMeta>> {
  console.log(`[deep-meta] Fetching deep metadata for ${repoNames.length} repos...`);
  const results = new Map<string, RepoDeepMeta>();

  for (let i = 0; i < repoNames.length; i += concurrency) {
    const batch = repoNames.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(batch.map(fetchRepoMeta));

    for (const r of batchResults) {
      if (r.status === "fulfilled" && r.value) {
        results.set(r.value.repoName, r.value);
      }
    }

    // GitHub API rate limit: ~60 req/hr unauthenticated
    if (i + concurrency < repoNames.length) {
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  console.log(`[deep-meta] Fetched metadata for ${results.size}/${repoNames.length} repos`);
  return results;
}
