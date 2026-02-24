// ─── GitHub Trending Scout — Scraper Agent ───
//
// Scrapes github.com/trending to extract repo data.
// No API key needed — parses the public HTML page.

import type { TrendingRepo, ScrapeResult, RepoReadme } from "../types.js";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** Parse a star/fork count string like "12,345" → 12345 */
function parseCount(text: string): number {
  return parseInt(text.replace(/,/g, "").trim(), 10) || 0;
}

/** Strip HTML tags from a string */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Scrape GitHub Trending page.
 *
 * @param period - "daily" | "weekly" | "monthly"
 * @param language - programming language filter (e.g. "typescript") or empty for all
 * @param topN - max repos to return
 */
export async function scrapeTrending(
  period: "daily" | "weekly" | "monthly" = "daily",
  language: string = "",
  topN: number = 10,
): Promise<ScrapeResult> {
  const sinceMap = { daily: "daily", weekly: "weekly", monthly: "monthly" };
  const langPath = language ? `/${encodeURIComponent(language.toLowerCase())}` : "";
  const url = `https://github.com/trending${langPath}?since=${sinceMap[period]}`;

  console.log(`[scraper] Fetching: ${url}`);

  const errors: string[] = [];
  let html: string;

  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch (err) {
    throw new Error(`Failed to fetch GitHub Trending: ${err}`);
  }

  // Parse articles using regex (no DOM parser dependency needed)
  const articleRegex = /<article class="Box-row">([\s\S]*?)<\/article>/g;
  const repos: TrendingRepo[] = [];
  let match: RegExpExecArray | null;
  let rank = 0;

  while ((match = articleRegex.exec(html)) !== null && repos.length < topN) {
    rank++;
    const block = match[1];

    try {
      // Repo name & URL: <h2> ... <a href="/owner/repo">
      const nameMatch = block.match(/<h2[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
      const repoPath = nameMatch?.[1] || "";
      const repoName = repoPath.replace(/^\//, "").trim();
      const repoUrl = `https://github.com${repoPath}`;

      // Description: <p class="...">
      const descMatch = block.match(/<p[^>]*class="[^"]*col-9[^"]*"[^>]*>([\s\S]*?)<\/p>/);
      const description = descMatch ? stripHtml(descMatch[1]) : "";

      // Language: <span itemprop="programmingLanguage">
      const langMatch = block.match(/<span\s+itemprop="programmingLanguage">([\s\S]*?)<\/span>/);
      const repoLang = langMatch ? stripHtml(langMatch[1]) : "";

      // Total stars: first <a class="Link--muted ..."> with star icon
      const starsLinks = [...block.matchAll(/<a[^>]*class="[^"]*Link--muted[^"]*"[^>]*href="[^"]*\/stargazers"[^>]*>([\s\S]*?)<\/a>/g)];
      const totalStars = starsLinks[0] ? parseCount(stripHtml(starsLinks[0][1])) : 0;

      // Forks
      const forksLinks = [...block.matchAll(/<a[^>]*class="[^"]*Link--muted[^"]*"[^>]*href="[^"]*\/forks"[^>]*>([\s\S]*?)<\/a>/g)];
      const forks = forksLinks[0] ? parseCount(stripHtml(forksLinks[0][1])) : 0;

      // Stars today: "XXX stars today/this week/this month"
      const todayMatch = block.match(/([\d,]+)\s+stars?\s+(?:today|this\s+week|this\s+month)/i);
      const starsToday = todayMatch ? parseCount(todayMatch[1]) : 0;

      // Built by: contributor img alt texts
      const builtByMatches = [...block.matchAll(/<img[^>]*class="[^"]*avatar[^"]*"[^>]*alt="@([^"]+)"/g)];
      const builtBy = builtByMatches.map((m) => m[1]);

      if (repoName) {
        repos.push({
          rank,
          name: repoName,
          url: repoUrl,
          description,
          language: repoLang,
          totalStars,
          forks,
          starsToday,
          builtBy,
        });
      }
    } catch (err) {
      errors.push(`Failed to parse article #${rank}: ${err}`);
    }
  }

  console.log(`[scraper] Parsed ${repos.length} repos from trending page`);

  return {
    period,
    language: language || "any",
    scrapedAt: new Date().toISOString(),
    repos,
    errors,
  };
}

/**
 * Fetch a repo's README (first 4000 chars) via GitHub API.
 * Uses the public API — no token needed for public repos.
 */
export async function fetchReadme(repoName: string): Promise<RepoReadme> {
  const url = `https://api.github.com/repos/${repoName}/readme`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "application/vnd.github.v3.raw",
      },
    });

    if (!res.ok) {
      return { repoName, content: "", fetchedAt: new Date().toISOString() };
    }

    const text = await res.text();
    return {
      repoName,
      content: text.slice(0, 4000),
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return { repoName, content: "", fetchedAt: new Date().toISOString() };
  }
}

/**
 * Batch-fetch READMEs for multiple repos with rate limiting.
 */
export async function fetchReadmes(
  repoNames: string[],
  concurrency: number = 3,
): Promise<RepoReadme[]> {
  const results: RepoReadme[] = [];

  for (let i = 0; i < repoNames.length; i += concurrency) {
    const batch = repoNames.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(batch.map(fetchReadme));

    for (const r of batchResults) {
      if (r.status === "fulfilled") results.push(r.value);
    }

    // Rate limit: 500ms between batches
    if (i + concurrency < repoNames.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return results;
}
