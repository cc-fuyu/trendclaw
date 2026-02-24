# Heartbeat Checklist — GitHub Trending Scout

Add the following items to your agent's HEARTBEAT.md to integrate trending monitoring
into your regular heartbeat cycle.

---

## Trending Scout Checks

- Check if it's past the configured scout time (default: 9:00 AM) and today's digest hasn't been generated yet
  - If yes: Run `/github_trending_scout` with default settings and announce the digest
  - If no: Skip

- Check `~/scout_output/` for yesterday's snapshot
  - If a snapshot exists but today's doesn't: Flag that the daily scout hasn't run yet
  - If both exist: Compare and note any significant changes (e.g., a repo jumped 5+ ranks)

- If the user mentioned any specific technology or language recently in conversation:
  - Run a filtered scout for that language (e.g., `--language python`) and briefly mention any relevant trending repos

- Check if any repos from yesterday's top 10 have been starred or cloned by the user
  - If yes: Note this as a follow-up topic for the next conversation
