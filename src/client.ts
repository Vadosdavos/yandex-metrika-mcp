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
    if (!token) {
      throw new Error('Yandex Metrika token is required');
    }

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
}
