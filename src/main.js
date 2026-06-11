import { Actor } from 'apify';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { TOOLS } from './tools.js';

await Actor.init();

const input = await Actor.getInput();
const yelpApiKey = input?.yelpApiKey || '';

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_API = 'https://api.apify.com/v2';

async function runActor(actorId, payload) {
    const url = `${APIFY_API}/acts/${actorId.replace('/', '~')}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&format=json`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Actor ${actorId} failed (${res.status}): ${text.substring(0, 500)}`);
    }
    return await res.json();
}

function makeServer() {
    const server = new Server(
        { name: 'multi-scraper-mcp', version: '1.1.0' },
        { capabilities: { tools: {}, logging: {} } },
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: TOOLS.map(t => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema,
        })),
    }));

    server.setRequestHandler(CallToolRequestSchema, async (req, extra) => {
        const { name, arguments: args } = req.params;
        const tool = TOOLS.find(t => t.name === name);
        if (!tool) {
            return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
        }

        const payload = { ...args };
        if (tool.passthroughInput) {
            for (const [k, v] of Object.entries(tool.passthroughInput)) {
                if (v === '__YELP_KEY__') {
                    // BYOK: prefer key passed as tool argument, fall back to Actor input.
                    const key = payload[k] || yelpApiKey;
                    if (!key) {
                        return { content: [{ type: 'text', text: 'yelpApiKey is required for yelp_search. Pass it as the "yelpApiKey" tool argument (free key: https://docs.developer.yelp.com/).' }], isError: true };
                    }
                    payload[k] = key;
                }
            }
        }

        // Keepalive: scraper runs can take 1-3 min; without bytes on the wire the
        // standby HTTP gateway drops the connection (~60s first-byte timeout).
        // Stream a logging notification every 10s while the tool runs.
        const keepalive = setInterval(() => {
            extra?.sendNotification?.({
                method: 'notifications/message',
                params: { level: 'info', logger: 'multi-scraper-mcp', data: `Still running ${name}...` },
            }).catch(() => {});
        }, 10000);

        try {
            const items = await runActor(tool.actorId, payload);
            const summary = `Returned ${items.length} item(s) from ${tool.actorId}.\n\n${JSON.stringify(items.slice(0, 5), null, 2)}\n\n${items.length > 5 ? `(+ ${items.length - 5} more)` : ''}`;
            await Actor.charge({ eventName: 'tool-call' }).catch(() => {});
            return { content: [{ type: 'text', text: summary }] };
        } catch (e) {
            return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
        } finally {
            clearInterval(keepalive);
        }
    });

    return server;
}

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.ACTOR_STANDBY_PORT || process.env.PORT || 4321;

// === Streamable HTTP transport (modern MCP clients: Claude Desktop, Cursor, etc.) ===
const httpSessions = new Map();

app.post('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    let transport;

    if (sessionId && httpSessions.has(sessionId)) {
        transport = httpSessions.get(sessionId);
    } else if (!sessionId && req.body?.method === 'initialize') {
        // New session: initialize request
        transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (id) => httpSessions.set(id, transport),
        });
        transport.onclose = () => {
            if (transport.sessionId) httpSessions.delete(transport.sessionId);
        };
        const server = makeServer();
        await server.connect(transport);
    } else {
        return res.status(400).json({
            jsonrpc: '2.0',
            error: { code: -32000, message: 'Bad Request: invalid session' },
            id: null,
        });
    }

    await transport.handleRequest(req, res, req.body);
});

// SSE notifications + DELETE for session termination
app.get('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    if (!sessionId || !httpSessions.has(sessionId)) {
        return res.status(400).send('Invalid or missing session ID');
    }
    const transport = httpSessions.get(sessionId);
    await transport.handleRequest(req, res);
});

app.delete('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    if (!sessionId || !httpSessions.has(sessionId)) {
        return res.status(400).send('Invalid or missing session ID');
    }
    const transport = httpSessions.get(sessionId);
    await transport.handleRequest(req, res);
});

// === Legacy SSE transport (older MCP clients) ===
const sseTransports = new Map();

app.get('/sse', async (req, res) => {
    const transport = new SSEServerTransport('/messages', res);
    sseTransports.set(transport.sessionId, transport);
    res.on('close', () => sseTransports.delete(transport.sessionId));
    const server = makeServer();
    await server.connect(transport);
});

app.post('/messages', async (req, res) => {
    const sessionId = req.query.sessionId;
    const transport = sseTransports.get(sessionId);
    if (!transport) return res.status(404).send('Session not found');
    await transport.handlePostMessage(req, res);
});

// === Smithery well-known server card (no auth required for scanning) ===
app.get('/.well-known/mcp/server-card.json', (req, res) => {
    res.json({
        name: 'multi-scraper-mcp',
        version: '1.1.0',
        description: 'MCP server exposing 12 web scraping tools for AI agents (Reddit, Amazon, eBay, Google Maps, Yelp, YouTube, TikTok, Indeed, Trustpilot, contact finder, SaaS pricing).',
        protocolVersion: '2025-06-18',
        capabilities: { tools: {} },
        tools: TOOLS.map(t => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema,
        })),
    });
});

// === Info / health endpoint ===
app.get('/', (req, res) => {
    res.json({
        name: 'multi-scraper-mcp',
        version: '1.1.0',
        description: 'MCP server exposing 12 web scraping tools for AI agents',
        tools: TOOLS.map(t => t.name),
        toolCount: TOOLS.length,
        endpoints: {
            mcp_streamable_http: '/mcp',
            mcp_sse_legacy: '/sse',
            health: '/',
        },
        protocolVersion: '2025-06-18',
    });
});

app.listen(PORT, () => {
    console.log(`MCP server listening on port ${PORT}`);
    console.log(`Streamable HTTP: POST /mcp`);
    console.log(`SSE legacy: GET /sse`);
    console.log(`Tools available: ${TOOLS.map(t => t.name).join(', ')}`);
});
