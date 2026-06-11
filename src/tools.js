/**
 * Tool definitions for the MCP server.
 * Each tool is a thin wrapper around an existing Apify actor.
 *
 * Descriptions are written for LLM tool selection: what it does, when to use
 * it, and a concrete example input. Keep them under ~3 sentences + example.
 */

export const TOOLS = [
    {
        name: 'reddit_scrape',
        description: 'Get Reddit posts from subreddits, keyword searches across all of Reddit, or comments from specific post URLs. Returns title, score, author, body text, comment count and (optionally) nested comments — ideal for sentiment analysis, market research, and finding what people complain about. Note: when Reddit rate-limits, the scraper transparently degrades to Reddit RSS feeds, so very new comments may be partial. Example input: {"subreddits": ["smallbusiness"], "maxPostsPerSubreddit": 25, "sortBy": "top", "timeFilter": "week"}',
        actorId: 'renzomacar/reddit-scraper',
        inputSchema: {
            type: 'object',
            properties: {
                subreddits: { type: 'array', items: { type: 'string' }, description: 'Subreddit names without the r/ prefix, e.g. ["technology", "SaaS"]' },
                searchQueries: { type: 'array', items: { type: 'string' }, description: 'Keywords to search across all of Reddit, e.g. ["best CRM for small business"]' },
                postUrls: { type: 'array', items: { type: 'string' }, description: 'Direct Reddit post URLs to scrape comments from' },
                maxPostsPerSubreddit: { type: 'integer', default: 25, description: 'Max posts per subreddit/query (1-500). Keep low (10-25) for quick answers.' },
                includeComments: { type: 'boolean', default: false, description: 'Also fetch comments for each post (slower, more thorough)' },
                maxCommentsPerPost: { type: 'integer', default: 20, description: 'Max comments per post when includeComments is true' },
                sortBy: { type: 'string', enum: ['hot', 'new', 'top', 'rising'], default: 'hot' },
                timeFilter: { type: 'string', enum: ['hour', 'day', 'week', 'month', 'year', 'all'], description: 'Time window when sortBy is "top"' },
            },
        },
    },
    {
        name: 'amazon_search',
        description: 'Search Amazon for products or look up specific ASINs/product URLs. Returns title, price, rating, review count, ASIN, image URL and Prime status. Use for price comparison, product research, and competitor monitoring. Supports US/UK/DE/FR/IT/ES/CA/AU/JP/IN marketplaces. Example input: {"searchQueries": ["wireless earbuds"], "marketplace": "amazon.com", "maxResultsPerQuery": 20}',
        actorId: 'renzomacar/amazon-products',
        inputSchema: {
            type: 'object',
            properties: {
                searchQueries: { type: 'array', items: { type: 'string' }, description: 'Product search queries, e.g. ["standing desk", "ergonomic chair"]' },
                productUrls: { type: 'array', items: { type: 'string' }, description: 'Direct product URLs or bare ASINs, e.g. ["B0C1J9KX2P"]' },
                marketplace: { type: 'string', default: 'amazon.com', description: 'Marketplace domain: amazon.com, amazon.co.uk, amazon.de, etc.' },
                maxResultsPerQuery: { type: 'integer', default: 20, description: 'Max products per query (1-100)' },
            },
        },
    },
    {
        name: 'ebay_search',
        description: 'Search eBay listings, including completed/sold listings for real market-price history. Returns title, price, condition, seller, sold count and auction status. Use soldOnly:true to research what items actually sell for (resale/arbitrage analysis). Example input: {"searchQueries": ["vintage seiko watch"], "soldOnly": true, "maxResultsPerQuery": 30}',
        actorId: 'renzomacar/ebay-products',
        inputSchema: {
            type: 'object',
            properties: {
                searchQueries: { type: 'array', items: { type: 'string' }, description: 'eBay search keywords (required), e.g. ["iphone 14 pro unlocked"]' },
                marketplace: { type: 'string', default: 'ebay.com', description: 'eBay domain: ebay.com, ebay.co.uk, ebay.de, etc.' },
                maxResultsPerQuery: { type: 'integer', default: 30, description: 'Max listings per query (1-100)' },
                soldOnly: { type: 'boolean', default: false, description: 'Only completed/sold listings — use for historical pricing research' },
            },
            required: ['searchQueries'],
        },
    },
    {
        name: 'google_maps_search',
        description: 'Find local businesses on Google Maps by category + location. Returns name, address, phone, website, rating, review count and GPS coordinates. The go-to tool for building local lead lists or analyzing local competition. Example input: {"searchQueries": ["dentists in Miami FL"], "maxResultsPerQuery": 25}',
        actorId: 'renzomacar/google-maps-businesses',
        inputSchema: {
            type: 'object',
            properties: {
                searchQueries: { type: 'array', items: { type: 'string' }, description: 'Queries in "category in location" form (required), e.g. ["coffee shops near Times Square NYC"]' },
                maxResultsPerQuery: { type: 'integer', default: 25, description: 'Max businesses per query (1-200)' },
                language: { type: 'string', default: 'en', description: 'Results language code, e.g. en, es, de' },
            },
            required: ['searchQueries'],
        },
    },
    {
        name: 'google_maps_reviews',
        description: 'Extract customer reviews for specific Google Maps places. Returns reviewer name, star rating, full review text, date and owner responses. Use after google_maps_search to dig into reputation/voice-of-customer for a business. Example input: {"placeUrls": ["https://www.google.com/maps/place/..."], "maxReviewsPerPlace": 30, "sortBy": "newest"}',
        actorId: 'renzomacar/google-maps-reviews',
        inputSchema: {
            type: 'object',
            properties: {
                placeUrls: { type: 'array', items: { type: 'string' }, description: 'Google Maps place URLs (required)' },
                maxReviewsPerPlace: { type: 'integer', default: 30, description: 'Max reviews per place (1-500)' },
                sortBy: { type: 'string', enum: ['relevant', 'newest', 'highest', 'lowest'], default: 'newest' },
                language: { type: 'string', default: 'en' },
            },
            required: ['placeUrls'],
        },
    },
    {
        name: 'yelp_search',
        description: 'Search Yelp businesses by category + location through the official Yelp Fusion API (reliable, no scraping blocks). Returns rating, address, phone, categories, price level, GPS and supported transactions. Requires a free Yelp Fusion API key (5000 calls/day at https://docs.developer.yelp.com/) passed as yelpApiKey. Example input: {"searches": ["ramen in San Francisco, CA"], "yelpApiKey": "YOUR_KEY", "maxResultsPerSearch": 20}',
        actorId: 'renzomacar/yelp-fusion-search',
        inputSchema: {
            type: 'object',
            properties: {
                searches: { type: 'array', items: { type: 'string' }, description: 'Queries formatted as "category in city, state" (required), e.g. ["plumbers in Austin, TX"]' },
                yelpApiKey: { type: 'string', description: 'Your Yelp Fusion API key (free at https://docs.developer.yelp.com/). Required unless the server operator configured one.' },
                maxResultsPerSearch: { type: 'integer', default: 20, description: 'Max businesses per search (1-50)' },
                includeReviews: { type: 'boolean', default: false, description: 'Include up to 3 review excerpts per business' },
            },
            required: ['searches'],
        },
        passthroughInput: { yelpApiKey: '__YELP_KEY__' },
    },
    {
        name: 'youtube_channel',
        description: 'Get YouTube channel stats and recent videos, or metadata for specific video URLs. Returns subscribers, total views, and per-video title, view count, likes and publish date. Use for influencer vetting and content research. Example input: {"channelUrls": ["https://www.youtube.com/@mkbhd"], "maxVideosPerChannel": 15}',
        actorId: 'renzomacar/youtube-scraper',
        inputSchema: {
            type: 'object',
            properties: {
                channelUrls: { type: 'array', items: { type: 'string' }, description: 'Channel URLs in any form: @handle, /channel/UC..., /user/...' },
                videoUrls: { type: 'array', items: { type: 'string' }, description: 'Direct video URLs to fetch metadata for' },
                maxVideosPerChannel: { type: 'integer', default: 15, description: 'Max recent videos per channel (1-100)' },
            },
        },
    },
    {
        name: 'tiktok_profile',
        description: 'Scrape TikTok creator profiles, their videos, or discover trending videos by hashtag. Returns followers, total likes, and per-video views, likes, comments, shares, hashtags and music. Use for influencer discovery and trend analysis. Example input: {"profileUrls": ["@khaby.lame"], "maxPostsPerProfile": 10}',
        actorId: 'renzomacar/tiktok-scraper',
        inputSchema: {
            type: 'object',
            properties: {
                profileUrls: { type: 'array', items: { type: 'string' }, description: 'TikTok profile URLs or bare @usernames' },
                hashtags: { type: 'array', items: { type: 'string' }, description: 'Hashtags (without #) to discover trending videos' },
                maxPostsPerProfile: { type: 'integer', default: 10, description: 'Max videos per profile (1-100)' },
                maxResultsPerHashtag: { type: 'integer', default: 10, description: 'Max videos per hashtag (1-100)' },
            },
        },
    },
    {
        name: 'indeed_jobs',
        description: 'Search Indeed job listings. Returns job title, company, location, salary (when posted), description snippet and posting date. Use for salary benchmarking, hiring-market analysis, or lead gen (companies hiring for X likely need Y). Supports US/UK/CA/AU/DE/FR/IN. Example input: {"searchQueries": ["react developer"], "location": "Austin, TX", "country": "us", "datePosted": "7"}',
        actorId: 'renzomacar/indeed-jobs',
        inputSchema: {
            type: 'object',
            properties: {
                searchQueries: { type: 'array', items: { type: 'string' }, description: 'Job titles or keywords (required), e.g. ["data engineer", "RN nurse"]' },
                location: { type: 'string', description: 'City/state or zip, e.g. "Miami, FL". Empty = nationwide.' },
                country: { type: 'string', default: 'us', description: 'Country code: us, uk, ca, au, de, fr, in' },
                datePosted: { type: 'string', enum: ['1', '3', '7', '14'], description: 'Only jobs posted in the last N days' },
                jobType: { type: 'string', enum: ['fulltime', 'parttime', 'contract', 'internship', 'temporary'], description: 'Filter by employment type' },
                maxResultsPerQuery: { type: 'integer', default: 25, description: 'Max jobs per query (1-200)' },
            },
            required: ['searchQueries'],
        },
    },
    {
        name: 'trustpilot_reviews',
        description: 'Scrape Trustpilot reviews for any company. Returns star rating, review title, full text, reviewer name, date, verified status and company responses. Use for competitor reputation analysis and mining customer pain points. Example input: {"companyUrls": ["stripe.com"], "maxReviewsPerCompany": 40, "sortBy": "recency"}',
        actorId: 'renzomacar/trustpilot-reviews',
        inputSchema: {
            type: 'object',
            properties: {
                companyUrls: { type: 'array', items: { type: 'string' }, description: 'Trustpilot company page URLs or bare domains (required), e.g. ["notion.so"]' },
                maxReviewsPerCompany: { type: 'integer', default: 40, description: 'Max reviews per company (1-500)' },
                sortBy: { type: 'string', enum: ['recency', 'relevance'], default: 'recency' },
                filterByRating: { type: 'integer', description: 'Only reviews with this star rating (1-5), e.g. 1 to mine complaints' },
            },
            required: ['companyUrls'],
        },
    },
    {
        name: 'website_contacts',
        description: 'Crawl any website and extract emails, phone numbers, social media links and the detected technology stack. The B2B lead-enrichment workhorse: feed it domains from google_maps_search to get contactable leads. Example input: {"domains": ["acme-plumbing.com"], "maxPagesPerDomain": 4}',
        actorId: 'renzomacar/website-contact-finder',
        inputSchema: {
            type: 'object',
            properties: {
                domains: { type: 'array', items: { type: 'string' }, description: 'Domains or URLs to crawl (required), e.g. ["example.com"]' },
                maxPagesPerDomain: { type: 'integer', default: 4, description: 'Pages to crawl per domain — contact/about pages are prioritized (1-20)' },
                includeGenericEmails: { type: 'boolean', default: true, description: 'Include info@/contact@/sales@ style emails' },
                detectTechStack: { type: 'boolean', default: false, description: 'Also detect CMS/analytics/framework technologies' },
            },
            required: ['domains'],
        },
    },
    {
        name: 'saas_pricing',
        description: 'Extract structured pricing from any SaaS pricing page: tier names, monthly/annual prices, billing periods and feature lists. With compareWithPrevious it diffs against the last run to detect pricing changes — ideal for competitor price monitoring. Example input: {"urls": ["https://slack.com/pricing"], "compareWithPrevious": false}',
        actorId: 'renzomacar/saas-pricing-tracker',
        inputSchema: {
            type: 'object',
            properties: {
                urls: { type: 'array', items: { type: 'string' }, description: 'Direct pricing page URLs (required), e.g. ["https://www.notion.so/pricing"]' },
                compareWithPrevious: { type: 'boolean', default: false, description: 'Diff against previous run of the same URL to detect changes' },
                extractFeatures: { type: 'boolean', default: true, description: 'Extract per-tier feature lists' },
            },
            required: ['urls'],
        },
    },
];
