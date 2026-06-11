# Multi-Scraper MCP — 12 scraping tools for AI agents, one MCP server

Give your AI agent real-time web data with a single connection. This [Model Context Protocol](https://modelcontextprotocol.io) server exposes **12 production scraping tools** — Reddit, Amazon, eBay, Google Maps (search + reviews), Yelp, YouTube, TikTok, Indeed, Trustpilot, website contact finder, and SaaS pricing tracker — to Claude, ChatGPT, Cursor, Cline, Windsurf, or any MCP client.

One endpoint. Twelve tools. Pay only for the calls your agent makes.

## The 12 tools

| Tool | What your agent gets |
|------|----------------------|
| `reddit_scrape` | Subreddit posts, Reddit-wide search, comment threads — sentiment & market research |
| `amazon_search` | Products, prices, ratings, ASINs — 10 marketplaces (US/UK/DE/FR/IT/ES/CA/AU/JP/IN) |
| `ebay_search` | Live listings + **sold listings** for real market-price history |
| `google_maps_search` | Local businesses: name, address, phone, website, rating, GPS |
| `google_maps_reviews` | Full review text + ratings for any Google Maps place |
| `yelp_search` | Yelp businesses via the official Fusion API (bring your free Yelp key) |
| `youtube_channel` | Channel stats + recent video metrics |
| `tiktok_profile` | Creator profiles, video stats, hashtag discovery |
| `indeed_jobs` | Job listings with salary data — 7 countries, date/type filters |
| `trustpilot_reviews` | Company reviews — mine complaints with `filterByRating: 1` |
| `website_contacts` | Emails, phones, social links, tech stack from any domain |
| `saas_pricing` | Structured pricing tiers from any SaaS pricing page + change detection |

## Quick start

You need an [Apify account](https://console.apify.com/sign-up) (free tier works) and your API token from [Console → Settings → API & Integrations](https://console.apify.com/settings/integrations).

The MCP endpoint (Streamable HTTP):

```
https://renzomacar--multi-scraper-mcp.apify.actor/mcp
```

Authenticate with `Authorization: Bearer <YOUR_APIFY_TOKEN>` (or append `?token=<YOUR_APIFY_TOKEN>`).

### Claude Code

```bash
claude mcp add --transport http multi-scraper \
  "https://renzomacar--multi-scraper-mcp.apify.actor/mcp" \
  --header "Authorization: Bearer YOUR_APIFY_TOKEN"
```

### Claude Desktop

Settings → Developer → Edit Config, then add:

```json
{
  "mcpServers": {
    "multi-scraper": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://renzomacar--multi-scraper-mcp.apify.actor/mcp",
        "--header",
        "Authorization: Bearer YOUR_APIFY_TOKEN"
      ]
    }
  }
}
```

### Cursor / Windsurf / Cline

Add to your MCP config (e.g. `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "multi-scraper": {
      "url": "https://renzomacar--multi-scraper-mcp.apify.actor/mcp",
      "headers": { "Authorization": "Bearer YOUR_APIFY_TOKEN" }
    }
  }
}
```

### ChatGPT (Developer Mode connectors)

Settings → Connectors → Advanced → Developer mode → Add custom connector, with URL:

```
https://renzomacar--multi-scraper-mcp.apify.actor/mcp?token=YOUR_APIFY_TOKEN
```

### Legacy SSE clients

An SSE transport is also available at `/sse` (+ `/messages`) for older clients.

## Pricing — transparent pay-per-event

| Event | Price |
|-------|-------|
| Tool call (successful) | **$0.05** |
| Actor start (standby wake-up) | $0.00005 per GB |

- No subscription, no minimums — you pay only when your agent actually calls a tool.
- Underlying scraper runs execute under your Apify account at their own listed rates (typically fractions of a cent per result).
- Failed tool calls are **not** charged.

## Notes per tool

- **`yelp_search`** needs a Yelp Fusion API key — free, 5,000 calls/day, 2 minutes to get at [docs.developer.yelp.com](https://docs.developer.yelp.com/). Pass it as the `yelpApiKey` tool argument.
- **`reddit_scrape`** survived Reddit shutting down its public `.json` endpoints (June 2026, universal 403): it now falls back to Reddit RSS feeds with a circuit breaker, so it keeps returning posts. In RSS mode items don't include score/comment counts (`source: rss-fallback`).
- Keep `maxResults*` small (10–30) for snappy agent loops; raise them for batch research.

## Example agent workflows

- **Local lead-gen pipeline**: `google_maps_search` ("dentists in Miami") → `website_contacts` (emails + tech stack) → your CRM.
- **Product intelligence**: `amazon_search` + `ebay_search` (soldOnly) → real street price vs. listed price.
- **Brand/sentiment monitor**: `reddit_scrape` + `trustpilot_reviews` (filterByRating: 1) + `google_maps_reviews` → weekly complaint digest.
- **Competitor watch**: `saas_pricing` on competitor pricing pages with `compareWithPrevious: true` → alert on changes.
- **Hiring-signal prospecting**: `indeed_jobs` ("Shopify developer") → companies investing in e-commerce → `website_contacts`.

## Why this server

- Every tool wraps a battle-tested public Apify Actor (4,000+ combined runs).
- Structured JSON with consistent schemas — built for LLM consumption, results truncated to stay token-friendly.
- Both modern Streamable HTTP (`/mcp`) and legacy SSE (`/sse`) transports.
- Open source: [github.com/Perufitlife/multi-scraper-mcp](https://github.com/Perufitlife/multi-scraper-mcp).

## Found this useful?

Please leave a quick review on the **Reviews** tab — it genuinely helps independent developers get visibility on the Apify Store. Thanks!
