import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { YandexMetrikaClient } from './client.js';

const token = process.env.YANDEX_API_KEY;

if (!token) {
  console.error('❌ Error: Missing Yandex Metrika token.');
  process.exit(1);
} else {
  console.log('token', token);
  console.error('✅ Parsed token.');
}

const client = new YandexMetrikaClient(token);

const server = new McpServer({
  name: 'yandex-metrika-mcp-server',
  version: '1.0.0',
  description: 'Server for getting data from Yandex Metrika',
  transports: ['stdio'],
});

server.registerTool(
  'get_account_info',
  {
    title: 'Get account info',
    description: 'Get account info from Yandex Metrika',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
    },
  },
  async ({ counter_id }) => {
    try {
      const accountInfo = await client.getAccountInfo(counter_id);
      return {
        content: [
          {
            type: 'text',
            text: `Account info: ${JSON.stringify(accountInfo)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          { type: 'text', text: `Something went wrong. Error: ${error}` },
        ],
      };
    }
  }
);

server.registerTool(
  'get_visits',
  {
    title: 'Get visits',
    description:
      'Get visits from Yandex Metrika. If date not provided, will return visits for the last 7 days.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      date_from: z.string().optional().describe('Date from'),
      date_to: z.string().optional().describe('Date to'),
    },
  },
  async ({ counter_id, date_from, date_to }) => {
    try {
      const visits = await client.getVisits(counter_id, date_from, date_to);
      return {
        content: [{ type: 'text', text: `Visits: ${JSON.stringify(visits)}` }],
      };
    } catch (error) {
      return {
        content: [
          { type: 'text', text: `Something went wrong. Error: ${error}` },
        ],
      };
    }
  }
);

server.registerTool(
  'sources_summary',
  {
    title: 'Sources Summary',
    description:
      'Get sources summary report from Yandex Metrika. If date not provided, will return data for the last 7 days.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
    },
  },
  async ({ counter_id }) => {
    try {
      const sourcesSummary = await client.getSourcesSummary(counter_id);
      return {
        content: [
          {
            type: 'text',
            text: `Sources Summary: ${JSON.stringify(sourcesSummary)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          { type: 'text', text: `Something went wrong. Error: ${error}` },
        ],
      };
    }
  }
);

server.registerTool(
  'sources_search_phrases',
  {
    title: 'Sources Search Phrases',
    description:
      'Get search phrases report from Yandex Metrika. Returns data about search queries and browser information.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
    },
  },
  async ({ counter_id }) => {
    try {
      const searchPhrases = await client.getSourcesSearchPhrases(counter_id);
      return {
        content: [
          {
            type: 'text',
            text: `Search Phrases: ${JSON.stringify(searchPhrases)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          { type: 'text', text: `Something went wrong. Error: ${error}` },
        ],
      };
    }
  }
);

// Start receiving messages on stdin and sending messages on stdout
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCPServer started on stdin/stdout');
}

main().catch((error) => {
  console.error('Fatal error: ', error);
  process.exit(1);
});
