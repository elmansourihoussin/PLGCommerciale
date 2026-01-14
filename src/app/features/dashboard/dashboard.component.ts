import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardOverview, RevenueByMonthEntry } from '../../core/services/dashboard.service';
import { QuoteService } from '../../core/services/quote.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { ClientService } from '../../core/services/client.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p class="mt-1 text-sm text-gray-600">Bienvenue sur votre espace de gestion</p>
        </div>

        <div class="mt-4 sm:mt-0 flex flex-wrap gap-3">
          <a routerLink="/quotes/new" class="btn-primary">
            <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouveau devis
          </a>
          <a routerLink="/invoices/new" class="btn-secondary">
            <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouvelle facture
          </a>
          <a routerLink="/clients/new" class="btn-outline">
            <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouveau client
          </a>
        </div>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error() }}
        </div>
      }

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card">
          <p class="text-sm text-gray-600">Clients actifs</p>
          <p class="mt-2 text-3xl font-bold text-gray-900">{{ overview()?.clientsActive ?? 0 }}</p>
        </div>
        <div class="card relative">
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-600">{{ quoteTitle() }}</p>
            <button type="button" class="text-gray-500 hover:text-gray-700" (click)="toggleQuoteMenu()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6h.01M12 12h.01M12 18h.01"/>
              </svg>
            </button>
          </div>
          <p class="mt-2 text-3xl font-bold text-gray-900">{{ quoteCount() }}</p>

          @if (quoteMenuOpen()) {
            <div class="absolute right-4 top-10 z-10 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
              @for (status of quoteStatusOptions; track status.value) {
                <button
                  type="button"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  (click)="selectQuoteStatus(status.value)"
                >
                  {{ status.label }}
                </button>
              }
            </div>
          }
        </div>
        <div class="card relative">
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-600">{{ invoiceTitle() }}</p>
            <button type="button" class="text-gray-500 hover:text-gray-700" (click)="toggleInvoiceMenu()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6h.01M12 12h.01M12 18h.01"/>
              </svg>
            </button>
          </div>
          <p class="mt-2 text-3xl font-bold text-gray-900">{{ invoiceCount() }}</p>

          @if (invoiceMenuOpen()) {
            <div class="absolute right-4 top-10 z-10 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
              @for (status of invoiceStatusOptions; track status.value) {
                <button
                  type="button"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  (click)="selectInvoiceStatus(status.value)"
                >
                  {{ status.label }}
                </button>
              }
            </div>
          }
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <div class="space-y-1">
              <h2 class="text-lg font-semibold text-gray-900">Revenus mensuels</h2>
              <p class="text-xs text-gray-500">Jan–Jun, total par mois</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-600">Année</span>
              <select
                class="input py-1 text-sm"
                [value]="revenueYearSelected() ?? ''"
                (change)="onRevenueYearChange($event)"
              >
                <option value="" disabled>Sélectionner une année</option>
                @for (year of revenueYearOptions(); track year) {
                  <option [value]="year">{{ year }}</option>
                }
              </select>
            </div>
          </div>
          @if (revenueError()) {
            <p class="text-sm text-red-600">{{ revenueError() }}</p>
          } @else if (revenueLoading()) {
            <p class="text-sm text-gray-500">Chargement des revenus...</p>
          } @else if (hasRevenue()) {
            <div class="relative h-64 pl-16">
              <div class="absolute inset-0 flex flex-col justify-between pl-16 pr-2">
                @for (tick of revenueAxisTicks(); track $index) {
                  <div class="border-t border-gray-100"></div>
                }
              </div>
              <div class="absolute left-0 top-0 bottom-0 flex w-14 flex-col justify-between text-xs text-gray-500 pr-3">
                @for (label of revenueAxisLabels(); track $index) {
                  <span>{{ label }}</span>
                }
              </div>
              <div class="absolute inset-0 flex items-end justify-between gap-4 pl-16 pr-2 pb-1">
                @for (month of monthlyRevenue(); track month.name) {
                  <div class="flex-1 flex flex-col items-center h-full">
                    <div class="w-full flex-1 flex items-end">
                      <div
                        class="w-3/4 rounded-t transition-colors cursor-pointer"
                        [ngClass]="getRevenueBarClass(month.month, month.amount)"
                        [style.height.%]="getRevenueBarHeight(month.amount)"
                        [attr.title]="month.amount + ' MAD'"
                      ></div>
                    </div>
                    <span class="mt-3 text-xs text-gray-600">{{ month.name }}</span>
                  </div>
                }
              </div>
            </div>
          } @else {
            <p class="text-sm text-gray-500">Aucun revenu pour {{ revenueYear() }}.</p>
          }
        </div>

        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Factures récentes</h2>
            <a routerLink="/invoices" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Voir tout
            </a>
          </div>
          <div class="space-y-3">
            @for (invoice of recentInvoices(); track invoice.id) {
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ invoice.clientName }}</p>
                  <p class="text-sm text-gray-600">{{ invoice.number }}</p>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-gray-900">{{ invoice.total }} MAD</p>
                  <span [class]="getStatusBadgeClass(invoice.status)">
                    {{ getStatusLabel(invoice.status) }}
                  </span>
                </div>
              </div>
            } @empty {
              <p class="text-sm text-gray-500">Aucune facture récente</p>
            }
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Devis en attente</h2>
          <a routerLink="/quotes" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Voir tout
          </a>
        </div>
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>N° Devis</th>
                <th>Client</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (quote of pendingQuotes(); track quote.id) {
                <tr class="hover:bg-gray-50">
                  <td class="font-medium">{{ quote.number }}</td>
                  <td>{{ quote.clientName }}</td>
                  <td>{{ formatDate(quote.date) }}</td>
                  <td class="font-semibold">{{ quote.total }} MAD</td>
                  <td>
                    <span [class]="getStatusBadgeClass(quote.status)">
                      {{ getStatusLabel(quote.status) }}
                    </span>
                  </td>
                  <td>
                    <a [routerLink]="['/quotes', quote.id]" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Voir
                    </a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center text-gray-500 py-8">
                    Aucun devis en attente
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  overview = signal<DashboardOverview | null>(null);
  loading = signal(false);
  error = signal('');
  revenueYear = signal(new Date().getFullYear());
  revenueYearSelected = signal<number | null>(null);
  revenueByMonth = signal<RevenueByMonthEntry[]>([]);
  revenueLoading = signal(false);
  revenueError = signal('');
  invoiceStatus = signal<'all' | 'paid' | 'unpaid' | 'partially_paid' | 'overdue'>('all');
  invoiceMenuOpen = signal(false);
  quoteStatus = signal<'all' | 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'>('all');
  quoteMenuOpen = signal(false);

  invoiceStatusOptions = [
    { value: 'all' as const, label: 'Toutes les factures' },
    { value: 'paid' as const, label: 'Factures payées' },
    { value: 'unpaid' as const, label: 'Factures impayées' },
    { value: 'partially_paid' as const, label: 'Factures partiellement payées' },
    { value: 'overdue' as const, label: 'Factures en retard' }
  ];

  quoteStatusOptions = [
    { value: 'all' as const, label: 'Tous les devis' },
    { value: 'draft' as const, label: 'Devis brouillons' },
    { value: 'sent' as const, label: 'Devis envoyés' },
    { value: 'accepted' as const, label: 'Devis acceptés' },
    { value: 'rejected' as const, label: 'Devis rejetés' },
    { value: 'expired' as const, label: 'Devis expirés' }
  ];

  constructor(
    private dashboardService: DashboardService,
    private quoteService: QuoteService,
    private invoiceService: InvoiceService,
    private clientService: ClientService
  ) {}

  async ngOnInit() {
    this.loading.set(true);
    this.error.set('');
    try {
      const year = this.revenueYear();
      const overview = await this.dashboardService.getOverview();
      this.overview.set(overview);
    } catch (err) {
      this.error.set('Impossible de charger les données du dashboard');
    } finally {
      const year = this.revenueYear();
      await Promise.allSettled([
        this.loadRevenue(year),
        this.invoiceService.list({ page: 1, limit: 5 }),
        this.quoteService.list({ page: 1, limit: 5, status: 'sent' }),
        this.clientService.list()
      ]);
      this.loading.set(false);
    }
  }

  invoiceTitle = computed(() => {
    const status = this.invoiceStatus();
    if (status === 'all') return 'Factures';
    const labels: Record<string, string> = {
      paid: 'Factures payées',
      unpaid: 'Factures impayées',
      partially_paid: 'Factures partiellement payées',
      overdue: 'Factures en retard'
    };
    return labels[status] || 'Factures';
  });

  invoiceCount = computed(() => {
    const data = this.overview();
    if (!data) return 0;
    const status = this.invoiceStatus();
    if (status === 'all') {
      return data.invoicesTotal ?? 0;
    }
    return data.invoicesByStatus?.[status] ?? 0;
  });

  quoteTitle = computed(() => {
    const status = this.quoteStatus();
    if (status === 'all') return 'Devis';
    const labels: Record<string, string> = {
      draft: 'Devis brouillons',
      sent: 'Devis envoyés',
      accepted: 'Devis acceptés',
      rejected: 'Devis rejetés',
      expired: 'Devis expirés'
    };
    return labels[status] || 'Devis';
  });

  quoteCount = computed(() => {
    const data = this.overview();
    if (!data) return 0;
    const status = this.quoteStatus();
    if (status === 'all') {
      return data.quotesTotal ?? 0;
    }
    return data.quotesByStatus?.[status] ?? 0;
  });

  toggleInvoiceMenu() {
    this.invoiceMenuOpen.set(!this.invoiceMenuOpen());
  }

  selectInvoiceStatus(status: 'all' | 'paid' | 'unpaid' | 'partially_paid' | 'overdue') {
    this.invoiceStatus.set(status);
    this.invoiceMenuOpen.set(false);
  }

  toggleQuoteMenu() {
    this.quoteMenuOpen.set(!this.quoteMenuOpen());
  }

  selectQuoteStatus(status: 'all' | 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired') {
    this.quoteStatus.set(status);
    this.quoteMenuOpen.set(false);
  }

  monthlyRevenue = computed(() => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
    const byMonth = new Map<number, number>();
    for (const entry of this.revenueByMonth()) {
      byMonth.set(entry.month, entry.total);
    }
    return months.map((name, index) => ({
      name,
      month: index + 1,
      amount: byMonth.get(index + 1) ?? 0
    }));
  });

  maxRevenue = computed(() => {
    return Math.max(1, ...this.monthlyRevenue().map(m => m.amount)) + 50;
  });

  hasRevenue = computed(() => {
    return this.monthlyRevenue().some(m => m.amount > 0);
  });

  revenueYearOptions = computed(() => {
    const currentYear = new Date().getFullYear();
    const selectedYear = this.revenueYear();
    const minYear = Math.min(currentYear - 3, selectedYear);
    const maxYear = Math.max(currentYear + 1, selectedYear);
    const years: number[] = [];
    for (let year = minYear; year <= maxYear; year += 1) {
      years.push(year);
    }
    return years;
  });

  async onRevenueYearChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (!value) {
      this.revenueYearSelected.set(null);
      return;
    }
    const year = Number(value);
    if (!Number.isFinite(year)) return;
    this.revenueYear.set(year);
    this.revenueYearSelected.set(year);
    await this.loadRevenue(year);
  }

  async loadRevenue(year: number) {
    this.revenueLoading.set(true);
    this.revenueError.set('');
    try {
      const revenue = await this.dashboardService.getRevenueByMonth(year);
      this.revenueByMonth.set(revenue.data);
    } catch {
      this.revenueError.set('Impossible de charger les revenus');
      this.revenueByMonth.set([]);
    } finally {
      this.revenueLoading.set(false);
    }
  }

  getRevenueBarHeight(amount: number): number {
    if (amount <= 0) return 6;
    const ratio = amount / this.maxRevenue();
    return Math.max(12, ratio * 100);
  }

  getRevenueBarClass(month: number, amount: number): string {
    const currentMonth = new Date().getMonth() + 1;
    if (amount <= 0) {
      return 'bg-gray-200';
    }
    if (month === currentMonth) {
      return 'bg-amber-500 hover:bg-amber-600';
    }
    return 'bg-primary-500 hover:bg-primary-600';
  }

  revenueAxisLabels = computed(() => {
    const max = this.maxRevenue();
    const steps = 4;
    const labels: string[] = [];
    for (let i = steps; i >= 0; i -= 1) {
      const value = Math.round((max * i) / steps);
      labels.push(`${value.toLocaleString()} MAD`);
    }
    return labels;
  });

  revenueAxisTicks = computed(() => {
    return new Array(this.revenueAxisLabels().length).fill(0);
  });

  recentInvoices = computed(() => {
    return this.invoiceService.invoices()
      .slice()
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  });

  pendingQuotes = computed(() => {
    return this.quoteService.quotes()
      .filter(q => q.status === 'sent')
      .slice(0, 5);
  });

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      sent: 'badge-info',
      paid: 'badge-success',
      unpaid: 'badge-warning',
      overdue: 'badge-danger',
      draft: 'badge-info',
      accepted: 'badge-success',
      rejected: 'badge-danger'
    };
    return classes[status] || 'badge-info';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      sent: 'Envoyé',
      paid: 'Payé',
      unpaid: 'Impayé',
      overdue: 'En retard',
      draft: 'Brouillon',
      accepted: 'Accepté',
      rejected: 'Rejeté',
      partially_paid: 'Part. payé'
    };
    return labels[status] || status;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }
}
