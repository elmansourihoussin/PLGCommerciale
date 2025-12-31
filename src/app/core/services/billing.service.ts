import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { AuthService } from './auth.service';

export type SubscriptionPlan = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'CANCELLED';

export interface Subscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
}

export type UpdateSubscriptionPayload = Partial<Subscription>;

export interface SubscriptionHistoryEntry {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  action?: string;
  note?: string;
  createdAt?: Date;
}

interface ApiSubscription {
  plan?: string;
  status?: string;
}

interface SubscriptionResponse {
  data?: ApiSubscription;
  subscription?: ApiSubscription;
}

interface ApiHistoryEntry {
  id?: string;
  plan?: string;
  status?: string;
  action?: string;
  note?: string;
  createdAt?: string;
}

interface HistoryResponse {
  data?: ApiHistoryEntry[];
  history?: ApiHistoryEntry[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  constructor(
    private http: HttpClient,
    private configService: AppConfigService,
    private authService: AuthService
  ) {}

  getSubscription(): Promise<Subscription> {
    const url = `${this.configService.apiBaseUrl}/api/billing/subscription`;
    return firstValueFrom(this.http.get<SubscriptionResponse | ApiSubscription>(url, { headers: this.authHeaders() }))
      .then((response) => this.normalizeSubscription(response));
  }

  updateSubscription(payload: UpdateSubscriptionPayload): Promise<Subscription> {
    const url = `${this.configService.apiBaseUrl}/api/billing/subscription`;
    return firstValueFrom(this.http.patch<SubscriptionResponse | ApiSubscription>(url, payload, { headers: this.authHeaders() }))
      .then((response) => this.normalizeSubscription(response, payload));
  }

  getHistory(params?: { page?: number; limit?: number }): Promise<{ entries: SubscriptionHistoryEntry[]; meta?: HistoryResponse['meta'] }> {
    const url = new URL(`${this.configService.apiBaseUrl}/api/billing/history`);
    if (params?.page) url.searchParams.set('page', String(params.page));
    if (params?.limit) url.searchParams.set('limit', String(params.limit));
    return firstValueFrom(this.http.get<HistoryResponse | ApiHistoryEntry[]>(url.toString(), { headers: this.authHeaders() }))
      .then((response) => this.normalizeHistory(response));
  }

  private normalizeSubscription(
    response: SubscriptionResponse | ApiSubscription,
    fallback?: UpdateSubscriptionPayload
  ): Subscription {
    const subscription = this.extractSubscription(response);
    const plan = this.normalizePlan(subscription.plan ?? fallback?.plan);
    const status = this.normalizeStatus(subscription.status ?? fallback?.status);
    return {
      plan,
      status
    };
  }

  private extractSubscription(response: SubscriptionResponse | ApiSubscription): ApiSubscription {
    if (this.isSubscriptionResponse(response)) {
      return response.data ?? response.subscription ?? {};
    }
    return response;
  }

  private isSubscriptionResponse(response: SubscriptionResponse | ApiSubscription): response is SubscriptionResponse {
    return 'data' in response || 'subscription' in response;
  }

  private normalizePlan(value?: string): SubscriptionPlan {
    const plan = (value ?? 'FREE').toUpperCase();
    if (plan === 'STARTER') return 'STARTER';
    if (plan === 'PRO') return 'PRO';
    if (plan === 'ENTERPRISE') return 'ENTERPRISE';
    return 'FREE';
  }

  private normalizeStatus(value?: string): SubscriptionStatus {
    const status = (value ?? 'INACTIVE').toUpperCase();
    if (status === 'ACTIVE') return 'ACTIVE';
    if (status === 'CANCELLED') return 'CANCELLED';
    return 'INACTIVE';
  }

  private normalizeHistory(response: HistoryResponse | ApiHistoryEntry[]): { entries: SubscriptionHistoryEntry[]; meta?: HistoryResponse['meta'] } {
    const list = Array.isArray(response) ? response : response.data ?? response.history ?? [];
    const entries = list.map((entry) => ({
      id: entry.id ?? '',
      plan: this.normalizePlan(entry.plan),
      status: this.normalizeStatus(entry.status),
      action: entry.action,
      note: entry.note,
      createdAt: entry.createdAt ? new Date(entry.createdAt) : undefined
    }));
    const meta = !Array.isArray(response) ? response.meta : undefined;
    return { entries, meta };
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.accessToken();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
