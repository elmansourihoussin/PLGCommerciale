import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { AuthService } from './auth.service';
import { Article } from '../models/article.model';

export interface CreateArticlePayload {
  name: string;
  sku?: string;
  unitPrice: number;
  taxRate?: number;
  stockQty?: number;
  unit?: string;
  isService: boolean;
}

export type UpdateArticlePayload = Partial<CreateArticlePayload>;

interface ApiArticle {
  id?: string;
  name?: string;
  sku?: string;
  unitPrice?: number;
  taxRate?: number;
  stockQty?: number;
  unit?: string;
  isService?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ArticleResponse {
  data?: ApiArticle;
  article?: ApiArticle;
}

interface ArticlesListResponse {
  data?: ApiArticle[];
  articles?: ApiArticle[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private articlesSignal = signal<Article[]>([]);
  articles = this.articlesSignal.asReadonly();
  private totalCountSignal = signal<number | null>(null);
  totalCount = this.totalCountSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private configService: AppConfigService,
    private authService: AuthService
  ) {}

  list(params?: { page?: number; limit?: number; search?: string }): Promise<Article[]> {
    const url = new URL(`${this.configService.apiBaseUrl}/api/articles`);
    if (params?.page) url.searchParams.set('page', String(params.page));
    if (params?.limit) url.searchParams.set('limit', String(params.limit));
    if (params?.search) url.searchParams.set('search', params.search);
    return firstValueFrom(this.http.get<ArticlesListResponse | ApiArticle[]>(url.toString(), { headers: this.authHeaders() }))
      .then((response) => {
        const { articles, total } = this.normalizeList(response);
        this.articlesSignal.set(articles);
        if (typeof total === 'number') {
          this.totalCountSignal.set(total);
        }
        return articles;
      });
  }

  getById(id: string): Promise<Article> {
    const url = `${this.configService.apiBaseUrl}/api/articles/${encodeURIComponent(id)}`;
    return firstValueFrom(this.http.get<ArticleResponse | ApiArticle>(url, { headers: this.authHeaders() }))
      .then((response) => this.normalizeArticle(response));
  }

  create(payload: CreateArticlePayload): Promise<Article> {
    const url = `${this.configService.apiBaseUrl}/api/articles`;
    return firstValueFrom(this.http.post<ArticleResponse | ApiArticle>(url, payload, { headers: this.authHeaders() }))
      .then((response) => this.normalizeArticle(response, payload));
  }

  update(id: string, payload: UpdateArticlePayload): Promise<Article> {
    const url = `${this.configService.apiBaseUrl}/api/articles/${encodeURIComponent(id)}`;
    return firstValueFrom(this.http.patch<ArticleResponse | ApiArticle>(url, payload, { headers: this.authHeaders() }))
      .then((response) => this.normalizeArticle(response));
  }

  delete(id: string): Promise<void> {
    const url = `${this.configService.apiBaseUrl}/api/articles/${encodeURIComponent(id)}`;
    return firstValueFrom(this.http.delete<void>(url, { headers: this.authHeaders() }))
      .then(() => undefined);
  }

  private normalizeList(response: ArticlesListResponse | ApiArticle[]): { articles: Article[]; total?: number } {
    const list = Array.isArray(response) ? response : response.data ?? response.articles ?? [];
    const articles = list.map((article) => this.normalizeArticle(article));
    const total = !Array.isArray(response) ? response.meta?.total : undefined;
    return { articles, total };
  }

  private normalizeArticle(response: ArticleResponse | ApiArticle, fallback?: CreateArticlePayload): Article {
    const article = this.extractArticle(response);
    return {
      id: article.id ?? '',
      name: article.name ?? fallback?.name ?? '',
      sku: article.sku ?? fallback?.sku,
      unitPrice: article.unitPrice ?? fallback?.unitPrice ?? 0,
      taxRate: article.taxRate ?? fallback?.taxRate,
      stockQty: article.stockQty ?? fallback?.stockQty,
      unit: article.unit ?? fallback?.unit,
      isService: article.isService ?? fallback?.isService ?? false,
      createdAt: article.createdAt ? new Date(article.createdAt) : undefined,
      updatedAt: article.updatedAt ? new Date(article.updatedAt) : undefined
    };
  }

  private extractArticle(response: ArticleResponse | ApiArticle): ApiArticle {
    if (this.isArticleResponse(response)) {
      return response.data ?? response.article ?? {};
    }
    return response;
  }

  private isArticleResponse(response: ArticleResponse | ApiArticle): response is ArticleResponse {
    return 'data' in response || 'article' in response;
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.accessToken();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
