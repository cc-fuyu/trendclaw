# ─── GitHub Trending Scout — Lobster Workflow ───
# Deterministic multi-step pipeline with approval gates.
# Triggered by cron or on-demand via: /lobster trending-scout.lobster
#
# Pipeline: Scrape → Enrich → Analyze → Generate → Publish
# Each step is a tool call with structured I/O.
# Approval gates before publishing to external channels.

name: trending-scout
description: >
  Scrape GitHub Trending, enrich with deep metadata, AI-analyze trends,
  generate multi-format developer content, and publish to configured channels.

# ─── Step 1: Scrape GitHub Trending ───
- id: scrape
  tool: web_fetch
  params:
    url: "https://github.com/trending?since={{period | default: 'daily'}}"
    format: html
  extract:
    repos: |
      Parse the HTML to extract trending repositories.
      For each repo, extract: owner, name, description, language, stars_today, total_stars, forks.
      Return as a JSON array of objects.

# ─── Step 2: Enrich with GitHub API Deep Metadata ───
- id: enrich
  tool: web_fetch_batch
  depends_on: scrape
  for_each: "{{scrape.repos}}"
  params:
    url: "https://api.github.com/repos/{{item.owner}}/{{item.name}}"
    headers:
      Accept: "application/vnd.github.v3+json"
  extract:
    deep_meta: |
      From each GitHub API response, extract:
      - open_issues_count, watchers_count, topics, created_at
      - Calculate repo age in days
      Merge into the original repo object.

# ─── Step 3: Load History & Compute Diff ───
- id: history_diff
  tool: file_read
  depends_on: enrich
  params:
    path: "~/.scout_history/{{date_yesterday}}.json"
    fallback: "null"
  extract:
    diff: |
      Compare today's repos with yesterday's snapshot.
      Identify: new_entries, dropped, risers (rank improved), fallers (rank dropped).
      If no history exists, set diff to null.
  post_action:
    tool: file_write
    params:
      path: "~/.scout_history/{{date_today}}.json"
      content: "{{enrich.deep_meta | to_json}}"

# ─── Step 4: AI Analysis ───
- id: analyze
  tool: llm_task
  depends_on: [enrich, history_diff]
  params:
    model: "{{model | default: 'sonnet'}}"
    system: |
      You are a senior technology analyst specializing in open-source ecosystems.
      Analyze the following GitHub Trending data and produce structured insights.
    prompt: |
      ## Input Data
      **Trending Repos (with deep metadata):**
      {{enrich.deep_meta | to_json}}

      **Historical Diff:**
      {{history_diff.diff | to_json}}

      ## Required Output (JSON)
      For each repo, provide:
      - category: one of [AI/ML, DevTools, Web, Data, Infrastructure, Security, Other]
      - why_trending: one sentence explaining why it's trending NOW
      - velocity: one of [rocket, rising, stable, fading] based on stars_today + commit activity
      - target_audience: who should care about this repo
      - key_takeaway: the single most important thing to know

      Also provide:
      - themes: array of 3-5 cross-cutting themes across all repos
      - hot_take: a bold, opinionated 2-sentence take on today's landscape
      - summary: a 3-sentence executive summary
    output_schema:
      type: object
      properties:
        insights:
          type: array
          items:
            type: object
            properties:
              repo: { type: string }
              category: { type: string }
              why_trending: { type: string }
              velocity: { type: string }
              target_audience: { type: string }
              key_takeaway: { type: string }
        themes: { type: array, items: { type: string } }
        hot_take: { type: string }
        summary: { type: string }

# ─── Step 5: Generate Content ───
- id: generate
  tool: llm_task
  depends_on: analyze
  params:
    model: "{{model | default: 'sonnet'}}"
    system: |
      You are a developer content creator. Generate content based on the analysis.
      Output language: {{language | default: 'English'}}
    prompt: |
      ## Analysis
      {{analyze | to_json}}

      ## Generate the following formats:
      {{#each formats}}
      ### {{this}}
      {{/each}}

      For each format, follow these guidelines:
      - digest: Markdown with table, top 3 deep dives, themes section
      - tweet_thread: 10-tweet thread with emoji, hashtags, repo links
      - blog_post: 800-word article grouping repos by theme
      - newsletter: Developer newsletter with spotlight, rising stars, hot take

# ─── Step 6: Approval Gate ───
- id: review
  approval: true
  depends_on: generate
  message: |
    ## 📋 Content Review

    I've generated {{formats | length}} content pieces for today's GitHub Trending.
    Please review and approve before publishing.

    {{generate.content_preview}}

    **Approve to publish, or reject to regenerate.**

# ─── Step 7: Publish ───
- id: publish
  depends_on: review
  tool: agent_send
  condition: "{{review.approved}}"
  params:
    channel: "{{publish_channel | default: 'current'}}"
    message: "{{generate.final_content}}"
  post_action:
    tool: file_write
    params:
      path: "~/scout_output/{{date_today}}-{{format}}.md"
      content: "{{generate.final_content}}"
