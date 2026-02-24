# GitHub Trending Scout

Scrape, analyze, and generate content from GitHub Trending.

## Usage

```
/scout [language=<lang>] [period=<daily|weekly|monthly>] [top=<n>] [formats=<f1,f2>]
```

## What it does

This skill runs a full pipeline to analyze GitHub trends and generate developer content.

1.  **Scrape**: Fetches the latest trending repos.
2.  **Analyze**: Uses an LLM to categorize repos, explain why they are trending, and identify key themes.
3.  **Generate**: Creates content in your specified formats (digest, tweet_thread, blog_post, newsletter).

The output is a full report containing all generated content pieces.

## Parameters

- `language`: Filter by programming language (e.g., `typescript`).
- `period`: `daily` (default), `weekly`, or `monthly`.
- `top`: Number of repos to analyze (default: 10).
- `formats`: Comma-separated list of formats to generate (default: `digest`).

## Examples

```
/scout
/scout language=rust period=weekly top=5
/scout formats=tweet_thread,blog_post
```

## Requirements

Requires the `trending-scout` plugin to be installed and the `github_trending_scout` tool to be enabled.
