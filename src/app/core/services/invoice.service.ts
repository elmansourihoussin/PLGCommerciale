import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Invoice, InvoiceLine } from '../models/invoice.model';
import { AppConfigService } from '../config/app-config.service';
import { AuthService } from './auth.service';

export interface CreateInvoicePayload {
  number?: string;
  clientId: string;
  title: string;
  note?: string;
  paymentMethod?: string;
  invoiceDate: string;
  dueDate: string;
  defaultTaxRate?: number;
  status?: Invoice['status'];
  items: Array<{ label: string; quantity: number; unitPrice: number; taxRate?: number; articleId?: string }>;
}

export type UpdateInvoicePayload = Partial<CreateInvoicePayload>;

export interface PaymentCreatePayload {
  amount: number;
  method?: string;
  paidAt?: string;
  reference?: string;
  note?: string;
}

export interface InvoicePayment {
  id: string;
  amount: number;
  method?: string;
  paidAt: Date;
  reference?: string;
  note?: string;
  createdAt?: Date;
}

interface ApiInvoice {
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
  invoiceDate?: string;
  dueDate?: string;
  items?: Array<{ label: string; quantity: number; unitPrice: number; taxRate?: number; articleId?: string }>;
  subtotal?: number;
  taxRate?: number;
  defaultTaxRate?: number;
  taxAmount?: number;
  total?: number;
  paidAmount?: number;
  status?: Invoice['status'];
  paymentMethod?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface InvoiceResponse {
  data?: ApiInvoice;
  invoice?: ApiInvoice;
}

interface InvoicesListResponse {
  data?: ApiInvoice[];
  invoices?: ApiInvoice[];
  meta?: {
    total?: number;
    totalInvoicesAmount?: number;
    totalPaidAmount?: number;
    page?: number;
    limit?: number;
  };
}

interface PaymentsListResponse {
  data?: ApiPayment[];
  payments?: ApiPayment[];
}

interface PaymentResponse {
  data?: ApiPayment;
  payment?: ApiPayment;
}

interface ApiPayment {
  id?: string;
  amount?: number;
  method?: string;
  paidAt?: string;
  reference?: string;
  note?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private invoicesSignal = signal<Invoice[]>([]);
  invoices = this.invoicesSignal.asReadonly();
  private totalCountSignal = signal<number | null>(null);
  totalCount = this.totalCountSignal.asReadonly();
  private totalInvoicesAmountSignal = signal<number | null>(null);
  totalInvoicesAmount = this.totalInvoicesAmountSignal.asReadonly();
  private totalPaidAmountSignal = signal<number | null>(null);
  totalPaidAmount = this.totalPaidAmountSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private configService: AppConfigService,
    private authService: AuthService
  ) {
  }

  list(params?: { page?: number; limit?: number; search?: string; status?: string; clientId?: string }): Promise<Invoice[]> {
    const url = new URL(`${this.configService.apiBaseUrl}/api/invoices`);
    if (params?.page) url.searchParams.set('page', String(params.page));
    if (params?.limit) url.searchParams.set('limit', String(params.limit));
    if (params?.search) url.searchParams.set('search', params.search);
    if (params?.status) url.searchParams.set('status', params.status);
    if (params?.clientId) url.searchParams.set('clientId', params.clientId);
    return firstValueFrom(this.http.get<InvoicesListResponse | ApiInvoice[]>(url.toString(), { headers: this.authHeaders() }))
      .then((response) => {
        const { invoices, total, totalInvoicesAmount, totalPaidAmount } = this.normalizeList(response);
        this.invoicesSignal.set(invoices);
        if (typeof total === 'number') {
          this.totalCountSignal.set(total);
        }
        if (typeof totalInvoicesAmount === 'number') {
          this.totalInvoicesAmountSignal.set(totalInvoicesAmount);
        }
        if (typeof totalPaidAmount === 'number') {
          this.totalPaidAmountSignal.set(totalPaidAmount);
        }
        return invoices;
      });
  }

  getById(id: string): Promise<Invoice> {
    const url = `${this.configService.apiBaseUrl}/api/invoices/${encodeURIComponent(id)}`;
    return firstValueFrom(this.http.get<InvoiceResponse | ApiInvoice>(url, { headers: this.authHeaders() }))
      .then((response) => {
        const invoice = this.normalizeInvoice(response);
        this.upsertInvoice(invoice);
        return invoice;
      });
  }

  create(invoice: CreateInvoicePayload): Promise<Invoice> {
    const url = `${this.configService.apiBaseUrl}/api/invoices`;
    return firstValueFrom(this.http.post<InvoiceResponse | ApiInvoice>(url, invoice, { headers: this.authHeaders() }))
      .then((response) => {
        const created = this.normalizeInvoice(response, invoice);
        this.upsertInvoice(created);
        return created;
      });
  }

  update(id: string, updates: UpdateInvoicePayload): Promise<Invoice> {
    const url = `${this.configService.apiBaseUrl}/api/invoices/${encodeURIComponent(id)}`;
    return firstValueFrom(this.http.patch<InvoiceResponse | ApiInvoice>(url, updates, { headers: this.authHeaders() }))
      .then((response) => {
        const current = this.invoicesSignal().find(i => i.id === id);
        const updated = this.normalizeInvoice(response, {
          clientId: current?.clientId ?? '',
          title: current?.title ?? '',
          note: current?.notes,
          paymentMethod: current?.paymentMethod,
          invoiceDate: current?.date?.toISOString() ?? new Date().toISOString(),
          dueDate: current?.dueDate?.toISOString() ?? new Date().toISOString(),
          defaultTaxRate: current?.defaultTaxRate,
          items: (current?.lines ?? []).map((line) => ({
            label: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRate: line.taxRate
          }))
        });
        this.upsertInvoice(updated);
        return updated;
      });
  }

  delete(id: string): Promise<void> {
    const url = `${this.configService.apiBaseUrl}/api/invoices/${encodeURIComponent(id)}`;
    return firstValueFrom(this.http.delete<void>(url, { headers: this.authHeaders() }))
      .then(() => {
        this.invoicesSignal.update(invoices => invoices.filter(i => i.id !== id));
      });
  }

  getNextNumber(): Promise<string> {
    const url = `${this.configService.apiBaseUrl}/api/invoices/next-number`;
    return firstValueFrom(this.http.get<{ data?: string; number?: string }>(url, { headers: this.authHeaders() }))
      .then((response) => response.data ?? response.number ?? '');
  }

  getPayments(invoiceId: string): Promise<InvoicePayment[]> {
    const url = `${this.configService.apiBaseUrl}/api/invoices/${encodeURIComponent(invoiceId)}/payments`;
    return firstValueFrom(this.http.get<PaymentsListResponse | ApiPayment[]>(url, { headers: this.authHeaders() }))
      .then((response) => this.normalizePaymentsList(response));
  }

  addPayment(invoiceId: string, payload: PaymentCreatePayload): Promise<InvoicePayment> {
    const url = `${this.configService.apiBaseUrl}/api/invoices/${encodeURIComponent(invoiceId)}/payments`;
    return firstValueFrom(this.http.post<PaymentResponse | ApiPayment>(url, payload, { headers: this.authHeaders() }))
      .then((response) => this.normalizePayment(response));
  }

  removePayment(invoiceId: string, paymentId: string): Promise<void> {
    const url = `${this.configService.apiBaseUrl}/api/invoices/${encodeURIComponent(invoiceId)}/payments/${encodeURIComponent(paymentId)}`;
    return firstValueFrom(this.http.delete<void>(url, { headers: this.authHeaders() }))
      .then(() => undefined);
  }

  downloadPdf(invoiceId: string): Promise<Blob> {
    const url = `${this.configService.apiBaseUrl}/api/invoices/${encodeURIComponent(invoiceId)}/pdf`;
    return firstValueFrom(this.http.get(url, { headers: this.authHeaders(), responseType: 'blob' }));
  }

  private normalizeInvoice(response: InvoiceResponse | ApiInvoice, fallback?: CreateInvoicePayload): Invoice {
    const invoice = this.extractInvoice(response);
    const rawDefaultTaxRate = invoice.defaultTaxRate ?? invoice.taxRate ?? fallback?.defaultTaxRate ?? 0;
    const defaultTaxRate = rawDefaultTaxRate <= 1 ? rawDefaultTaxRate * 100 : rawDefaultTaxRate;
    const items = invoice.items ?? fallback?.items ?? [];
    const lines = items.map((item, index) => ({
      id: String(index + 1),
      description: item.label,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
      taxRate: item.taxRate === undefined ? undefined : (item.taxRate <= 1 ? item.taxRate * 100 : item.taxRate),
      articleId: item.articleId
    }));
    const subtotal = invoice.subtotal ?? lines.reduce((sum, line) => sum + line.total, 0);
    const taxAmount = invoice.taxAmount ?? subtotal * (defaultTaxRate / 100);
    const total = invoice.total ?? subtotal + taxAmount;
    const rawStatus = (invoice.status ?? fallback?.status ?? 'unpaid') as string;
    const normalizedStatus = rawStatus.toLowerCase() as Invoice['status'];
    return {
      id: invoice.id ?? Date.now().toString(),
      number: invoice.number ?? '',
      client: invoice.client,
      clientId: invoice.clientId ?? fallback?.clientId ?? '',
      clientName: invoice.clientName ?? invoice.client?.name,
      title: invoice.title ?? fallback?.title ?? '',
      date: invoice.invoiceDate
        ? new Date(invoice.invoiceDate)
        : invoice.date
          ? new Date(invoice.date)
          : new Date(),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(),
      lines,
      subtotal,
      defaultTaxRate,
      taxAmount,
      total,
      paidAmount: invoice.paidAmount ?? 0,
      status: normalizedStatus,
      paymentMethod: invoice.paymentMethod as Invoice['paymentMethod'],
      notes: invoice.note ?? fallback?.note,
      createdAt: invoice.createdAt ? new Date(invoice.createdAt) : new Date(),
      updatedAt: invoice.updatedAt ? new Date(invoice.updatedAt) : new Date()
    };
  }

  private extractInvoice(response: InvoiceResponse | ApiInvoice): ApiInvoice {
    if (this.isInvoiceResponse(response)) {
      return response.data ?? response.invoice ?? {};
    }
    return response;
  }

  private normalizeList(
    response: InvoicesListResponse | ApiInvoice[]
  ): { invoices: Invoice[]; total?: number; totalInvoicesAmount?: number; totalPaidAmount?: number } {
    const list = Array.isArray(response)
      ? response
      : response.data ?? response.invoices ?? [];
    const invoices = list.map((invoice) => this.normalizeInvoice(invoice));
    const total = !Array.isArray(response) ? response.meta?.total : undefined;
    const totalInvoicesAmount = !Array.isArray(response) ? response.meta?.totalInvoicesAmount : undefined;
    const totalPaidAmount = !Array.isArray(response) ? response.meta?.totalPaidAmount : undefined;
    return { invoices, total, totalInvoicesAmount, totalPaidAmount };
  }

  private upsertInvoice(invoice: Invoice) {
    this.invoicesSignal.update((invoices) => {
      const index = invoices.findIndex(i => i.id === invoice.id);
      if (index === -1) {
        return [...invoices, invoice];
      }
      const updated = [...invoices];
      updated[index] = invoice;
      return updated;
    });
  }

  private isInvoiceResponse(response: InvoiceResponse | ApiInvoice): response is InvoiceResponse {
    return 'data' in response || 'invoice' in response;
  }

  private normalizePaymentsList(response: PaymentsListResponse | ApiPayment[]): InvoicePayment[] {
    const list = Array.isArray(response)
      ? response
      : response.data ?? response.payments ?? [];
    return list.map((payment) => this.normalizePayment(payment));
  }

  private normalizePayment(response: PaymentResponse | ApiPayment): InvoicePayment {
    const payment = this.extractPayment(response);
    return {
      id: payment.id ?? Date.now().toString(),
      amount: payment.amount ?? 0,
      method: payment.method,
      paidAt: payment.paidAt ? new Date(payment.paidAt) : new Date(),
      reference: payment.reference,
      note: payment.note,
      createdAt: payment.createdAt ? new Date(payment.createdAt) : undefined
    };
  }

  private extractPayment(response: PaymentResponse | ApiPayment): ApiPayment {
    if (this.isPaymentResponse(response)) {
      return response.data ?? response.payment ?? {};
    }
    return response;
  }

  private isPaymentResponse(response: PaymentResponse | ApiPayment): response is PaymentResponse {
    return 'data' in response || 'payment' in response;
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.accessToken();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
