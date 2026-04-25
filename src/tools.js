/**
 * Tool definitions for the MCP server.
 * Each tool is a thin wrapper around an existing Apify actor.
 */

export const TOOLS = [
    {
        name: 'reddit_scrape',
        description: 'Scrape Reddit subreddits, search results, or post comment threads. Returns posts (titles, scores, comments, body) and optionally full nested comments. Great for sentiment analysis and market research.',
        actorId: 'renzomacar/reddit-scraper',
        inputSchema: {
            type: 'object',
            properties: {
                subreddits: { type: 'array', items: { type: 'string' }, description: 'Subreddit names without r/ prefix (e.g., ["technology", "programming"])' },
                searchQueries: { type: 'array', items: { type: 'string' }, description: 'Keywords to search across all of Reddit' },
                postUrls: { type: 'array', items: { type: 'string' }, description: 'Direct Reddit post URLs to scrape comments from' },
                maxPostsPerSubreddit: { type: 'integer', default: 50, description: 'Max posts per subreddit (1-500)' },
                includeComments: { type: 'boolean', default: false, description: 'Whether to extract comments from each post' },
                sortBy: { type: 'string', enum: ['hot', 'new', 'top', 'rising'], default: 'hot' },
            },
        },
    },
    {
        name: 'amazon_search',
        description: 'Search Amazon for products. Returns titles, prices, ratings, review counts, ASIN, image URLs, prime status. Supports US/UK/DE/FR/IT/ES/CA/AU/JP/IN marketplaces.',
        actorId: 'renzomacar/amazon-products',
        inputSchema: {
            type: 'object',
            properties: {
                searchQueries: { type: 'array', items: { type: 'string' }, description: 'Product search queries' },
                productUrls: { type: 'array', items: { type: 'string' }, description: 'Direct product URLs or bare ASINs' },
                marketplace: { type: 'string', default: 'amazon.com' },
                maxResultsPerQuery: { type: 'integer', default: 30 },
            },
        },
    },
    {
        name: 'ebay_search',
        description: 'Search eBay listings. Returns titles, prices, conditions, sellers, sold counts, auction status. Optional sold-only mode for historical pricing research.',
        actorId: 'renzomacar/ebay-products',
        inputSchema: {
            type: 'object',
            properties: {
                searchQueries: { type: 'array', items: { type: 'string' }, description: 'eBay search keywords' },
                marketplace: { type: 'string', default: 'ebay.com' },
                maxResultsPerQuery: { type: 'integer', default: 30 },
                soldOnly: { type: 'boolean', default: false, description: 'Only show completed/sold listings' },
            },
        },
    },
    {
        name: 'google_maps_search',
        description: 'Search Google Maps for local businesses by category and location. Returns names, addresses, phones, ratings, review counts, GPS coordinates.',
        actorId: 'renzomacar/google-maps-businesses',
        inputSchema: {
            type: 'object',
            properties: {
                searchQueries: { type: 'array', items: { type: 'string' }, description: 'Queries like "dentists in Miami" or "coffee shops near Times Square"' },
                maxResultsPerQuery: { type: 'integer', default: 30 },
                language: { type: 'string', default: 'en' },
            },
        },
    },
    {
        name: 'google_maps_reviews',
        description: 'Extract Google Maps reviews for a specific business. Returns reviewer names, ratings, full text, dates, owner responses.',
        actorId: 'renzomacar/google-maps-reviews',
        inputSchema: {
            type: 'object',
            properties: {
                placeUrls: { type: 'array', items: { type: 'string' }, description: 'Google Maps place URLs' },
                maxReviewsPerPlace: { type: 'integer', default: 30 },
                sortBy: { type: 'string', enum: ['relevant', 'newest', 'highest', 'lowest'], default: 'newest' },
            },
        },
    },
    {
        name: 'yelp_search',
        description: 'Search Yelp businesses by category and location via the official Yelp Fusion API. Requires the agent operator to have set yelpApiKey in actor input. Returns rating, address, phone, categories, price level, GPS, transactions supported.',
        actorId: 'renzomacar/yelp-fusion-search',
        inputSchema: {
            type: 'object',
            properties: {
                searches: { type: 'array', items: { type: 'string' }, description: 'Queries formatted as "category in city, state"' },
                maxResultsPerSearch: { type: 'integer', default: 30 },
                includeReviews: { type: 'boolean', default: false, description: 'Include up to 3 reviews per business' },
            },
        },
        passthroughInput: { yelpApiKey: '__YELP_KEY__' },
    },
    {
        name: 'youtube_channel',
        description: 'Scrape YouTube channels and videos. Returns channel metadata (subscribers, total views) and recent videos (title, views, likes, publish date).',
        actorId: 'renzomacar/youtube-scraper',
        inputSchema: {
            type: 'object',
            properties: {
                channelUrls: { type: 'array', items: { type: 'string' }, description: 'YouTube channel URLs (@handle, /channel/, /user/)' },
                videoUrls: { type: 'array', items: { type: 'string' }, description: 'Direct video URLs' },
                maxVideosPerChannel: { type: 'integer', default: 30 },
            },
        },
    },
    {
        name: 'tiktok_profile',
        description: 'Scrape TikTok creator profiles and their videos. Returns followers, likes, video stats (views, likes, comments, shares), hashtags, music.',
        actorId: 'renzomacar/tiktok-scraper',
        inputSchema: {
            type: 'object',
            properties: {
                profileUrls: { type: 'array', items: { type: 'string' }, description: 'TikTok profile URLs or @usernames' },
                hashtags: { type: 'array', items: { type: 'string' }, description: 'Hashtags to discover trending videos' },
                maxPostsPerProfile: { type: 'integer', default: 20 },
            },
        },
    },
    {
        name: 'indeed_jobs',
        description: 'Scrape Indeed job listings. Returns titles, companies, locations, salaries, descriptions, posting dates. Supports US/UK/CA/AU/DE/FR/IN.',
        actorId: 'renzomacar/indeed-jobs',
        inputSchema: {
            type: 'object',
            properties: {
                searchQueries: { type: 'array', items: { type: 'string' }, description: 'Job search queries' },
                country: { type: 'string', default: 'us' },
                maxResultsPerQuery: { type: 'integer', default: 50 },
            },
        },
    },
    {
        name: 'trustpilot_reviews',
        description: 'Scrape Trustpilot company reviews. Returns ratings, review titles, full text, reviewer names, dates, verified status, company responses.',
        actorId: 'renzomacar/trustpilot-reviews',
        inputSchema: {
            type: 'object',
            properties: {
                companyUrls: { type: 'array', items: { type: 'string' }, description: 'Trustpilot company URLs or bare domains' },
                maxReviewsPerCompany: { type: 'integer', default: 50 },
                sortBy: { type: 'string', enum: ['recency', 'relevance'], default: 'recency' },
            },
        },
    },
    {
        name: 'website_contacts',
        description: 'Crawl any website to extract emails, phone numbers, social media links, and detected technology stack. Great for B2B lead enrichment.',
        actorId: 'renzomacar/website-contact-finder',
        inputSchema: {
            type: 'object',
            properties: {
                domains: { type: 'array', items: { type: 'string' }, description: 'Domains or URLs to crawl' },
                maxPagesPerDomain: { type: 'integer', default: 4 },
                includeGenericEmails: { type: 'boolean', default: true },
            },
        },
    },
    {
        name: 'saas_pricing',
        description: 'Track SaaS pricing pages. Extracts pricing tiers, features, prices, billing periods. Detects changes between runs for competitive monitoring.',
        actorId: 'renzomacar/saas-pricing-tracker',
        inputSchema: {
            type: 'object',
            properties: {
                pricingPageUrls: { type: 'array', items: { type: 'string' }, description: 'Direct pricing page URLs' },
                compareWithPrevious: { type: 'boolean', default: true },
            },
        },
    },
];
