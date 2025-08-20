import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { YandexMetrikaClient } from './client.js';
import { withErrorHandling } from "./lib/index.js";

const token = process.env.YANDEX_API_KEY;

if (!token) {
  console.error('❌ Error: Missing Yandex Metrika token (OK for local build).');
  process.exit(1);
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
  withErrorHandling(async ({ counter_id }) => {
    const accountInfo = await client.getAccountInfo(counter_id);
    return {
      content: [
        {
          type: 'text',
          text: `Account info: ${JSON.stringify(accountInfo)}`,
        },
      ],
    };
  })
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
  withErrorHandling(async ({ counter_id, date_from, date_to }) => {
    const visits = await client.getVisits(counter_id, date_from, date_to);
    return {
      content: [{ type: 'text', text: `Visits: ${JSON.stringify(visits)}` }],
    };
  })
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
  withErrorHandling(async ({ counter_id }) => {
    const sourcesSummary = await client.getSourcesSummary(counter_id);
    return {
      content: [
        {
          type: 'text',
          text: `Sources Summary: ${JSON.stringify(sourcesSummary)}`,
        },
      ],
    };
  })
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
  withErrorHandling(async ({ counter_id }) => {
    const searchPhrases = await client.getSourcesSearchPhrases(counter_id);
    return {
      content: [
        {
          type: 'text',
          text: `Search Phrases: ${JSON.stringify(searchPhrases)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_browsers_report',
  {
    title: 'Get Browsers Report',
    description: 'Get browsers report from Yandex Metrika without accounting for browser version.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
    },
  },
  withErrorHandling(async ({ counter_id }) => {
    const browsersReport = await client.getBrowsersReport(counter_id);
    return {
      content: [
        {
          type: 'text',
          text: `Browsers Report: ${JSON.stringify(browsersReport)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_content_analytics_sources',
  {
    title: 'Get Content Analytics Sources',
    description: 'Get content analytics sources report from Yandex Metrika. Shows sources from which users were taken to website articles.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      date_from: z.string().optional().describe('Start date of the sample period (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date of the sample period (YYYY-MM-DD)'),
    },
  },
  withErrorHandling(async ({ counter_id, date_from, date_to }) => {
    const contentSources = await client.getContentAnalyticsSources(counter_id, date_from, date_to);
    return {
      content: [
        {
          type: 'text',
          text: `Content Analytics Sources: ${JSON.stringify(contentSources)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_content_analytics_categories',
  {
    title: 'Get Content Analytics Categories',
    description: 'Get content analytics categories report from Yandex Metrika. Shows overall statistics by category.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      date_from: z.string().optional().describe('Start date of the sample period (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date of the sample period (YYYY-MM-DD)'),
    },
  },
  withErrorHandling(async ({ counter_id, date_from, date_to }) => {
    const contentCategories = await client.getContentAnalyticsCategories(counter_id, date_from, date_to);
    return {
      content: [
        {
          type: 'text',
          text: `Content Analytics Categories: ${JSON.stringify(contentCategories)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_content_analytics_authors',
  {
    title: 'Get Content Analytics Authors',
    description: 'Get content analytics authors report from Yandex Metrika. Shows statistics on the authors of website articles.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      date_from: z.string().optional().describe('Start date of the sample period (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date of the sample period (YYYY-MM-DD)'),
    },
  },
  withErrorHandling(async ({ counter_id, date_from, date_to }) => {
    const contentAuthors = await client.getContentAnalyticsAuthors(counter_id, date_from, date_to);
    return {
      content: [
        {
          type: 'text',
          text: `Content Analytics Authors: ${JSON.stringify(contentAuthors)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_content_analytics_topics',
  {
    title: 'Get Content Analytics Topics',
    description: 'Get content analytics topics report from Yandex Metrika. Shows statistics on the topics of website articles.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      date_from: z.string().optional().describe('Start date of the sample period (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date of the sample period (YYYY-MM-DD)'),
    },
  },
  withErrorHandling(async ({ counter_id, date_from, date_to }) => {
    const contentTopics = await client.getContentAnalyticsTopics(counter_id, date_from, date_to);
    return {
      content: [
        {
          type: 'text',
          text: `Content Analytics Topics: ${JSON.stringify(contentTopics)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_traffic_sources_types',
  {
    title: 'Get Traffic Sources Types',
    description: 'Get data on different types of traffic sources (organic, direct, referral).',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
    },
  },
  withErrorHandling(async ({ counter_id }) => {
    const trafficSourcesTypes = await client.getTrafficSourcesTypes(counter_id);
    return {
      content: [
        {
          type: 'text',
          text: `Traffic Sources Types: ${JSON.stringify(trafficSourcesTypes)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_search_engines_data',
  {
    title: 'Get Search Engines Data',
    description: 'Get number of sessions and users from search engines with optional filters.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      exclude_robots: z.boolean().optional().describe('Exclude robot traffic for more accurate data'),
      new_users_only: z.boolean().optional().describe('Get only new users data'),
    },
  },
  withErrorHandling(async ({ counter_id, exclude_robots = false, new_users_only = false }) => {
    const searchEnginesData = await client.getSearchEnginesData(counter_id, exclude_robots, new_users_only);
    return {
      content: [
        {
          type: 'text',
          text: `Search Engines Data: ${JSON.stringify(searchEnginesData)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_regional_data',
  {
    title: 'Get Regional Data',
    description: 'Get number of sessions and users for specific regions.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      cities: z.array(z.string()).optional().describe('Array of city names to filter by'),
    },
  },
  withErrorHandling(async ({ counter_id, cities = ['Москва', 'Санкт-Петербург'] }) => {
    const regionalData = await client.getRegionalData(counter_id, cities);
    return {
      content: [
        {
          type: 'text',
          text: `Regional Data: ${JSON.stringify(regionalData)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_page_depth_analysis',
  {
    title: 'Get Page Depth Analysis',
    description: 'Get number of sessions where users viewed more than specified number of pages.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      min_pages: z.number().optional().describe('Minimum number of pages viewed'),
    },
  },
  withErrorHandling(async ({ counter_id, min_pages = 5 }) => {
    const pageDepthAnalysis = await client.getPageDepthAnalysis(counter_id, min_pages);
    return {
      content: [
        {
          type: 'text',
          text: `Page Depth Analysis: ${JSON.stringify(pageDepthAnalysis)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_goals_conversion',
  {
    title: 'Get Goals Conversion',
    description: 'Get number of users and conversion rates for specified goals.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      goal_ids: z.array(z.number()).describe('Array of goal IDs to track'),
    },
  },
  withErrorHandling(async ({ counter_id, goal_ids }) => {
    const goalsConversion = await client.getGoalsConversion(counter_id, goal_ids);
    return {
      content: [
        {
          type: 'text',
          text: `Goals Conversion: ${JSON.stringify(goalsConversion)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_user_demographics',
  {
    title: 'Get User Demographics',
    description: 'Get user demographics and engagement by device category.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      date_from: z.string().optional().describe('Start date of the report period (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date of the report period (YYYY-MM-DD)'),
    },
  },
  withErrorHandling(async ({ counter_id, date_from, date_to }) => {
    const userDemographics = await client.getUserDemographics(counter_id, date_from, date_to);
    return {
      content: [
        {
          type: 'text',
          text: `User Demographics: ${JSON.stringify(userDemographics)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_device_analysis',
  {
    title: 'Get Device Analysis',
    description: 'Get user behavior by browser and operating system.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      date_from: z.string().optional().describe('Start date of the report period (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date of the report period (YYYY-MM-DD)'),
    },
  },
  withErrorHandling(async ({ counter_id, date_from, date_to }) => {
    const deviceAnalysis = await client.getDeviceAnalysis(counter_id, date_from, date_to);
    return {
      content: [
        {
          type: 'text',
          text: `Device Analysis: ${JSON.stringify(deviceAnalysis)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_page_performance',
  {
    title: 'Get Page Performance',
    description: 'Get page performance and bounce rate by URL path.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      date_from: z.string().optional().describe('Start date of the report period (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date of the report period (YYYY-MM-DD)'),
    },
  },
  withErrorHandling(async ({ counter_id, date_from, date_to }) => {
    const pagePerformance = await client.getPagePerformance(counter_id, date_from, date_to);
    return {
      content: [
        {
          type: 'text',
          text: `Page Performance: ${JSON.stringify(pagePerformance)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_organic_search_performance',
  {
    title: 'Get Organic Search Performance',
    description: 'Get organic search performance by search engine and query.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      date_from: z.string().optional().describe('Start date of the report period (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date of the report period (YYYY-MM-DD)'),
    },
  },
  withErrorHandling(async ({ counter_id, date_from, date_to }) => {
    const organicSearchPerformance = await client.getOrganicSearchPerformance(counter_id, date_from, date_to);
    return {
      content: [
        {
          type: 'text',
          text: `Organic Search Performance: ${JSON.stringify(organicSearchPerformance)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_new_users_by_source',
  {
    title: 'Get New Users by Source',
    description: 'Get which traffic sources are most effective in acquiring new users.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      date_from: z.string().optional().describe('Start date of the report period (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date of the report period (YYYY-MM-DD)'),
    },
  },
  withErrorHandling(async ({ counter_id, date_from, date_to }) => {
    const newUsersBySource = await client.getNewUsersBySource(counter_id, date_from, date_to);
    return {
      content: [
        {
          type: 'text',
          text: `New Users by Source: ${JSON.stringify(newUsersBySource)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_mobile_vs_desktop',
  {
    title: 'Get Mobile vs Desktop',
    description: 'Compare traffic and engagement metrics between mobile and desktop users.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      date_from: z.string().optional().describe('Start date of the report period (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date of the report period (YYYY-MM-DD)'),
    },
  },
  withErrorHandling(async ({ counter_id, date_from, date_to }) => {
    const mobileVsDesktop = await client.getMobileVsDesktop(counter_id, date_from, date_to);
    return {
      content: [
        {
          type: 'text',
          text: `Mobile vs Desktop: ${JSON.stringify(mobileVsDesktop)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_geographical_organic_traffic',
  {
    title: 'Get Geographical Organic Traffic',
    description: 'Analyze the geographical distribution of organic traffic.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      date_from: z.string().optional().describe('Start date of the report period (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date of the report period (YYYY-MM-DD)'),
    },
  },
  withErrorHandling(async ({ counter_id, date_from, date_to }) => {
    const geographicalOrganicTraffic = await client.getGeographicalOrganicTraffic(counter_id, date_from, date_to);
    return {
      content: [
        {
          type: 'text',
          text: `Geographical Organic Traffic: ${JSON.stringify(geographicalOrganicTraffic)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_yandex_direct_experiment',
  {
    title: 'Get Yandex Direct Experiment',
    description: 'Get bounce rate for a specific Yandex Direct experiment.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      experiment_id: z.number().describe('Experiment ID'),
    },
  },
  withErrorHandling(async ({ counter_id, experiment_id }) => {
    const experimentData = await client.getYandexDirectExperiment(counter_id, experiment_id);
    return {
      content: [
        {
          type: 'text',
          text: `Yandex Direct Experiment: ${JSON.stringify(experimentData)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_content_analytics_articles',
  {
    title: 'Get Content Analytics Articles',
    description: 'Get report on the number of article views on the website, grouped by article.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      date_from: z.string().optional().describe('Start date of the sample period (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date of the sample period (YYYY-MM-DD)'),
    },
  },
  withErrorHandling(async ({ counter_id, date_from, date_to }) => {
    const articlesData = await client.getContentAnalyticsArticles(counter_id, date_from, date_to);
    return {
      content: [
        {
          type: 'text',
          text: `Content Analytics Articles: ${JSON.stringify(articlesData)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_data_by_time',
  {
    title: 'Get Data by Time',
    description: 'Get data for a specific period of time, grouped by time (day, week, month, quarter, year).',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      metrics: z.array(z.string()).describe('Comma-separated list of metrics (max 20)'),
      date_from: z.string().optional().describe('Start date of the sample period (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date of the sample period (YYYY-MM-DD)'),
      dimensions: z.array(z.string()).optional().describe('Comma-separated list of dimensions (max 10)'),
      group: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional().describe('Grouping of data by time'),
      top_keys: z.number().optional().describe('Number of top keys to return (max 30)'),
      timezone: z.string().optional().describe('Time zone in ±hh:mm format'),
    },
  },
  withErrorHandling(async ({ 
    counter_id, 
    metrics, 
    date_from, 
    date_to, 
    dimensions, 
    group = 'day', 
    top_keys = 7, 
    timezone 
  }) => {
    const timeData = await client.getDataByTime(
      counter_id, 
      metrics, 
      date_from, 
      date_to, 
      dimensions, 
      group, 
      top_keys, 
      timezone
    );
    return {
      content: [
        {
          type: 'text',
          text: `Data by Time: ${JSON.stringify(timeData)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_ecommerce_performance',
  {
    title: 'Get E-commerce Performance',
    description: 'Get e-commerce performance by product category and region. Provides insights into product performance (purchases, revenue) broken down by product category and geographical region.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      currency: z.string().optional().describe('Currency code (e.g., RUB, USD)'),
      date_from: z.string().optional().describe('Start date of the report period (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date of the report period (YYYY-MM-DD)'),
    },
  },
  withErrorHandling(async ({ counter_id, currency = 'RUB', date_from, date_to }) => {
    const ecommerceData = await client.getEcommercePerformance(counter_id, currency, date_from, date_to);
    return {
      content: [
        {
          type: 'text',
          text: `E-commerce Performance: ${JSON.stringify(ecommerceData)}`,
        },
      ],
    };
  })
);

server.registerTool(
  'get_conversion_rate_by_source_and_landing',
  {
    title: 'Get Conversion Rate by Source and Landing Page',
    description: 'Get conversion rate analysis by traffic source and landing page. Helps understand which traffic sources drive the most conversions to specific landing pages.',
    inputSchema: {
      counter_id: z.string().describe('Yandex Metrika counter ID'),
      goal_id: z.number().describe('The ID of the goal to track conversions for'),
      date_from: z.string().optional().describe('Start date of the report period (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date of the report period (YYYY-MM-DD)'),
    },
  },
  withErrorHandling(async ({ counter_id, goal_id, date_from, date_to }) => {
    const conversionData = await client.getConversionRateBySourceAndLanding(counter_id, goal_id, date_from, date_to);
    return {
      content: [
        {
          type: 'text',
          text: `Conversion Rate by Source and Landing: ${JSON.stringify(conversionData)}`,
        },
      ],
    };
  })
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCPServer started on stdin/stdout');
}

main().catch((error) => {
  console.error('Fatal error: ', error);
  process.exit(1);
});
