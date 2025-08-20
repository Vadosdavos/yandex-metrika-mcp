# Yandex Metrika MCP Server (Node.js)

A Model Context Protocol (MCP) server that provides access to Yandex Metrika analytics data through various tools and functions. This server allows AI assistants and applications to retrieve comprehensive analytics data from Yandex Metrika accounts.

Documentation in Russian is located [here](README_ru.md) / [Здесь](README_ru.md) находиться документация на русском языке.

## Features

- **Account Information**: Get basic account and counter information
- **Traffic Analytics**: Retrieve visits, page views, and user engagement metrics
- **Traffic Sources**: Analyze traffic sources including organic search, direct traffic, and referrals
- **Content Analytics**: Get insights about articles, authors, categories, and topics performance
- **User Demographics**: Access user demographics and device analysis
- **Geographic Data**: Regional traffic analysis and geographical distribution
- **E-commerce Analytics**: Product performance and revenue tracking
- **Conversion Tracking**: Goals conversion rates and funnel analysis
- **Search Performance**: Organic search queries and search engine data
- **Device Analysis**: Mobile vs desktop traffic comparison

## Installation

```bash
  "mcpServers": {
    "yandex-metrika-mcp": {
      "command": "node",
      "args": [
        "{path-to-repo}/build/index.js"
      ],
      "env": {
        "YANDEX_API_KEY": {your_yandex_api_token_here}
      }
    }
  }
```

## Get authorization token

To obtain an authorization token:

1.  [**Create an application**](https://oauth.yandex.ru/client/new), filling in the following fields:
    *   **name** — can be arbitrary;
    *   **service icon** — optional;
    *   **application platforms** — select **web services**;
    *   **redirect URI** — specify `https://oauth.yandex.ru/verification_code`;
    *   **data access** — specify the set of access rights for your application. Available access rights:
        *   `metrika:read` — obtaining statistics, reading parameters of your own and trusted counters, obtaining a list of counters;
        *   `metrika:write` — creating counters, changing parameters of your own and trusted counters, uploading any data;
        *   `metrika:expenses` — uploading expenses to counters;
        *   `metrika:user_params` — uploading user parameters to counters;
        *   `metrika:offline_data` — uploading offline data to counters (data from CRM, offline conversions, calls).

    *Note: `metrika:expenses`, `metrika:user_params`, `metrika:offline_data` access rights are not mandatory if `metrika:write` access is used.*

2.  Click **Create application** and copy its ClientID (click the icon next to the identifier).

3.  Add the copied ClientID to a link of the form:
    `https://oauth.yandex.ru/authorize?response_type=token&client_id=<application_id>`

4.  Follow the link and copy your authorization token from the opened page.

## Available Tools

The server provides 25 different tools for accessing Yandex Metrika data:

### Account & Basic Analytics
- `get_account_info` - Get basic account and counter information from Yandex Metrika
- `get_visits` - Retrieve visit statistics with optional date range filtering (defaults to last 7 days)

### Traffic Sources Analysis
- `sources_summary` - Get comprehensive traffic sources overview and summary report
- `sources_search_phrases` - Retrieve search phrases and browser information from traffic sources
- `get_traffic_sources_types` - Analyze different types of traffic sources (organic, direct, referral)
- `get_search_engines_data` - Get sessions and users data from search engines with optional filters
- `get_new_users_by_source` - Identify which traffic sources are most effective in acquiring new users

### Content Analytics
- `get_content_analytics_sources` - Get sources that drive users to website articles
- `get_content_analytics_categories` - Retrieve overall statistics by content category
- `get_content_analytics_authors` - Get statistics on article authors performance
- `get_content_analytics_topics` - Analyze performance by article topics
- `get_content_analytics_articles` - Get detailed report on article views grouped by article

### User Behavior & Demographics
- `get_user_demographics` - Access user demographics and engagement by device category
- `get_device_analysis` - Analyze user behavior by browser and operating system
- `get_mobile_vs_desktop` - Compare traffic and engagement metrics between mobile and desktop users
- `get_page_depth_analysis` - Get sessions where users viewed more than specified number of pages

### Geographic & Regional Data
- `get_regional_data` - Get sessions and users data for specific regions/cities
- `get_geographical_organic_traffic` - Analyze geographical distribution of organic traffic

### Performance & Conversion
- `get_page_performance` - Get page performance and bounce rate by URL path
- `get_goals_conversion` - Track conversion rates for specified goals
- `get_organic_search_performance` - Analyze organic search performance by search engine and query

### E-commerce Analytics
- `get_ecommerce_performance` - Get e-commerce performance by product category and region

### Browser & Technical Data
- `get_browsers_report` - Get browsers report without accounting for browser version

### Advanced Analytics
- `get_data_by_time` - Get data for specific time periods grouped by day, week, month, quarter, or year
- `get_yandex_direct_experiment` - Get bounce rate for specific Yandex Direct experiments

## Requirements

- Node.js 18+
- Yandex Metrika API access token

## License

MIT
