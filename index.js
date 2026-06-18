#!/usr/bin/env node
// Multi-Scraper MCP server (stdio) — 14 web scrapers as tools for AI agents.
// Runs scrapers on Apify. Usage: APIFY_TOKEN=apify_api_... npx multi-scraper-mcp
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { TOOLS } from './tools.js';

const APIFY_TOKEN = process.env.APIFY_TOKEN || '';
const YELP_KEY = process.env.YELP_API_KEY || '';
const API = 'https://api.apify.com/v2';

if (!APIFY_TOKEN) console.error('⚠️  Set APIFY_TOKEN (free at https://console.apify.com/account/integrations) to run scrapers.');

async function runActor(actorId, payload) {
    const url = `${API}/acts/${actorId.replace('/', '~')}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&format=json`;
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`Actor ${actorId} failed (${res.status}): ${(await res.text()).slice(0, 400)}`);
    return res.json();
}

const server = new Server({ name: 'multi-scraper-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args = {} } = req.params;
    const tool = TOOLS.find((t) => t.name === name);
    if (!tool) return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    if (!APIFY_TOKEN) return { content: [{ type: 'text', text: 'APIFY_TOKEN is not set. Get a free token at https://console.apify.com/account/integrations and set it in your MCP config env.' }], isError: true };
    const payload = { ...args };
    if (tool.passthroughInput) {
        for (const [k, v] of Object.entries(tool.passthroughInput)) {
            if (v === '__YELP_KEY__') {
                const key = payload[k] || YELP_KEY;
                if (!key) return { content: [{ type: 'text', text: 'yelp_search needs a Yelp API key — pass "yelpApiKey" or set YELP_API_KEY. Free key: https://docs.developer.yelp.com/' }], isError: true };
                payload[k] = key;
            }
        }
    }
    try {
        const items = await runActor(tool.actorId, payload);
        const summary = `Returned ${items.length} item(s) from ${tool.actorId}.\n\n${JSON.stringify(items.slice(0, 5), null, 2)}${items.length > 5 ? `\n\n(+ ${items.length - 5} more)` : ''}`;
        return { content: [{ type: 'text', text: summary }] };
    } catch (e) {
        return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
    }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`multi-scraper-mcp running (stdio). ${TOOLS.length} tools.`);
