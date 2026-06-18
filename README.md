# Multi-Scraper MCP

An [MCP](https://modelcontextprotocol.io) server that gives **Claude, Cursor, or any AI agent** 14 web scrapers as tools — Reddit, Amazon, eBay, Google Maps, Yelp, YouTube, TikTok, Indeed, Trustpilot, website contact finder, SaaS pricing, and lead-gen — in one server.

## Tools

`reddit_scrape` · `amazon_search` · `ebay_search` · `google_maps_search` · `google_maps_reviews` · `yelp_search` · `youtube_channel` · `tiktok_profile` · `indeed_jobs` · `trustpilot_reviews` · `website_contacts` · `saas_pricing` · `google_maps_leads` · `healthcare_provider_leads`

## Install

You need a free **Apify token** (the scrapers run on Apify): get one at [console.apify.com/account/integrations](https://console.apify.com/account/integrations).

Add to your MCP config (Claude Desktop, Cursor `mcp.json`, etc.):

```json
{
  "mcpServers": {
    "multi-scraper": {
      "command": "npx",
      "args": ["-y", "multi-scraper-mcp"],
      "env": { "APIFY_TOKEN": "apify_api_xxx" }
    }
  }
}
```

Then ask your agent: *"Use reddit_scrape to find what r/smallbusiness complains about this week"* or *"Search Amazon for standing desks and compare prices."*

## Notes

- Each tool runs the matching Apify Actor and returns clean JSON. Pay-per-use on Apify (free tier available).
- `yelp_search` needs a free Yelp API key (`YELP_API_KEY` env or `yelpApiKey` arg).

---

Built by [Renzo Madueño](https://github.com/Perufitlife). The scrapers are also available individually on [Apify](https://apify.com/renzomacar).
