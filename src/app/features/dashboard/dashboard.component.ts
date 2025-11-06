import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../../shared/components/stat-card.component';
import { QuoteService } from '../../core/services/quote.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { CheckService } from '../../core/services/check.service';
import { ClientService } from '../../core/services/client.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent],
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
          <a routerLink="/checks/new" class="btn-outline">
            <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouveau chèque
          </a>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card
          title="Devis envoyés"
          [value]="stats().totalQuotes"
          icon="document"
        />
        <app-stat-card
          title="Factures payées"
          [value]="stats().paidInvoices"
          icon="invoice"
        />
        <app-stat-card
          title="Chèques imprimés"
          [value]="stats().printedChecks"
          icon="check"
        />
        <app-stat-card
          title="Clients actifs"
          [value]="stats().totalClients"
          icon="users"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Revenus mensuels</h2>
          <div class="h-64 flex items-end justify-between space-x-2">
            @for (month of monthlyRevenue(); track month.name) {
              <div class="flex-1 flex flex-col items-center">
                <div
                  class="w-full bg-primary-500 rounded-t hover:bg-primary-600 transition-colors cursor-pointer"
                  [style.height.%]="(month.amount / maxRevenue()) * 100"
                ></div>
                <span class="mt-2 text-xs text-gray-600">{{ month.name }}</span>
              </div>
            }
          </div>
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
export class DashboardComponent {
  constructor(
    private quoteService: QuoteService,
    private invoiceService: InvoiceService,
    private checkService: CheckService,
    private clientService: ClientService
  ) {}

  stats = computed(() => {
    const quotes = this.quoteService.quotes();
    const invoices = this.invoiceService.invoices();
    const checks = this.checkService.checks();
    const clients = this.clientService.clients();

    return {
      totalQuotes: quotes.filter(q => q.status === 'sent').length,
      paidInvoices: invoices.filter(i => i.status === 'paid').length,
      printedChecks: checks.filter(c => c.status === 'printed').length,
      totalClients: clients.length
    };
  });

  monthlyRevenue = computed(() => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
    return months.map((name, index) => ({
      name,
      amount: Math.floor(Math.random() * 50000) + 10000
    }));
  });

  maxRevenue = computed(() => {
    return Math.max(...this.monthlyRevenue().map(m => m.amount));
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
