import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../core/services/invoice.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Factures</h1>
        <a routerLink="/invoices/new" class="mt-4 sm:mt-0 btn-primary">
          <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouvelle facture
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="card">
          <p class="text-sm text-gray-600">Total facturé</p>
          <p class="mt-2 text-2xl font-bold text-gray-900">{{ formatAmount(stats().totalAmount) }} MAD</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-600">Reste à payer</p>
          <p class="mt-2 text-2xl font-bold text-red-600">{{ formatAmount(stats().balanceDueTotal) }} MAD</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-600">Payées</p>
          <p class="mt-2 text-2xl font-bold text-green-600">{{ stats().paidCount }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-600">Impayées</p>
          <p class="mt-2 text-2xl font-bold text-orange-600">{{ stats().unpaidCount }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-600">En retard</p>
          <p class="mt-2 text-2xl font-bold text-red-600">{{ stats().overdueCount }}</p>
        </div>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error() }}
        </div>
      }

      <div class="card">
        <div class="flex flex-col sm:flex-row gap-4 mb-6">
          <div class="flex-1">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange()"
              placeholder="Rechercher par client ou numéro..."
              class="input"
            />
          </div>
          <select [(ngModel)]="filterStatus" (ngModelChange)="onFilterChange()" class="input sm:w-48">
            <option value="">Tous les statuts</option>
            <option value="paid">Payée</option>
            <option value="unpaid">Impayée</option>
            <option value="partially_paid">Partiellement payée</option>
            <option value="overdue">En retard</option>
          </select>
        </div>

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Client</th>
                <th>Échéance</th>
                <th>Montant</th>
                <th>Payé</th>
                <th>Reste</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @if (loading()) {
                <tr>
                  <td colspan="8" class="text-center text-gray-500 py-8">
                    Chargement des factures...
                  </td>
                </tr>
              } @else {
                @for (invoice of filteredInvoices(); track invoice.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="font-medium">{{ invoice.number }}</td>
                    <td>{{ getShortClientName(invoice.client?.name ?? invoice.clientName) }}</td>
                    <td>{{ formatDate(invoice.dueDate) }}</td>
                    <td class="font-semibold">{{ formatAmount(invoice.total) }} MAD</td>
                    <td>{{ formatAmount(invoice.paidAmount) }} MAD</td>
                    <td>{{ formatAmount(getBalanceDue(invoice)) }} MAD</td>
                    <td>
                      <span [class]="getStatusBadgeClass(invoice.status)">
                        {{ getStatusLabel(invoice.status) }}
                      </span>
                    </td>
                    <td>
                      <div class="flex items-center space-x-3">
                        <a [routerLink]="['/invoices', invoice.id]" class="text-primary-600 hover:text-primary-700">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </a>
                        <a [routerLink]="['/invoices', invoice.id]" class="text-primary-600 hover:text-primary-700" title="Paiements">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v2m14 0H7a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h4"/>
                          </svg>
                        </a>
                        <a [routerLink]="['/invoices', invoice.id, 'edit']" class="text-gray-600 hover:text-gray-900">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </a>
                        <button (click)="deleteInvoice(invoice.id)" class="text-red-600 hover:text-red-700">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="text-center text-gray-500 py-8">
                      Aucune facture trouvée
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between pt-4">
          <p class="text-sm text-gray-600">
            Page {{ page() }} sur {{ totalPages() }}
          </p>
          <div class="flex items-center space-x-2">
            <button
              type="button"
              class="btn-secondary"
              [disabled]="page() <= 1 || loading()"
              (click)="goToPage(page() - 1)"
            >
              Précédent
            </button>
            <button
              type="button"
              class="btn-secondary"
              [disabled]="page() >= totalPages() || loading()"
              (click)="goToPage(page() + 1)"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InvoiceListComponent implements OnInit {
  searchTerm = signal('');
  filterStatus = signal('');
  loading = signal(false);
  error = signal('');
  page = signal(1);
  pageSize = signal(10);

  constructor(private invoiceService: InvoiceService) {}

  async ngOnInit() {
    await this.loadInvoices();
  }

  stats = computed(() => {
    const invoices = this.invoiceService.invoices();
    const totalInvoicesAmount = this.invoiceService.totalInvoicesAmount();
    const totalPaidAmount = this.invoiceService.totalPaidAmount();
    const paidTotal = totalPaidAmount ?? invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const invoicesTotal = totalInvoicesAmount ?? invoices.reduce((sum, inv) => sum + inv.total, 0);
    return {
      totalAmount: invoicesTotal,
      totalPaidAmount: paidTotal,
      balanceDueTotal: Math.max(0, invoicesTotal - paidTotal),
      paidCount: invoices.filter(inv => inv.status === 'paid').length,
      unpaidCount: invoices.filter(inv => inv.status === 'unpaid').length,
      overdueCount: invoices.filter(inv => inv.status === 'overdue').length
    };
  });

  filteredInvoices = computed(() => {
    return this.invoiceService.invoices()
      .slice()
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  onSearchChange() {
    this.searchTerm.set(this.searchTerm());
    this.page.set(1);
    this.loadInvoices();
  }

  onFilterChange() {
    this.filterStatus.set(this.filterStatus());
    this.page.set(1);
    this.loadInvoices();
  }

  async loadInvoices() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.invoiceService.list({
        page: this.page(),
        limit: this.pageSize(),
        search: this.searchTerm() || undefined,
        status: this.filterStatus() || undefined
      });
    } catch (err) {
      this.error.set('Impossible de charger les factures');
    } finally {
      this.loading.set(false);
    }
  }

  async goToPage(page: number) {
    if (page < 1) return;
    this.page.set(page);
    await this.loadInvoices();
  }

  deleteInvoice(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      this.invoiceService.delete(id).catch(() => {
        this.error.set('Impossible de supprimer la facture');
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      paid: 'badge-success',
      unpaid: 'badge-warning',
      partially_paid: 'badge-info',
      overdue: 'badge-danger'
    };
    return classes[status] || 'badge-info';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      paid: 'Payée',
      unpaid: 'Impayée',
      partially_paid: 'Part. payée',
      overdue: 'En retard'
    };
    return labels[status] || status;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }

  getShortClientName(name?: string): string {
    if (!name) return '—';
    if (name.length <= 10) return name;
    return `${name.slice(0, 10)}...`;
  }

  getBalanceDue(invoice: { total: number; paidAmount: number }): number {
    return Math.max(0, invoice.total - invoice.paidAmount);
  }

  formatAmount(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  totalPages = computed(() => {
    const total = this.invoiceService.totalCount();
    const size = this.pageSize();
    if (!total || size <= 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(total / size));
  });
}
