// ─── GitHub Trending Scout — Shared Types ───

/** A single trending repository scraped from GitHub */
export interface TrendingRepo {
  rank: number;
  name: string;           // "owner/repo"
  url: string;            // full GitHub URL
  description: string;
  language: string;
  totalStars: number;
  forks: number;
  starsToday: number;
  builtBy: string[];      // contributor usernames
}

/** Deep metadata fetched from GitHub API for a repo */
export interface RepoDeepMeta {
  repoName: string;
  openIssues: number;
  watchers: number;
  createdAt: string;
  pushedAt: string;         // last push timestamp
  license: string;
  topics: string[];
  defaultBranch: string;
  // Computed
  ageInDays: number;
  recentCommitActivity: number; // commits in last week (from stats)
  readme: string;           // truncated README content
}

/** README content fetched for a repo */
export interface RepoReadme {
  repoName: string;
  content: string;
  fetchedAt: string;
}

/** Output of the Scraper phase */
export interface ScrapeResult {
  period: "daily" | "weekly" | "monthly";
  language: string;
  scrapedAt: string;
  repos: TrendingRepo[];
  errors: string[];
}

/** Historical comparison entry */
export interface TrendingDiff {
  newEntries: string[];     // repos that weren't trending yesterday
  dropped: string[];        // repos that were trending yesterday but not today
  risers: Array<{ name: string; rankChange: number }>;
  fallers: Array<{ name: string; rankChange: number }>;
  stableCount: number;
}

/** A single analyzed repo with AI-generated insights */
export interface RepoInsight {
  repo: TrendingRepo;
  deepMeta?: RepoDeepMeta;
  category: string;
  whyTrending: string;
  targetAudience: string;
  keyTakeaway: string;
  relevanceScore: number;   // 1-10
  velocitySignal: string;   // "rocket" | "rising" | "stable" | "fading"
}

/** Output of the Analysis phase */
export interface AnalysisResult {
  summary: string;
  insights: RepoInsight[];
  themes: string[];
  hotTake: string;
  diff?: TrendingDiff;
}

/** Generated content piece */
export interface ContentPiece {
  format: "tweet_thread" | "blog_post" | "newsletter" | "digest";
  title: string;
  content: string;
  wordCount: number;
  hashtags: string[];
}

/** Full pipeline result */
export interface ScoutResult {
  scrape: ScrapeResult;
  analysis: AnalysisResult;
  content: ContentPiece[];
  metadata: {
    durationMs: number;
    model: string;
    llmBackend: string;
    generatedAt: string;
  };
}

// ─── LLM Backend Configuration ───

export type LLMBackend = "openai" | "ollama" | "openclaw";

export interface LLMConfig {
  backend: LLMBackend;
  model: string;
  baseUrl?: string;         // for Ollama or custom endpoints
  apiKey?: string;          // optional override
  temperature?: number;
}

/** Plugin configuration */
export interface PluginConfig {
  llm: LLMConfig;
  language: string;
  topN: number;
  trendingPeriod: "daily" | "weekly" | "monthly";
  contentFormats: Array<"tweet_thread" | "blog_post" | "newsletter" | "digest">;
  enableDeepMeta: boolean;  // fetch GitHub API deep data
  enableDiff: boolean;      // compare with previous run
  historyDir: string;       // where to store history snapshots
}

/** Tool call parameters */
export interface ScoutParams {
  language?: string;
  period?: "daily" | "weekly" | "monthly";
  topN?: number;
  formats?: string[];
  outputLanguage?: string;
}
