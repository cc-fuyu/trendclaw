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
  builtBy: string[];      // contributor avatars/names
}

/** README content fetched for a repo */
export interface RepoReadme {
  repoName: string;
  content: string;        // raw markdown, truncated
  fetchedAt: string;
}

/** Output of the Scraper phase */
export interface ScrapeResult {
  period: "daily" | "weekly" | "monthly";
  language: string;       // filter language or "any"
  scrapedAt: string;
  repos: TrendingRepo[];
  errors: string[];
}

/** A single analyzed repo with AI-generated insights */
export interface RepoInsight {
  repo: TrendingRepo;
  category: string;       // e.g. "AI/ML", "DevTools", "Web Framework"
  whyTrending: string;    // 1-2 sentence explanation
  targetAudience: string; // who would care about this
  keyTakeaway: string;    // the one thing to know
  relevanceScore: number; // 1-10
}

/** Output of the Analysis phase */
export interface AnalysisResult {
  summary: string;        // overall trend narrative
  insights: RepoInsight[];
  themes: string[];       // top themes across all repos
  hotTake: string;        // a spicy observation
}

/** Generated content piece */
export interface ContentPiece {
  format: "tweet_thread" | "blog_post" | "newsletter" | "digest";
  title: string;
  content: string;        // the actual generated text
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
    generatedAt: string;
  };
}

/** Plugin configuration */
export interface PluginConfig {
  analysisModel: string;
  language: string;
  topN: number;
  trendingPeriod: "daily" | "weekly" | "monthly";
  contentFormats: Array<"tweet_thread" | "blog_post" | "newsletter" | "digest">;
}

/** Tool call parameters */
export interface ScoutParams {
  language?: string;
  period?: "daily" | "weekly" | "monthly";
  topN?: number;
  formats?: string[];
  outputLanguage?: string;
}
