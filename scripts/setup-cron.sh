#!/usr/bin/env bash
# ─── GitHub Trending Scout — OpenClaw Cron Setup ───
#
# One-command setup for daily automated trending reports.
# Usage: bash scripts/setup-cron.sh [options]
#
# This script registers cron jobs with OpenClaw to run the scout
# automatically and deliver results to your preferred channel.

set -euo pipefail

# ─── Defaults ───
SCOUT_TIME="0 9 * * *"          # 9:00 AM daily
TIMEZONE="America/New_York"
LANGUAGE="English"
FORMATS="digest,tweet_thread"
PERIOD="daily"
TOP_N=10
CHANNEL=""                       # Empty = current session
MODEL="sonnet"
SESSION="isolated"
ANNOUNCE="true"

# ─── Parse Arguments ───
while [[ $# -gt 0 ]]; do
  case $1 in
    --time)       SCOUT_TIME="$2"; shift 2 ;;
    --tz)         TIMEZONE="$2"; shift 2 ;;
    --language)   LANGUAGE="$2"; shift 2 ;;
    --formats)    FORMATS="$2"; shift 2 ;;
    --period)     PERIOD="$2"; shift 2 ;;
    --top)        TOP_N="$2"; shift 2 ;;
    --channel)    CHANNEL="$2"; shift 2 ;;
    --model)      MODEL="$2"; shift 2 ;;
    --no-announce) ANNOUNCE="false"; shift ;;
    --help|-h)
      cat << 'EOF'
GitHub Trending Scout — Cron Setup

Usage: bash scripts/setup-cron.sh [options]

Options:
  --time <cron>       Cron expression (default: "0 9 * * *" = 9AM daily)
  --tz <timezone>     Timezone (default: America/New_York)
  --language <lang>   Output language (default: English)
  --formats <f1,f2>   Content formats (default: digest,tweet_thread)
  --period <p>        Trending period: daily|weekly|monthly (default: daily)
  --top <n>           Number of repos (default: 10)
  --channel <ch>      Delivery channel: whatsapp|telegram|discord|slack
  --model <m>         LLM model override (default: sonnet)
  --no-announce       Don't announce results (save to file only)
  --help              Show this help

Examples:
  # Daily 9AM digest + tweets, announced to current channel
  bash scripts/setup-cron.sh

  # Daily 8AM Chinese digest to WhatsApp
  bash scripts/setup-cron.sh --time "0 8 * * *" --tz "Asia/Shanghai" \
    --language Chinese --channel whatsapp

  # Weekly Monday 10AM newsletter to Telegram
  bash scripts/setup-cron.sh --time "0 10 * * 1" --formats newsletter \
    --period weekly --channel telegram

  # Every 6 hours, no announcement (file only)
  bash scripts/setup-cron.sh --time "0 */6 * * *" --no-announce
EOF
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ─── Build the cron message ───
MESSAGE="Run the GitHub Trending Scout pipeline:
- Scrape the top ${TOP_N} ${PERIOD} trending repos
- Enrich with GitHub API deep metadata
- Compare with yesterday's snapshot (history diff)
- AI-analyze trends, themes, and velocity signals
- Generate content in these formats: ${FORMATS}
- Output language: ${LANGUAGE}
- Save all outputs to ~/scout_output/

Use the github_trending_scout tool with these parameters:
  topN: ${TOP_N}
  period: ${PERIOD}
  formats: [${FORMATS}]
  outputLanguage: ${LANGUAGE}"

# ─── Build the openclaw cron command ───
CMD="openclaw cron add"
CMD+=" --name \"Trending Scout (${PERIOD})\""
CMD+=" --cron \"${SCOUT_TIME}\""
CMD+=" --tz \"${TIMEZONE}\""
CMD+=" --session ${SESSION}"
CMD+=" --model ${MODEL}"
CMD+=" --message \"${MESSAGE}\""

if [ "${ANNOUNCE}" = "true" ]; then
  CMD+=" --announce"
fi

if [ -n "${CHANNEL}" ]; then
  CMD+=" --channel ${CHANNEL}"
fi

# ─── Execute ───
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔭 GitHub Trending Scout — Cron Setup                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "  Schedule:  ${SCOUT_TIME} (${TIMEZONE})"
echo "  Period:    ${PERIOD}"
echo "  Top N:     ${TOP_N}"
echo "  Formats:   ${FORMATS}"
echo "  Language:  ${LANGUAGE}"
echo "  Channel:   ${CHANNEL:-current session}"
echo "  Model:     ${MODEL}"
echo "  Announce:  ${ANNOUNCE}"
echo ""
echo "  Command:"
echo "  ${CMD}"
echo ""

eval "${CMD}" && echo "  ✅ Cron job registered successfully!" || echo "  ❌ Failed to register cron job. Is OpenClaw running?"

echo ""
echo "  Manage your cron jobs:"
echo "    openclaw cron list          # View all jobs"
echo "    openclaw cron remove <id>   # Remove a job"
echo "    openclaw cron run <id>      # Run immediately"
echo ""
