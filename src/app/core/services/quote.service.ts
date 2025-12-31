import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Quote, QuoteLine } from '../models/quote.model';
import { AppConfigService } from '../config/app-config.service';
import { AuthService } from './auth.service';

export interface CreateQuotePayload {
  clientId: string;
  title: string;
  note?: string;
  date: string;
  validUntil: string;
  status?: Quote['status'];
  items: Array<{ label: string; quantity: number; unitPrice: number; taxRate?: number; articleId?: string }>;
}

export type UpdateQuotePayload = Partial<CreateQuotePayload>;

interface ApiQuote {
  id?: string;
  number?: string;
  client?: {
    id?: string;
    name?: string;
  };
  clientId?: string;
  clientName?: string;
  title?: string;
  date?: string;
  validUntil?: string;
  items?: Array<{ label: string; quantity: number; unitPrice: number; taxRate?: number; articleId?: string }>;
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  status?: Quote['status'];
  note?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface QuoteResponse {
  data?: ApiQuote;
  quote?: ApiQuote;
}

interface QuotesListResponse {
  data?: ApiQuote[];
  quotes?: ApiQuote[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private quotesSignal = signal<Quote[]>([]);
  quotes = this.quotesSignal.asReadonly();
  private totalCountSignal = signal<number | null>(null);
  totalCount = this.totalCountSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private configService: AppConfigService,
    private authService: AuthService
  ) {}

  list(params?: { page?: number; limit?: number; search?: string; status?: string; clientId?: string }): Promise<Quote[]> {
    const url = new URL(`${this.configService.apiBaseUrl}/api/quotes`);
    if (params?.page) url.searchParams.set('page', String(params.page));
    if (params?.limit) url.searchParams.set('limit', String(params.limit));
    if (params?.search) url.searchParams.set('search', params.search);
    if (params?.status) url.searchParams.set('status', params.status);
    if (params?.clientId) url.searchParams.set('clientId', params.clientId);
    return firstValueFrom(this.http.get<QuotesListResponse | ApiQuote[]>(url.toString(), { headers: this.authHeaders() }))
      .then((response) => {
        const { quotes, total } = this.normalizeList(response);
        this.quotesSignal.set(quotes);
        if (typeof total === 'number') {
          this.totalCountSignal.set(total);
        }
        return quotes;
      });
  }

  getNextNumber(): Promise<string> {
    const url = `${this.configService.apiBaseUrl}/api/quotes/next-number`;
    return firstValueFrom(this.http.get<{ data?: string; number?: string }>(url, { headers: this.authHeaders() }))
      .then((response) => response.data ?? response.number ?? '');
  }

  getById(id: string): Promise<Quote> {
    const url = `${this.configService.apiBaseUrl}/api/quotes/${encodeURIComponent(id)}`;
    return firstValueFrom(this.http.get<QuoteResponse | ApiQuote>(url, { headers: this.authHeaders() }))
      .then((response) => {
        const quote = this.normalizeQuote(response);
        this.upsertQuote(quote);
        return quote;
      });
  }

  create(payload: CreateQuotePayload): Promise<Quote> {
    const url = `${this.configService.apiBaseUrl}/api/quotes`;
    return firstValueFrom(this.http.post<QuoteResponse | ApiQuote>(url, payload, { headers: this.authHeaders() }))
      .then((response) => {
        const created = this.normalizeQuote(response, payload);
        this.upsertQuote(created);
        return created;
      });
  }

  update(id: string, payload: UpdateQuotePayload): Promise<Quote> {
    const url = `${this.configService.apiBaseUrl}/api/quotes/${encodeURIComponent(id)}`;
    return firstValueFrom(this.http.patch<QuoteResponse | ApiQuote>(url, payload, { headers: this.authHeaders() }))
      .then((response) => {
        const current = this.quotesSignal().find(q => q.id === id);
        const updated = this.normalizeQuote(response, current ? this.toPayload(current) : undefined);
        this.upsertQuote(updated);
        return updated;
      });
  }

  delete(id: string): Promise<void> {
    const url = `${this.configService.apiBaseUrl}/api/quotes/${encodeURIComponent(id)}`;
    return firstValueFrom(this.http.delete<void>(url, { headers: this.authHeaders() }))
      .then(() => {
        this.quotesSignal.update(quotes => quotes.filter(q => q.id !== id));
      });
  }

  private normalizeQuote(response: QuoteResponse | ApiQuote, fallback?: CreateQuotePayload): Quote {
    const quote = this.extractQuote(response);
    const items = quote.items ?? fallback?.items ?? [];
    const lines: QuoteLine[] = items.map((item, index) => ({
      id: String(index + 1),
      description: item.label,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
      taxRate: item.taxRate === undefined ? undefined : (item.taxRate <= 1 ? item.taxRate * 100 : item.taxRate),
      articleId: item.articleId
    }));
    const subtotal = quote.subtotal ?? lines.reduce((sum, line) => sum + line.total, 0);
    const taxAmount = quote.taxAmount ?? lines.reduce((sum, line) => {
      const lineRate = line.taxRate ?? 0;
      return sum + (line.total * (lineRate / 100));
    }, 0);
    const total = quote.total ?? subtotal + taxAmount;
    return {
      id: quote.id ?? Date.now().toString(),
      number: quote.number ?? '',
      client: quote.client,
      clientId: quote.clientId ?? fallback?.clientId ?? '',
      clientName: quote.clientName ?? quote.client?.name,
      title: quote.title ?? fallback?.title ?? '',
      date: quote.date ? new Date(quote.date) : new Date(),
      validUntil: quote.validUntil ? new Date(quote.validUntil) : new Date(),
      lines,
      subtotal,
      taxAmount,
      total,
      status: quote.status ?? fallback?.status ?? 'draft',
      notes: quote.note ?? quote.notes ?? fallback?.note,
      createdAt: quote.createdAt ? new Date(quote.createdAt) : new Date(),
      updatedAt: quote.updatedAt ? new Date(quote.updatedAt) : new Date()
    };
  }

  private extractQuote(response: QuoteResponse | ApiQuote): ApiQuote {
    if (this.isQuoteResponse(response)) {
      return response.data ?? response.quote ?? {};
    }
    return response;
  }

  private normalizeList(response: QuotesListResponse | ApiQuote[]): { quotes: Quote[]; total?: number } {
    const list = Array.isArray(response)
      ? response
      : response.data ?? response.quotes ?? [];
    const quotes = list.map((quote) => this.normalizeQuote(quote));
    const total = !Array.isArray(response) ? response.meta?.total : undefined;
    return { quotes, total };
  }

  private upsertQuote(quote: Quote) {
    this.quotesSignal.update((quotes) => {
      const index = quotes.findIndex(q => q.id === quote.id);
      if (index === -1) {
        return [...quotes, quote];
      }
      const updated = [...quotes];
      updated[index] = quote;
      return updated;
    });
  }

  private isQuoteResponse(response: QuoteResponse | ApiQuote): response is QuoteResponse {
    return 'data' in response || 'quote' in response;
  }

  private toPayload(quote: Quote): CreateQuotePayload {
    return {
      clientId: quote.clientId,
      title: quote.title,
      note: quote.notes,
      date: quote.date.toISOString().split('T')[0],
      validUntil: quote.validUntil.toISOString().split('T')[0],
      status: quote.status,
      items: quote.lines.map((line) => ({
        label: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxRate: line.taxRate === undefined ? undefined : line.taxRate / 100
      }))
    };
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.accessToken();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
