import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';

export interface DashboardOverview {
  clientsActive: number;
  quotesTotal: number;
  quotesByStatus: Record<string, number>;
  invoicesTotal: number;
  invoicesByStatus: Record<string, number>;
}

export interface RevenueByMonthEntry {
  month: number;
  total: number;
}

export interface RevenueByMonthResponse {
  year: number;
  data: RevenueByMonthEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private http: HttpClient,
    private configService: AppConfigService
  ) {}

  getOverview(): Promise<DashboardOverview> {
    const url = `${this.configService.apiBaseUrl}/api/dashboard/overview`;
    return firstValueFrom(this.http.get<any>(url))
      .then((response) => {
        const data = response?.data ?? response ?? {};
        return {
          clientsActive: this.toNumber(data.clientsActive ?? data.clients ?? data.clientsCount),
          quotesTotal: this.toNumber(data.quotesTotal ?? data.quotes ?? data.quotesCount),
          quotesByStatus: data.quotesByStatus ?? data.quoteStatusCounts ?? {},
          invoicesTotal: this.toNumber(data.invoicesTotal ?? data.invoices ?? data.invoicesCount),
          invoicesByStatus: data.invoicesByStatus ?? data.invoiceStatusCounts ?? {}
        };
      });
  }

  async getRevenueByMonth(year: number): Promise<RevenueByMonthResponse> {
    const baseUrl = this.configService.apiBaseUrl;
    const primaryUrl = `${baseUrl}/api/dashboard/revenue-by-month?year=${year}`;
    const fallbackUrl = `${baseUrl}/dashboard/revenue-by-month?year=${year}`;
    const response = await firstValueFrom(this.http.get<any>(primaryUrl)).catch(() => {
      return firstValueFrom(this.http.get<any>(fallbackUrl));
    });
    const payload = response?.data ?? response ?? {};
    const dataArray = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];
    const data = dataArray
      .map((entry: any) => ({
        month: this.toNumber(entry?.month ?? entry?.monthNumber ?? entry?.monthIndex),
        total: this.toNumber(
          entry?.total ??
          entry?.amount ??
          entry?.value ??
          entry?.totalAmount ??
          entry?.revenue
        )
      }))
      .filter((entry: RevenueByMonthEntry) => entry.month >= 1 && entry.month <= 12);
    const responseYear = this.toNumber(payload.year);
    return {
      year: responseYear || year,
      data
    };
  }

  private toNumber(value: unknown): number {
    if (typeof value === 'number' && !Number.isNaN(value)) return value;
    if (typeof value === 'string') {
      const normalized = value.replace(/[^0-9.-]+/g, '');
      const parsed = Number(normalized);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }
}
