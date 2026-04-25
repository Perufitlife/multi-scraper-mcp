# Multi-Scraper MCP Server — 12 Tools for AI Agents

Connect ChatGPT, Claude Desktop, Cursor, Cline, Continue, Windsurf, or any [Model Context Protocol](https://modelcontextprotocol.io) client to a curated set of 12 production web scraping tools — Reddit, Amazon, eBay, Google Maps (search & reviews), Yelp, YouTube, TikTok, Indeed, Trustpilot, website contact finder, SaaS pricing tracker.

This is a **Standby MCP server**: deploy it once on Apify, get a stable HTTP endpoint, and any MCP client can connect.

## Available tools

| Tool | What it does |
|------|--------------|
| `reddit_scrape` | Subreddit posts + comments, search queries, sentiment data |
| `amazon_search` | Product listings, prices, ratings — 10 marketplaces |
| `ebay_search` | eBay listings, sold listings (historical pricing) |
| `google_maps_search` | Local business search by category + location |
| `google_maps_reviews` | Extract reviews from any Google Maps business |
| `yelp_search` | Yelp businesses via official Fusion API (requires user's Yelp key) |
| `youtube_channel` | Channel stats + recent videos |
| `tiktok_profile` | Creator profiles + video stats + hashtag discovery |
| `indeed_jobs` | Job listings — 7 countries supported |
| `trustpilot_reviews` | Customer reviews for any company |
| `website_contacts` | Emails, phones, socials, tech stack from any domain |
| `saas_pricing` | Pricing pages tracking with change detection |

## Why use this MCP server

- **Production-ready**: every tool wraps a battle-tested public Apify Actor (1,800+ runs, 350+ users)
- **Single endpoint**: connect once, get 12 tools — no need to install 12 separate scrapers
- **Pay-per-call**: $0.05 per tool call. No subscriptions, no minimums.
- **High-quality output**: structured JSON, consistent schemas across tools
- **Multi-marketplace**: Amazon/eBay/Indeed/Yelp support multiple regional sites

## How to connect

### Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "multi-scraper": {
      "command": "npx",
      "args": ["@modelcontextprotocol/inspector-cli"],
      "env": {
        "MCP_SERVER_URL": "https://YOUR-ACTOR-STANDBY-URL.apify.actor/mcp"
      }
    }
  }
}
```

### Cursor / Cline / Continue

In your MCP config, add server URL: `https://YOUR-ACTOR-STANDBY-URL.apify.actor/mcp`

### Run the actor in Standby mode

1. Start this actor on Apify with `Standby: true` (or click "Start in standby" in the console)
2. Copy the standby URL Apify gives you
3. Use that URL as the MCP endpoint in your client

### For yelp_search: get your free Yelp API key

The `yelp_search` tool needs a Yelp Fusion API key (free 5,000 calls/day). Get one at [docs.developer.yelp.com](https://docs.developer.yelp.com/) and paste it into the actor input.

## Pricing

- **$0.05 per tool call** (pay-per-event)
- Cost includes the underlying scraper run — no double charging
- Apify takes 20%, developer gets 80%

## Use cases

- **AI agent that researches markets**: combine `google_maps_search` + `yelp_search` + `trustpilot_reviews` to score local businesses.
- **AI shopping assistant**: `amazon_search` + `ebay_search` + `tiktok_profile` for cross-platform product intelligence.
- **AI lead generation pipeline**: `google_maps_search` → `website_contacts` → `indeed_jobs` to qualify and enrich prospects.
- **AI sentiment monitor**: `reddit_scrape` + `trustpilot_reviews` + `youtube_channel` for brand monitoring.

## Found this useful?

Please leave a quick review on the **Reviews** tab above. It helps small developers like me get visibility on the Apify Store. Thanks!
