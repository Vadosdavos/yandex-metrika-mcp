const API_BASE = 'https://api-metrika.yandex.net';
const API_MANAGMENT = 'management/v1';
const API_REPORTS = 'stat/v1/data';

interface ClientConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class YandexMetrikaClient {
  private token: string;
  private config: Required<ClientConfig>;

  constructor(token: string, config: ClientConfig = {}) {
    this.token = token;
    this.config = {
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
    };
  }

  private async makeRequest<T>(url: string, attempt: number = 1): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(url, {
        headers: {
          Authorization: `OAuth ${this.token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Yandex Metrika error ${response.status}: ${errorText}`
        );
      }

      return response.json();
    } catch (error) {
      if (attempt < this.config.retries && this.isRetryableError(error)) {
        await this.delay(this.config.retryDelay * attempt);
        return this.makeRequest<T>(url, attempt + 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    return (
      error.name === 'AbortError' ||
      (error.message && error.message.includes('500')) ||
      (error.message && error.message.includes('502')) ||
      (error.message && error.message.includes('503'))
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getAccountInfo(counterId: string): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    const url = `${API_BASE}/${API_MANAGMENT}/counter/${counterId}`;
    return this.makeRequest(url);
  }

  async getVisits(
    counterId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    // Валидация дат
    if (dateFrom && !this.isValidDate(dateFrom)) {
      throw new Error('dateFrom must be in YYYY-MM-DD format');
    }

    if (dateTo && !this.isValidDate(dateTo)) {
      throw new Error('dateTo must be in YYYY-MM-DD format');
    }

    const url = `${API_BASE}/${API_REPORTS}?ids=${counterId}&metrics=ym:s:visits`;
    // const url = `${API_BASE}/${API_REPORTS}?ids=${counterId}&metrics=ym:s:visits&date1=${dateFrom}&date2=${dateTo}`;
    return this.makeRequest(url);
  }

  private isValidDate(dateString: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  async getSourcesSummary(counterId: string): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    let url = `${API_BASE}/${API_REPORTS}?preset=sources_summary&id=${counterId}`;

    return this.makeRequest(url);
  }

  async getSourcesSearchPhrases(counterId: string): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    const url = `${API_BASE}/${API_REPORTS}?preset=sources_search_phrases&id=${counterId}`;

    return this.makeRequest(url);
  }

  async getBrowsersReport(counterId: string): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    const url = `${API_BASE}/${API_REPORTS}?preset=tech_platforms&dimensions=ym:s:browser&id=${counterId}`;
    return this.makeRequest(url);
  }

  async getContentAnalyticsSources(counterId: string, dateFrom?: string, dateTo?: string): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    let url = `${API_BASE}/${API_REPORTS}?preset=publishers_sources&id=${counterId}`;
    if (dateFrom) url += `&date1=${dateFrom}`;
    if (dateTo) url += `&date2=${dateTo}`;
    
    return this.makeRequest(url);
  }

  async getContentAnalyticsCategories(counterId: string, dateFrom?: string, dateTo?: string): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    let url = `${API_BASE}/${API_REPORTS}?preset=publishers_rubrics&id=${counterId}`;
    if (dateFrom) url += `&date1=${dateFrom}`;
    if (dateTo) url += `&date2=${dateTo}`;
    
    return this.makeRequest(url);
  }

  async getContentAnalyticsAuthors(counterId: string, dateFrom?: string, dateTo?: string): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    let url = `${API_BASE}/${API_REPORTS}?preset=publishers_authors&id=${counterId}`;
    if (dateFrom) url += `&date1=${dateFrom}`;
    if (dateTo) url += `&date2=${dateTo}`;
    
    return this.makeRequest(url);
  }

  async getContentAnalyticsTopics(counterId: string, dateFrom?: string, dateTo?: string): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    let url = `${API_BASE}/${API_REPORTS}?preset=publishers_thematics&id=${counterId}`;
    if (dateFrom) url += `&date1=${dateFrom}`;
    if (dateTo) url += `&date2=${dateTo}`;
    
    return this.makeRequest(url);
  }

  async getTrafficSourcesTypes(counterId: string): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    const url = `${API_BASE}/${API_REPORTS}?dimensions=ym:s:lastTrafficSource&metrics=ym:s:visits,ym:s:users&filters=ym:s:lastTrafficSource=.('organic','direct','referral')&id=${counterId}&lang=ru`;
    return this.makeRequest(url);
  }

  async getSearchEnginesData(counterId: string, excludeRobots: boolean = false, newUsersOnly: boolean = false): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    let filters = 'ym:s:trafficSource==\'organic\'';
    if (excludeRobots) {
      filters += ' AND ym:s:isRobot==\'No\'';
    }
    if (newUsersOnly) {
      filters += ' AND ym:s:isNewUser==\'Yes\'';
    }

    const url = `${API_BASE}/${API_REPORTS}?dimensions=ym:s:searchEngine&metrics=ym:s:visits,ym:s:users&filters=${encodeURIComponent(filters)}&id=${counterId}`;
    return this.makeRequest(url);
  }

  async getRegionalData(counterId: string, cities: string[] = ['Москва', 'Санкт-Петербург']): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    const citiesFilter = cities.map(city => `'${city}'`).join(',');
    const filters = `ym:s:regionCityName=.(${citiesFilter})`;
    
    const url = `${API_BASE}/${API_REPORTS}?metrics=ym:s:visits,ym:s:users&filters=${encodeURIComponent(filters)}&id=${counterId}&lang=ru`;
    return this.makeRequest(url);
  }

  async getPageDepthAnalysis(counterId: string, minPages: number = 5): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    const filters = `ym:s:pageViews>${minPages}`;
    const url = `${API_BASE}/${API_REPORTS}?metrics=ym:s:visits&filters=${encodeURIComponent(filters)}&id=${counterId}`;
    return this.makeRequest(url);
  }

  async getGoalsConversion(counterId: string, goalIds: number[]): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    const metrics = goalIds.map(id => `ym:s:goal${id}conversionRate`).join(',');
    const url = `${API_BASE}/${API_REPORTS}?metrics=ym:s:users,${metrics}&id=${counterId}`;
    return this.makeRequest(url);
  }

  async getUserDemographics(counterId: string, dateFrom?: string, dateTo?: string): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    let url = `${API_BASE}/${API_REPORTS}?dimensions=ym:s:ageInterval,ym:s:gender,ym:s:deviceCategory&metrics=ym:s:visits,ym:s:users,ym:s:pageviews,ym:s:bounceRate,ym:s:avgVisitDurationSeconds&id=${counterId}`;
    if (dateFrom) url += `&date1=${dateFrom}`;
    if (dateTo) url += `&date2=${dateTo}`;
    
    return this.makeRequest(url);
  }

  async getDeviceAnalysis(counterId: string, dateFrom?: string, dateTo?: string): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    let url = `${API_BASE}/${API_REPORTS}?dimensions=ym:s:browser,ym:s:operatingSystem&metrics=ym:s:visits,ym:s:pageviews,ym:s:bounceRate,ym:s:avgVisitDurationSeconds&id=${counterId}`;
    if (dateFrom) url += `&date1=${dateFrom}`;
    if (dateTo) url += `&date2=${dateTo}`;
    
    return this.makeRequest(url);
  }

  async getPagePerformance(counterId: string, dateFrom?: string, dateTo?: string): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    let url = `${API_BASE}/${API_REPORTS}?dimensions=ym:s:URLPath&metrics=ym:s:pageviews,ym:s:bounceRate,ym:s:avgVisitDurationSeconds&id=${counterId}`;
    if (dateFrom) url += `&date1=${dateFrom}`;
    if (dateTo) url += `&date2=${dateTo}`;
    
    return this.makeRequest(url);
  }

  async getOrganicSearchPerformance(counterId: string, dateFrom?: string, dateTo?: string): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    let url = `${API_BASE}/${API_REPORTS}?dimensions=ym:s:searchEngine,ym:s:searchPhrase&metrics=ym:s:visits,ym:s:users,ym:s:pageviews&filters=ym:s:trafficSource==\'organic\'&id=${counterId}`;
    if (dateFrom) url += `&date1=${dateFrom}`;
    if (dateTo) url += `&date2=${dateTo}`;
    
    return this.makeRequest(url);
  }

  async getNewUsersBySource(counterId: string, dateFrom?: string, dateTo?: string): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    let url = `${API_BASE}/${API_REPORTS}?dimensions=ym:s:trafficSource&metrics=ym:s:newUsers&id=${counterId}`;
    if (dateFrom) url += `&date1=${dateFrom}`;
    if (dateTo) url += `&date2=${dateTo}`;
    
    return this.makeRequest(url);
  }

  async getMobileVsDesktop(counterId: string, dateFrom?: string, dateTo?: string): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    let url = `${API_BASE}/${API_REPORTS}?dimensions=ym:s:deviceCategory&metrics=ym:s:visits,ym:s:users,ym:s:pageviews,ym:s:bounceRate,ym:s:avgVisitDurationSeconds&id=${counterId}`;
    if (dateFrom) url += `&date1=${dateFrom}`;
    if (dateTo) url += `&date2=${dateTo}`;
    
    return this.makeRequest(url);
  }

  async getGeographicalOrganicTraffic(counterId: string, dateFrom?: string, dateTo?: string): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    let url = `${API_BASE}/${API_REPORTS}?dimensions=ym:s:regionCountry,ym:s:regionCity&metrics=ym:s:visits,ym:s:users&filters=ym:s:trafficSource==\'organic\'&id=${counterId}`;
    if (dateFrom) url += `&date1=${dateFrom}`;
    if (dateTo) url += `&date2=${dateTo}`;
    
    return this.makeRequest(url);
  }

  async getYandexDirectExperiment(counterId: string, experimentId: number): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    const url = `${API_BASE}/${API_REPORTS}?metrics=ym:s:bounceRate&dimensions=ym:s:experimentAB${experimentId}&id=${counterId}`;
    return this.makeRequest(url);
  }

  async getContentAnalyticsArticles(counterId: string, dateFrom?: string, dateTo?: string): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    let url = `${API_BASE}/${API_REPORTS}?ids=${counterId}&dimensions=ym:s:publisherArticle&metrics=ym:s:publisherviews&filters=(ym:s:publisherArticle!n)&sort=-ym:s:publisherviews`;
    if (dateFrom) url += `&date1=${dateFrom}`;
    if (dateTo) url += `&date2=${dateTo}`;
    
    return this.makeRequest(url);
  }

  async getDataByTime(
    counterId: string,
    metrics: string[],
    dateFrom?: string,
    dateTo?: string,
    dimensions?: string[],
    group: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'day',
    topKeys: number = 7,
    timezone?: string
  ): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    if (!metrics || metrics.length === 0) {
      throw new Error('At least one metric is required');
    }

    if (metrics.length > 20) {
      throw new Error('Maximum 20 metrics allowed per request');
    }

    if (dimensions && dimensions.length > 10) {
      throw new Error('Maximum 10 dimensions allowed per request');
    }

    let url = `${API_BASE}/${API_REPORTS}/bytime?ids=${counterId}&metrics=${metrics.join(',')}&group=${group}&top_keys=${topKeys}`;
    
    if (dateFrom) url += `&date1=${dateFrom}`;
    if (dateTo) url += `&date2=${dateTo}`;
    if (dimensions && dimensions.length > 0) url += `&dimensions=${dimensions.join(',')}`;
    if (timezone) url += `&timezone=${encodeURIComponent(timezone)}`;
    
    return this.makeRequest(url);
  }

  async getEcommercePerformance(
    counterId: string,
    currency: string = 'RUB',
    dateFrom?: string,
    dateTo?: string
  ): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    let url = `${API_BASE}/${API_REPORTS}?dimensions=ym:s:productCategory,ym:s:regionCountry,ym:s:regionCity&metrics=ym:s:ecommercePurchases,ym:s:ecommerce${currency}ConvertedRevenue&id=${counterId}`;
    if (dateFrom) url += `&date1=${dateFrom}`;
    if (dateTo) url += `&date2=${dateTo}`;
    
    return this.makeRequest(url);
  }

  async getConversionRateBySourceAndLanding(
    counterId: string,
    goalId: number,
    dateFrom?: string,
    dateTo?: string
  ): Promise<any> {
    if (!counterId || typeof counterId !== 'string') {
      throw new Error('Counter ID must be a non-empty string');
    }

    let url = `${API_BASE}/${API_REPORTS}?dimensions=ym:s:trafficSource,ym:s:landingPage&metrics=ym:s:visits,ym:s:goal${goalId}conversionRate&id=${counterId}`;
    if (dateFrom) url += `&date1=${dateFrom}`;
    if (dateTo) url += `&date2=${dateTo}`;
    
    return this.makeRequest(url);
  }
}
